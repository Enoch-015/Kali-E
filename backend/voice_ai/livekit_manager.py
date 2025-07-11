import os
import logging
import asyncio
import aiohttp
# import sounddevice as sd
from dotenv import load_dotenv

from livekit.plugins.turn_detector.english import EnglishModel
from livekit.plugins import deepgram

# ──────────────────────────────────────────────────────────────────────────────
# 1) Register the OpenAI plugin immediately on import (main thread)
# ──────────────────────────────────────────────────────────────────────────────
import livekit.plugins.openai        # this runs Plugin.register_plugin(...)
from livekit.plugins import openai as lk_openai
# ──────────────────────────────────────────────────────────────────────────────

from livekit import rtc, agents
from livekit.agents import AgentSession, Agent, RoomInputOptions

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

INSTRUCTIONS = """
You are Kali-E, a helpful voice assistant. 
You respond with clear, concise information.
You are polite, intelligent, and eager to help.
"""
WELCOME_MESSAGE = "Hello, I'm Kali-E, your voice assistant. How can I help you today?"

try:
    from prompts import INSTRUCTIONS, WELCOME_MESSAGE
    logger.info("Loaded prompts from prompts.py")
except ImportError:
    logger.warning("Could not import prompts.py, using defaults")


# def init_audio_devices():
#     """Initialize and select audio devices at runtime."""
#     try:
#         devices = sd.query_devices()
#         logger.info("Available audio devices:")
#         for i, d in enumerate(devices):
#             kinds = []
#             if d['max_input_channels'] > 0:
#                 kinds.append("Input")
#             if d['max_output_channels'] > 0:
#                 kinds.append("Output")
#             logger.info(f"[{i}] {d['name']} — {'/'.join(kinds)}")

#         # pick defaults
#         default_in = next(i for i, d in enumerate(devices) if d['max_input_channels'] > 0)
#         default_out = next(i for i, d in enumerate(devices) if d['max_output_channels'] > 0)

#         # override via env if provided...
#         sound_dev = os.getenv("SOUND_DEVICE")
#         if sound_dev:
#             try:
#                 idx = int(sound_dev)
#             except ValueError:
#                 idx = next((i for i, d in enumerate(devices)
#                             if sound_dev.lower() in d['name'].lower()
#                             and d['max_input_channels'] > 0), default_in)
#             sd.default.device = (idx, sd.default.device[1])
#             logger.info(f"Using input device #{idx} from SOUND_DEVICE")
#         else:
#             sd.default.device = (default_in, sd.default.device[1])
#             logger.info(f"Using default input device #{default_in}")

#         sound_out = os.getenv("SOUND_OUTPUT")
#         if sound_out:
#             try:
#                 idx = int(sound_out)
#             except ValueError:
#                 idx = next((i for i, d in enumerate(devices)
#                             if sound_out.lower() in d['name'].lower()
#                             and d['max_output_channels'] > 0), default_out)
#             sd.default.device = (sd.default.device[0], idx)
#             logger.info(f"Using output device #{idx} from SOUND_OUTPUT")
#         else:
#             sd.default.device = (sd.default.device[0], default_out)
#             logger.info(f"Using default output device #{default_out}")

#         info_in = sd.query_devices(sd.default.device[0])
#         info_out = sd.query_devices(sd.default.device[1])
#         logger.info(f"Confirmed input: {info_in['name']}")
#         logger.info(f"Confirmed output: {info_out['name']}")
#     except Exception as e:
#         logger.error(f"Audio init failed: {e}")
#         logger.warning("Falling back to system audio defaults")




class KaliAssistant(Agent):
    def __init__(self):
        super().__init__(instructions=INSTRUCTIONS)
        logger.info("KaliAssistant agent initialized")


def create_livekit_token(room_name: str, participant_name: str) -> str:
    from livekit.api.access_token import AccessToken, VideoGrants

    api_key = os.getenv("LIVEKIT_API_KEY")
    api_secret = os.getenv("LIVEKIT_API_SECRET")
    if not api_key or not api_secret:
        raise ValueError("Missing LIVEKIT_API_KEY/SECRET")

    token = (
        AccessToken(api_key, api_secret)
        .with_identity(participant_name)
        .with_name(participant_name)
        .with_grants(VideoGrants(room_join=True, room=room_name))
    )
    return token.to_jwt()


active_sessions: dict[str, AgentSession] = {}


async def _setup_session(room_param) -> AgentSession:

    openai_key = os.getenv("OPENAI_API_KEY")
    livekit_url = os.getenv("LIVEKIT_URL")
    if not openai_key or not livekit_url:
        raise ValueError("Missing OPENAI_API_KEY or LIVEKIT_URL")

    # Normalize to (room_name, rtc.Room)
    if isinstance(room_param, str):
        room_name = room_param
        room = rtc.Room()
    else:
        room = room_param
        room_name = room.name

    # Generate and connect
    token = create_livekit_token(room_name, f"agent-{room_name}")
    await asyncio.wait_for(
        room.connect(livekit_url, token),
        timeout=float(os.getenv("ROOM_CONNECT_TIMEOUT", "60.0"))
    )
    logger.info(f"Connected to LiveKit room '{room_name}'")

    http_session = aiohttp.ClientSession()

    # We imported lk_openai at top, so it’s available here:
    llm = lk_openai.realtime.RealtimeModel(
        api_key=openai_key,
        model=os.getenv("OPENAI_REALTIME_MODEL", "gpt-4o-realtime-preview"),
        voice=os.getenv("OPENAI_VOICE", "alloy"),
        http_session=http_session,
    )
    tts = lk_openai.TTS(
        model=os.getenv("OPENAI_TTS_MODEL", "gpt-4o-mini-tts"),
        voice=os.getenv("OPENAI_TTS_VOICE", "ash"),
        instructions=os.getenv("TTS_INSTRUCTIONS", "Speak in a friendly, conversational tone."),
    )

    session = AgentSession(
        turn_detection=EnglishModel(),
        stt=deepgram.STT(model="nova-3", language="en"),
        llm=llm, 
        tts=tts)
    await session.start(
        room=room,
        agent=KaliAssistant(),
        room_input_options=RoomInputOptions(),
    )
    await session.say(WELCOME_MESSAGE)

    active_sessions[room_name] = session
    return session


async def end_livekit_session(room_name: str, reason: str = "session ended") -> bool:
    session = active_sessions.get(room_name)
    if not session:
        return False
    await session.shutdown(reason=reason)
    del active_sessions[room_name]
    return True


async def send_message_to_session(room_name: str, message: str) -> bool:
    session = active_sessions.get(room_name)
    if not session:
        session = await _setup_session(room_name)
    await session.generate_reply(message)
    return True


async def entrypoint(ctx: agents.JobContext):
    """Called by the livekit-agents CLI on the main thread."""
    logger.info(f"Entrypoint for room: {ctx.room.name}")
    await ctx.connect()
    await _setup_session(ctx.room.name)


if __name__ == "__main__":
    logger.info("Starting LiveKit agent worker")
    agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))

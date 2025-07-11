import os
import uuid
import logging
import asyncio

from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from asgiref.sync import async_to_sync

from livekit.api import LiveKitAPI, ListRoomsRequest
from livekit.api.access_token import AccessToken, VideoGrants

from .models import Session, Transcript
from .serializers import (
    SessionSerializer,
    TranscriptSerializer,
)
from .livekit_manager import (
    create_livekit_token,
    _setup_session,
    end_livekit_session,
    send_message_to_session
)

logger = logging.getLogger(__name__)


@api_view(['GET'])
def health_check(request):
    return Response({"status": "ok"}, status=status.HTTP_200_OK)


# -------------------------------------------------------------------
# 1) SESSION-BASED ENDPOINTS (your existing flow)
# -------------------------------------------------------------------

@api_view(['GET', 'POST'])
def session_list(request):
    if request.method == 'GET':
        serializer = SessionSerializer(Session.objects.all(), many=True)
        return Response(serializer.data)

    # POST → create a new Session + one-shot token for the browser
    room_name = f"room-{uuid.uuid4().hex[:8]}"
    session = Session.objects.create(room_name=room_name, is_active=True)
    participant_id = f"user-{uuid.uuid4().hex[:8]}"

    try:
        token = create_livekit_token(room_name, participant_id)
        data = SessionSerializer(session).data
        data.update({
            'token': token,
            'participant_id': participant_id,
        })
        return Response(data, status=status.HTTP_201_CREATED)
    except Exception as e:
        logger.error(f"Failed to create session token: {e}")
        session.delete()
        return Response(
            {"error": "Failed to create session token"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET', 'DELETE'])
def session_detail(request, session_id):
    try:
        session = Session.objects.get(pk=session_id)
    except Session.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(SessionSerializer(session).data)

    # DELETE → shut down the agent then delete
    if session.is_active:
        try:
            async_to_sync(end_livekit_session)(session.room_name)
        except Exception as e:
            logger.error(f"Error ending LiveKit session: {e}")

    session.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
def start_session(request, session_id):
    try:
        session = Session.objects.get(pk=session_id)
    except Session.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    session.is_active = True
    session.save()

    try:
        logger.info(f"Starting LiveKit session for {session.room_name}")
        async_to_sync(_setup_session)(session.room_name)
        return Response({'status': 'started'}, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Failed to start LiveKit session: {e}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
def end_session(request, session_id):
    try:
        session = Session.objects.get(pk=session_id)
    except Session.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    try:
        success = async_to_sync(end_livekit_session)(session.room_name)
        session.is_active = False
        session.save()
        return Response({'status': 'ended'}, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error ending session: {e}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
def send_message(request, session_id):
    try:
        session = Session.objects.get(pk=session_id)
    except Session.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    msg = request.data.get('message')
    if not msg:
        return Response({'error': 'No message provided'}, status=status.HTTP_400_BAD_REQUEST)

    Transcript.objects.create(session=session, user_message=msg)

    if not session.is_active:
        return Response({'error': 'Session not active'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        success = async_to_sync(send_message_to_session)(session.room_name, msg)
        if success:
            return Response({'status': 'sent'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Failed to send to agent'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        logger.error(f"Error sending message: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



# -------------------------------------------------------------------
# 2) ON-DEMAND TOKEN ENDPOINT (Flask-inspired)
# -------------------------------------------------------------------

async def _generate_room_name() -> str:
    api = LiveKitAPI()
    resp = await api.room.list_rooms(ListRoomsRequest())
    await api.aclose()
    existing = {r.name for r in resp.rooms}

    name = f"room-{uuid.uuid4().hex[:8]}"
    while name in existing:
        name = f"room-{uuid.uuid4().hex[:8]}"
    return name


@api_view(['GET'])
def get_token(request):
    """
    Query params:
      - name=desired_identity       (defaults to anon-XXXX)
      - room=existing_room_name     (optional)
    """
    # 1️⃣ pick or generate identity & room
    user_name = request.query_params.get("name") or f"anon-{uuid.uuid4().hex[:4]}"
    room_name = request.query_params.get("room")
    if not room_name:
        try:
            # run our async generator in this sync view
            room_name = asyncio.run(_generate_room_name())
        except Exception:
            room_name = f"room-{uuid.uuid4().hex[:8]}"

    # 2️⃣ build LiveKit JWT
    api_key    = os.getenv("LIVEKIT_API_KEY")
    api_secret = os.getenv("LIVEKIT_API_SECRET")
    if not api_key or not api_secret:
        logger.error("Missing LiveKit credentials")
        return Response(
            {"error": "Server misconfigured"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    token = (
        AccessToken(api_key, api_secret)
        .with_identity(user_name)
        .with_name(user_name)
        .with_grants(VideoGrants(room_join=True, room=room_name))
    ).to_jwt()

    # 3️⃣ return the JWT **and** the URL so the client can connect
    return Response({
        "token":    token,
        "identity": user_name,
        "room":     room_name,
        "url":      os.getenv("LIVEKIT_URL", ""),  # ← new field
    }, status=status.HTTP_200_OK)

"use client"

import React, { useState, useRef, useEffect } from "react"
import { toast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, Upload, X, AlertCircle } from "lucide-react"
import axios from "axios"
import {
  Room,
  RemoteParticipant,
  Track,
  createLocalAudioTrack,
  RoomEvent,
  LocalAudioTrack,
} from "livekit-client"

import { Button } from "@/components/ui/button"
import AnimatedBlob from "@/components/animated-blob"

interface Session {
  id: string
  room_name: string
  token: string
  participant_id: string
  agent_identity?: string
}

interface UploadedFile {
  id: string
  name: string
  mime_type: string
  size: number
  uploaded_at: string
  file: string
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  headers: { "Content-Type": "application/json" },
})
api.interceptors.response.use(
  resp => resp,
  err => {
    console.error("API Error:", err.response || err)
    return Promise.reject(err)
  }
)

export default function AssistantPage() {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isUsingTools, setIsUsingTools] = useState(false)
  const [message, setMessage] = useState("Start a new chat with Kali-E")
  const [isProcessing, setIsProcessing] = useState(false)

  const [currentSession, setCurrentSession] = useState<Session | null>(null)
  const [agentId, setAgentId] = useState<string | null>(null)
  const sessionIdRef = useRef<string | null>(null)
  const [room, setRoom] = useState<Room | null>(null)
  const micTrackRef = useRef<LocalAudioTrack | null>(null)

  const createSession = async () => {
    setIsProcessing(true)
    try {
      // 1️⃣ fetch token + room from our new endpoint
      setMessage("Fetching LiveKit token…")
      const resp = await api.get<{
        token: string
        identity: string
        room: string
        url: string
      }>("/get_token/", {
        params: { name: `user-${Math.random().toString(36).slice(2, 6)}` },
      })
      const { token, identity, room: roomName, url } = resp.data
      setAgentId(identity)

      // 2️⃣ Validate URL
      setMessage(`Joining ${roomName}…`)
      const LIVEKIT_URL = url || process.env.NEXT_PUBLIC_LIVEKIT_URL
      if (!LIVEKIT_URL || !LIVEKIT_URL.startsWith("ws")) {
        throw new Error(
          "Missing or invalid LIVEKIT_URL (must be ws:// or wss://)"
        )
      }

      // 3️⃣ Connect
      const lkRoom = new Room()
      await lkRoom.connect(LIVEKIT_URL, token)
      setRoom(lkRoom)

      // 4️⃣ Publish mic
      setMessage("Publishing microphone…")
      const micTrack = await createLocalAudioTrack()
      micTrackRef.current = micTrack
      await lkRoom.localParticipant.publishTrack(micTrack)

      // 5️⃣ Subscribe to agent audio
      lkRoom.on(
        RoomEvent.TrackSubscribed,
        (track: Track, _pub, participant: RemoteParticipant) => {
          const isAgent = participant.identity === `agent-${roomName}`
          if (track.kind === "audio" && isAgent) {
            const audioEl = track.attach()
            audioEl.style.display = "none"
            document.body.appendChild(audioEl)
            track.on("muted", () => setIsSpeaking(false))
            track.on("unmuted", () => setIsSpeaking(true))
          }
        }
      )

      setMessage("Session ready! Tap the mic to talk.")
    } catch (error) {
      console.error("Session creation error:", error)
      setMessage("Failed to start session. Try reloading.")
      toast({
        title: "Connection Error",
        description: "Could not connect to voice service",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  useEffect(() => {
    const setupAudio = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true })
        createSession()
      } catch (err) {
        console.error("Microphone access denied:", err)
        setMessage("Microphone access required. Please allow and reload.")
        toast({
          title: "Microphone Access Denied",
          description: "Kali-E needs microphone access to work properly",
          variant: "destructive",
          duration: 5000,
        })
      }
    }
    setupAudio()

    return () => {
      room?.disconnect()
      micTrackRef.current?.stop()
    }
  }, [])

  const toggleListening = async () => {
    if (!room || isProcessing) {
      toast({
        title: "Not ready",
        description: "Voice service is not ready yet",
        duration: 3000,
      })
      return
    }
    if (isListening) {
      micTrackRef.current?.stop()
      setIsListening(false)
      setMessage("Tap the mic to talk again")
    } else {
      try {
        const micTrack = await createLocalAudioTrack()
        micTrackRef.current?.stop()
        micTrackRef.current = micTrack
        await room.localParticipant.publishTrack(micTrack)

        setIsListening(true)
        setMessage("Listening…")

        const audioContext = new AudioContext()
        const oscillator = audioContext.createOscillator()
        oscillator.type = "sine"
        oscillator.frequency.setValueAtTime(
          880,
          audioContext.currentTime
        )

        const gainNode = audioContext.createGain()
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(
          0.001,
          audioContext.currentTime + 0.3
        )

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        oscillator.start()
        oscillator.stop(audioContext.currentTime + 0.3)
      } catch (err) {
        console.error("Error accessing microphone:", err)
        toast({
          title: "Microphone Error",
          description: "Could not access your microphone",
          variant: "destructive",
          duration: 3000,
        })
        setMessage("Microphone access error. Check permissions.")
      }
    }
  }

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    // …your existing file‐upload logic…
  }

  const resetChat = async () => {
    // …your existing reset logic…
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/20 to-black pointer-events-none" />
      <div className="flex-1 flex items-center justify-center w-full">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          className="relative"
        >
          <AnimatedBlob
            isAnimating={isSpeaking}
            isUsingTools={isUsingTools}
          />
        </motion.div>
      </div>
      <div className="mb-4 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={message}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex items-center space-x-1"
          >
            {isProcessing && (
              <AlertCircle className="w-4 h-4 text-red-500 animate-pulse" />
            )}
            <p className="text-sm text-gray-400">{message}</p>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="mb-12 flex items-center justify-center space-x-4 z-10">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleListening}
          disabled={isProcessing}
          className={`h-16 w-16 rounded-full bg-zinc-900/80 border-zinc-800/50 backdrop-blur-md ${
            isListening ? "bg-zinc-800 border-white/20" : ""
          }`}
        >
          <Mic
            className={`h-6 w-6 ${
              isListening ? "text-white" : "text-gray-300"
            }`}
          />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => document.getElementById("upload-input")?.click()}
          disabled={isProcessing}
          className="h-16 w-16 rounded-full bg-zinc-900/80 border-zinc-800/50 backdrop-blur-md"
        >
          <Upload className="h-6 w-6 text-gray-300" />
          <input
            id="upload-input"
            type="file"
            multiple
            className="hidden"
            onChange={handleFileUpload}
          />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={resetChat}
          disabled={isProcessing}
          className="h-16 w-16 rounded-full bg-zinc-900/80 border-zinc-800/50 backdrop-blur-md"
        >
          <X className="h-6 w-6 text-gray-300" />
        </Button>
      </div>
    </main>
  )
}

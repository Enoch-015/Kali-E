"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, Upload, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useMobile } from "@/hooks/use-mobile"
import AnimatedBlob from "@/components/animated-blob"

export default function AssistantPage() {
  const router = useRouter()
  const isMobile = useMobile()
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isUsingTools, setIsUsingTools] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [message, setMessage] = useState("Start a new chat with Kali-E")
  const [showMessage, setShowMessage] = useState(true)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Toggle listening state
  const toggleListening = () => {
    if (isListening) {
      setIsListening(false)
      setShowMessage(true)
      setMessage("Voice input stopped")
      setIsSpeaking(false)
      setIsUsingTools(false)
      // In a real app, you would stop the speech recognition here
    } else {
      setIsListening(true)
      setShowMessage(true)
      setMessage("Listening...")

      // Simulate AI response after a short delay
      setTimeout(() => {
        setShowMessage(false)

        setTimeout(() => {
          // First show the "using tools" animation
          setIsUsingTools(true)
          setShowMessage(true)
          setMessage("Kali-E is searching for information...")

          // After a delay, switch to speaking animation
          setTimeout(() => {
            setIsUsingTools(false)
            setIsSpeaking(true)
            setMessage("Kali-E is responding...")

            // Simulate AI speaking for a longer time to see the animation
            setTimeout(() => {
              setIsSpeaking(false)
              setIsListening(false)
              setShowMessage(true)
              setMessage("Start a new chat with Kali-E")
            }, 5000) // Extended to 5 seconds to better see the animation
          }, 3000) // Show tools animation for 3 seconds
        }, 500)
      }, 1500)
    }
  }

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      setUploadedFiles((prev) => [...prev, ...newFiles])

      // Show toast notification
      toast({
        title: `${newFiles.length} file${newFiles.length > 1 ? "s" : ""} uploaded`,
        description: "Kali-E now has access to these files for context.",
        duration: 3000,
      })

      // Update message
      setMessage(`${newFiles.length} file${newFiles.length > 1 ? "s" : ""} added for context`)
      setTimeout(() => {
        setMessage("Start a new chat with Kali-E")
      }, 3000)
    }
  }

  // Trigger file input click
  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Reset chat
  const resetChat = () => {
    setIsListening(false)
    setIsSpeaking(false)
    setIsUsingTools(false)
    setTranscript("")
    setShowMessage(true)
    setMessage("Chat reset. Ready for a new conversation.")
    setUploadedFiles([])

    setTimeout(() => {
      setMessage("Start a new chat with Kali-E")
    }, 2000)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-black text-white relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/20 to-black pointer-events-none" />

      {/* Animated blob container */}
      <div className="flex-1 flex items-center justify-center w-full">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          className="relative"
        >
          <AnimatedBlob isAnimating={isSpeaking} isUsingTools={isUsingTools} />
        </motion.div>
      </div>

      {/* Info text */}
      <div className="mb-4 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {showMessage && (
            <motion.div
              key={message}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center"
            >
              <p className="text-sm text-gray-400">{message}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom action buttons */}
      <div className="mb-12 flex items-center justify-center space-x-4 z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleListening}
            className={`h-16 w-16 rounded-full bg-zinc-900/80 border-zinc-800/50 backdrop-blur-md ${
              isListening ? "bg-zinc-800 border-white/20" : ""
            }`}
          >
            <Mic className={`h-6 w-6 ${isListening ? "text-white" : "text-gray-300"}`} />
          </Button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Button
            variant="outline"
            size="icon"
            onClick={triggerFileUpload}
            className="h-16 w-16 rounded-full bg-zinc-900/80 border-zinc-800/50 backdrop-blur-md"
          >
            <Upload className="h-6 w-6 text-gray-300" />
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" multiple />
          </Button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Button
            variant="outline"
            size="icon"
            onClick={resetChat}
            className="h-16 w-16 rounded-full bg-zinc-900/80 border-zinc-800/50 backdrop-blur-md"
          >
            <X className="h-6 w-6 text-gray-300" />
          </Button>
        </motion.div>
      </div>
    </main>
  )
}

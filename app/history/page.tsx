"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Search, Mic } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"

// Mock conversation data
// In a real app, this would come from a database or API
const mockConversations = [
  {
    id: "conv-1",
    title: "How are you doing",
    date: new Date(2025, 4, 4, 15, 30),
    category: "yesterday",
    messages: [
      {
        id: "msg-1",
        role: "user",
        content: "How are you doing?",
        timestamp: new Date(2025, 4, 4, 15, 30),
        duration: "00:01",
      },
      {
        id: "msg-2",
        role: "assistant",
        content: "I'm doing great, thanks for asking! How about you? What's on your mind today?",
        timestamp: new Date(2025, 4, 4, 15, 30, 5),
      },
    ],
  },
  {
    id: "conv-2",
    title: "Tell me about agentic AI",
    date: new Date(2025, 4, 4, 14, 15),
    category: "yesterday",
    messages: [
      {
        id: "msg-3",
        role: "user",
        content: "Tell me about agentic AI",
        timestamp: new Date(2025, 4, 4, 14, 15),
        duration: "00:03",
      },
      {
        id: "msg-4",
        role: "assistant",
        content:
          "Agentic AI refers to AI systems that can operate autonomously and make decisions on their own, similar to how humans do. These systems can adapt to new information, learn from their environment, and perform tasks with minimal human intervention.",
        timestamp: new Date(2025, 4, 4, 14, 15, 5),
      },
      {
        id: "msg-5",
        role: "assistant",
        content:
          "In the context of Floo, it could mean implementing intelligent agents that can help automate real estate tasks, like recommending properties, scheduling viewings, or even negotiating deals based on the user's preferences and market trends. It's a fascinating area with a lot of potential!",
        timestamp: new Date(2025, 4, 4, 14, 15, 15),
      },
    ],
  },
  {
    id: "conv-3",
    title: "Install Node.js Ubuntu",
    date: new Date(2025, 4, 4, 10, 45),
    category: "yesterday",
    messages: [
      {
        id: "msg-6",
        role: "user",
        content: "How do I install Node.js on Ubuntu?",
        timestamp: new Date(2025, 4, 4, 10, 45),
        duration: "00:02",
      },
      {
        id: "msg-7",
        role: "assistant",
        content:
          "To install Node.js on Ubuntu, you can use the apt package manager. Open your terminal and run these commands:\n\n```\nsudo apt update\nsudo apt install nodejs npm\n```\n\nTo verify the installation, check the version:\n\n```\nnode --version\nnpm --version\n```\n\nAlternatively, if you need a specific version or more recent release, you can use the NodeSource repository.",
        timestamp: new Date(2025, 4, 4, 10, 45, 10),
      },
    ],
  },
  {
    id: "conv-4",
    title: "Router Typo Fix",
    date: new Date(2025, 4, 4, 9, 20),
    category: "yesterday",
    messages: [
      {
        id: "msg-8",
        role: "user",
        content: "I keep getting an error in my Next.js app about 'Router' being undefined",
        timestamp: new Date(2025, 4, 4, 9, 20),
        duration: "00:02",
      },
      {
        id: "msg-9",
        role: "assistant",
        content:
          "This error often happens when there's a typo or incorrect import for the router. In Next.js, make sure you're importing the router correctly:\n\n```jsx\nimport { useRouter } from 'next/router'; // For Pages Router\n// OR\nimport { useRouter } from 'next/navigation'; // For App Router\n```\n\nAlso check that you're calling useRouter as a hook inside your component, not outside.",
        timestamp: new Date(2025, 4, 4, 9, 20, 8),
      },
    ],
  },
  {
    id: "conv-5",
    title: "Switch frame with timeout",
    date: new Date(2025, 3, 28, 14, 30),
    category: "previous_7_days",
    messages: [
      {
        id: "msg-10",
        role: "user",
        content: "How can I switch iframes with a timeout in JavaScript?",
        timestamp: new Date(2025, 3, 28, 14, 30),
        duration: "00:02",
      },
      {
        id: "msg-11",
        role: "assistant",
        content:
          "You can switch between iframes with a timeout using setTimeout in JavaScript. Here's an example:\n\n```javascript\nfunction switchFrames(frameIds, interval) {\n  let currentIndex = 0;\n  \n  function showNextFrame() {\n    // Hide all frames\n    frameIds.forEach(id => {\n      document.getElementById(id).style.display = 'none';\n    });\n    \n    // Show current frame\n    document.getElementById(frameIds[currentIndex]).style.display = 'block';\n    \n    // Update index for next time\n    currentIndex = (currentIndex + 1) % frameIds.length;\n    \n    // Schedule next switch\n    setTimeout(showNextFrame, interval);\n  }\n  \n  // Start the rotation\n  showNextFrame();\n}\n\n// Usage\nswitchFrames(['frame1', 'frame2', 'frame3'], 5000); // Switch every 5 seconds\n```",
        timestamp: new Date(2025, 3, 28, 14, 30, 15),
      },
    ],
  },
  {
    id: "conv-6",
    title: "Install FFmpeg Windows CMD",
    date: new Date(2025, 3, 27, 11, 15),
    category: "previous_7_days",
    messages: [
      {
        id: "msg-12",
        role: "user",
        content: "How do I install FFmpeg on Windows using command line?",
        timestamp: new Date(2025, 3, 27, 11, 15),
        duration: "00:03",
      },
      {
        id: "msg-13",
        role: "assistant",
        content:
          'To install FFmpeg on Windows using the command line:\n\n1. Download the FFmpeg build from the official website or use a package manager like Chocolatey.\n\nWith Chocolatey (run in admin PowerShell):\n```\nchoco install ffmpeg\n```\n\nManual installation:\n1. Download the build from https://ffmpeg.org/download.html\n2. Extract the ZIP file\n3. Add the bin folder to your PATH environment variable:\n```\nsetx PATH "%PATH%;C:\\path\\to\\ffmpeg\\bin"\n```\n\n4. Restart your command prompt and verify with:\n```\nffmpeg -version\n```',
        timestamp: new Date(2025, 3, 27, 11, 15, 20),
      },
    ],
  },
  {
    id: "conv-7",
    title: "GPT-4 API Pricing",
    date: new Date(2025, 3, 26, 16, 45),
    category: "previous_7_days",
    messages: [
      {
        id: "msg-14",
        role: "user",
        content: "What's the current pricing for GPT-4 API?",
        timestamp: new Date(2025, 3, 26, 16, 45),
        duration: "00:01",
      },
      {
        id: "msg-15",
        role: "assistant",
        content:
          "As of May 2025, the GPT-4 API pricing is structured as follows:\n\n- GPT-4 Turbo: $0.01 per 1K input tokens, $0.03 per 1K output tokens\n- GPT-4o: $0.005 per 1K input tokens, $0.015 per 1K output tokens\n- GPT-4: $0.03 per 1K input tokens, $0.06 per 1K output tokens\n\nPricing may vary based on volume and special agreements. For the most current pricing, I recommend checking OpenAI's official pricing page.",
        timestamp: new Date(2025, 3, 26, 16, 45, 10),
      },
    ],
  },
  {
    id: "conv-8",
    title: "Funny Girlfriend Questions",
    date: new Date(2025, 3, 5, 20, 30),
    category: "previous_30_days",
    messages: [
      {
        id: "msg-16",
        role: "user",
        content: "What are some funny questions to ask my girlfriend?",
        timestamp: new Date(2025, 3, 5, 20, 30),
        duration: "00:02",
      },
      {
        id: "msg-17",
        role: "assistant",
        content:
          "Here are some fun and lighthearted questions to ask your girlfriend:\n\n1. If you could have any superpower, what would it be and how would you misuse it?\n2. What's the weirdest food combination you secretly enjoy?\n3. If our relationship was a movie, what would the title be and who would play us?\n4. If you could make one ridiculous rule that everyone had to follow, what would it be?\n5. What's the most embarrassing song on your playlist that you secretly love?\n6. If we switched bodies for a day, what's the first thing you would do?\n7. What's the strangest dream you've ever had about me?\n8. If you were a scented candle, what would you smell like?\n9. What's your best impression of me?\n10. If you could instantly become an expert in something, what would you choose and why?",
        timestamp: new Date(2025, 3, 5, 20, 30, 15),
      },
    ],
  },
]

// Group conversations by category
const groupedConversations = mockConversations.reduce(
  (acc, conversation) => {
    if (!acc[conversation.category]) {
      acc[conversation.category] = []
    }
    acc[conversation.category].push(conversation)
    return acc
  },
  {} as Record<string, typeof mockConversations>,
)

// Category display names
const categoryNames = {
  yesterday: "Yesterday",
  previous_7_days: "Previous 7 Days",
  previous_30_days: "Previous 30 Days",
}

export default function HistoryPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedConversation, setSelectedConversation] = useState<(typeof mockConversations)[0] | null>(
    mockConversations[0],
  )
  const [isMobile, setIsMobile] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)

  // Check if mobile on mount
  useEffect(() => {
    const checkIfMobile = () => {
      const isMobileView = window.innerWidth < 768
      setIsMobile(isMobileView)
      setShowSidebar(!isMobileView)
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  // Filter conversations based on search query
  const filteredConversations = Object.entries(groupedConversations).reduce(
    (acc, [category, conversations]) => {
      const filtered = conversations.filter(
        (conv) =>
          conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          conv.messages.some((msg) => msg.content.toLowerCase().includes(searchQuery.toLowerCase())),
      )

      if (filtered.length > 0) {
        acc[category] = filtered
      }

      return acc
    },
    {} as Record<string, typeof mockConversations>,
  )

  // Navigate back to assistant
  const goToAssistant = () => {
    router.push("/assistant")
  }

  // Toggle sidebar on mobile
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar)
  }

  return (
    <main className="h-screen bg-black text-white flex flex-col">
      {/* Mobile header - only shown on small screens */}
      {isMobile && (
        <div className="bg-zinc-900 p-3 flex items-center justify-between border-b border-zinc-800">
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-white">
            {showSidebar ? <ArrowLeft className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </Button>
          <h1 className="text-lg font-medium">Kali-E</h1>
          <Button variant="ghost" size="icon" onClick={goToAssistant} className="text-white">
            <Mic className="h-5 w-5" />
          </Button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {showSidebar && (
          <motion.div
            initial={isMobile ? { x: -300 } : { x: 0 }}
            animate={{ x: 0 }}
            className="w-full md:w-72 bg-zinc-900 border-r border-zinc-800 flex flex-col"
          >
            {/* Sidebar header */}
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <h1 className="text-xl font-bold">Kali-E</h1>
              {!isMobile && (
                <Button variant="ghost" size="icon" onClick={goToAssistant} className="text-white hover:bg-zinc-800">
                  <Mic className="h-5 w-5" />
                </Button>
              )}
            </div>

            {/* Search */}
            <div className="p-3 border-b border-zinc-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-zinc-800 border-zinc-700 focus:border-white/50 transition-all duration-300"
                />
              </div>
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto">
              {Object.entries(filteredConversations).map(([category, conversations]) => (
                <div key={category} className="mb-4">
                  <h2 className="px-4 py-2 text-sm font-medium text-gray-400">
                    {categoryNames[category as keyof typeof categoryNames]}
                  </h2>
                  <ul>
                    {conversations.map((conversation) => (
                      <li key={conversation.id}>
                        <button
                          onClick={() => {
                            setSelectedConversation(conversation)
                            if (isMobile) setShowSidebar(false)
                          }}
                          className={`w-full text-left px-4 py-3 hover:bg-zinc-800 transition-colors ${
                            selectedConversation?.id === conversation.id ? "bg-zinc-800" : ""
                          }`}
                        >
                          <p className="truncate">{conversation.title}</p>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {Object.keys(filteredConversations).length === 0 && (
                <div className="p-4 text-center text-gray-500">No conversations found</div>
              )}
            </div>
          </motion.div>
        )}

        {/* Conversation view */}
        <motion.div
          initial={isMobile && showSidebar ? { x: 300 } : { x: 0 }}
          animate={{ x: 0 }}
          className="flex-1 flex flex-col overflow-hidden"
        >
          {/* Conversation header - only on desktop or when sidebar is hidden */}
          {(!showSidebar || !isMobile) && selectedConversation && (
            <div className="bg-zinc-900 p-4 border-b border-zinc-800 flex items-center">
              {isMobile && !showSidebar && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  className="mr-2 text-white hover:bg-zinc-800"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
              <h2 className="font-medium truncate">{selectedConversation.title}</h2>
            </div>
          )}

          {/* Messages */}
          {selectedConversation ? (
            <div className="flex-1 overflow-y-auto p-4 bg-black">
              <div className="max-w-3xl mx-auto space-y-6">
                {selectedConversation.messages.map((message) => (
                  <div key={message.id} className={`${message.role === "user" ? "flex justify-end" : ""}`}>
                    {message.role === "user" ? (
                      <div className="max-w-[80%]">
                        <div className="bg-zinc-800 rounded-2xl px-4 py-3 inline-block">
                          <p className="text-white">{message.content}</p>
                        </div>
                        <div className="flex items-center justify-end mt-1 text-xs text-gray-500">
                          {message.duration && <span className="mr-2">{message.duration}</span>}
                        </div>
                      </div>
                    ) : (
                      <div className="max-w-[80%]">
                        <div className="mb-1">
                          <span className="text-sm font-medium text-white">Kali-E</span>
                        </div>
                        <div className="text-white">
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-black">
              <p className="text-gray-500">Select a conversation to view</p>
            </div>
          )}
        </motion.div>
      </div>
    </main>
  )
}

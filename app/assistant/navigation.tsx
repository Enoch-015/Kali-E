"use client"
import { useRouter, usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Mic, Calendar, CheckSquare, FileText, Mail, BarChart2, Puzzle, Settings } from "lucide-react"

export default function Navigation() {
  const router = useRouter()
  const pathname = usePathname()

  const navItems = [
    { path: "/assistant", icon: <Mic className="h-5 w-5" />, label: "Assistant" },
    { path: "/assistant/calendar", icon: <Calendar className="h-5 w-5" />, label: "Calendar" },
    { path: "/assistant/tasks", icon: <CheckSquare className="h-5 w-5" />, label: "Tasks" },
    { path: "/assistant/notes", icon: <FileText className="h-5 w-5" />, label: "Notes" },
    { path: "/assistant/email", icon: <Mail className="h-5 w-5" />, label: "Email" },
    { path: "/plugins", icon: <Puzzle className="h-5 w-5" />, label: "Plugins" },
    { path: "/analytics", icon: <BarChart2 className="h-5 w-5" />, label: "Analytics" },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800/50 py-2 px-4 z-10"
    >
      <div className="max-w-screen-xl mx-auto flex justify-between items-center">
        {/* Kali-E Logo/Name */}
        <div className="text-xl font-bold text-white">Kali-E</div>

        {/* Navigation Items */}
        <div className="flex items-center space-x-1">
          {navItems.map((item) => {
            const isActive = pathname === item.path

            return (
              <Button
                key={item.path}
                variant="ghost"
                size="sm"
                className={`relative ${
                  isActive
                    ? "bg-white text-black hover:bg-gray-200"
                    : "text-gray-400 hover:text-white hover:bg-zinc-800/50"
                }`}
                onClick={() => router.push(item.path)}
              >
                <span className="flex items-center">
                  {item.icon}
                  <span className="ml-1 text-xs">{item.label}</span>
                </span>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-white"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Button>
            )
          })}
        </div>

        {/* Settings Button */}
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-white hover:bg-zinc-800/50"
          onClick={() => router.push("/settings")}
          aria-label="Settings"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </motion.div>
  )
}

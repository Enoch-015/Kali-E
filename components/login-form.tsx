"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"

export default function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("login")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate authentication
    setTimeout(() => {
      setIsLoading(false)
      router.push("/assistant")
    }, 1000)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Tabs defaultValue="login" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6 p-1 bg-zinc-900/50 backdrop-blur-sm">
          <TabsTrigger
            value="login"
            className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white transition-all duration-300"
          >
            Login
          </TabsTrigger>
          <TabsTrigger
            value="signup"
            className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white transition-all duration-300"
          >
            Sign Up
          </TabsTrigger>
        </TabsList>

        <div className="bg-zinc-900/30 backdrop-blur-sm rounded-lg p-6 border border-zinc-800/50">
          <TabsContent value="login">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  className="bg-zinc-800/50 border-zinc-700 focus:border-white/50 transition-all duration-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  className="bg-zinc-800/50 border-zinc-700 focus:border-white/50 transition-all duration-300"
                />
              </div>
              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full bg-white text-black hover:bg-gray-200 transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300">
                  Name
                </Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  required
                  className="bg-zinc-800/50 border-zinc-700 focus:border-white/50 transition-all duration-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email" className="text-gray-300">
                  Email
                </Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  className="bg-zinc-800/50 border-zinc-700 focus:border-white/50 transition-all duration-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password" className="text-gray-300">
                  Password
                </Label>
                <Input
                  id="signup-password"
                  type="password"
                  required
                  className="bg-zinc-800/50 border-zinc-700 focus:border-white/50 transition-all duration-300"
                />
              </div>
              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full bg-white text-black hover:bg-gray-200 transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Sign Up"
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>
        </div>
      </Tabs>
    </motion.div>
  )
}

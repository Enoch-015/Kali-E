"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"
import { Loader2, TriangleAlert } from "lucide-react"

import { FaGithub } from "react-icons/fa"
import { FcGoogle } from "react-icons/fc"
import { toast } from "sonner"

import { signIn } from "next-auth/react"

export default function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("login")


  type FormValues = {
  name: string;
  email: string;
  password: string;
};

  const [values, setValues] = useState<FormValues>({
    name: "",
    email:"",
    password: ""
  })


  const handleProvider = (
      event: React.MouseEvent<HTMLButtonElement>,
      value: "github" | "google"
    ) => {
      event.preventDefault()
      signIn(value, { callbackUrl: "/assistant" })
    }


  const handleSignUpSubmit = async(e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    })
    
    const data = await res.json()
    error && setError(null)

    if(res.ok) {
      setIsLoading(false)
      setActiveTab("login")
      toast.success(data.message)
      router.push("/")
    }else if (res.status === 400) {
       setError(data.message)
       setIsLoading(false)
     } else if (res.status === 500) {
       setError(data.message)
       setIsLoading(false)
     }
  }
  

   const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const res = await signIn("credentials", {
      redirect: false,
      email: values.email,
      password: values.password
    })
    if(res?.ok) {
       router.push("/assistant")
       toast.success("Login successful")
    } else if (res?.status === 401) {
       setError("Invalid Credentials")
       setIsLoading(false)
    } else {
      setError("Something went wrong")
    }
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
            <form onSubmit={handleSignInSubmit} className="space-y-4">
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
                  value={values.email}
                  onChange={(e) => setValues({ ...values, email: e.target.value })}
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
                  value={values.password}
                  onChange={(e) => setValues({ ...values, password: e.target.value })}
                />
              </div>
              {!!error && (
                 <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive mb-6">
                   <TriangleAlert />
                   <p>{error}</p>
                 </div>
               )}
              <div className="pt-2 space-y-4">
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
                <Button
                  type="submit"
                  className="w-full bg-white text-black hover:bg-gray-200 transition-all duration-300"
                  onClick={(e) => handleProvider(e, "google")}
                >
                 <FcGoogle className="size-8 left-2.5 top-2.5" /> 
                </Button>
                <Button
                  type="submit"
                  className="w-full bg-white text-black hover:bg-gray-200 transition-all duration-300"
                  onClick={(e) => handleProvider(e, "github")}
                >
                  <FaGithub className="left-2.5 top-2.5" /> 
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300">
                  Name
                </Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  required
                  className="bg-zinc-800/50 border-zinc-700 focus:border-white/50 transition-all duration-300"
                  value={values.name}
                  onChange={(e) => setValues({ ...values, name: e.target.value })}
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
                  value={values.email}
                  onChange={(e) => setValues({ ...values, email: e.target.value })}
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
                  value={values.password}
                  onChange={(e) => setValues({ ...values, password: e.target.value })}
                />
              </div>
              {!!error && (
                 <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive mb-6">
                   <TriangleAlert />
                   <p>{error}</p>
                 </div>
               )}
              <div className="pt-2 space-y-2">
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
                <Button
                  type="submit"
                  className="w-full bg-white text-black hover:bg-gray-200 transition-all duration-300"
                  onClick={(e) => handleProvider(e, "google")}
                >
                   <FcGoogle className="size-8 left-2.5 top-2.5" /> 
                </Button>
                <Button
                  type="submit"
                  className="w-full bg-white text-black hover:bg-gray-200 transition-all duration-300"
                  onClick={(e) => handleProvider(e, "github")}
                >
                 <FaGithub className="left-2.5 top-2.5" /> 
                </Button>
              </div>
            </form>
          </TabsContent>
        </div>
      </Tabs>
    </motion.div>
  )
}

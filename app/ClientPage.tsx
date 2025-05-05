"use client"
import LoginForm from "@/components/login-form"

export default function ClientPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(50,50,50,0.1),rgba(0,0,0,0)_50%)] pointer-events-none" />

      <div className="w-full max-w-md p-6 relative z-10">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
            Kali-E
          </h1>
          <p className="text-gray-400">Sign in to access your voice assistant</p>
        </div>
        <LoginForm />
      </div>
    </main>
  )
}

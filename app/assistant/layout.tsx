import type React from "react"
import Navigation from "./navigation"

export default function AssistantLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <div className="flex-1">{children}</div>
    </div>
  )
}

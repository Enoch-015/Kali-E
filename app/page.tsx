import type { Metadata } from "next"
import ClientPage from "./ClientPage"

export const metadata: Metadata = {
  title: "Voice Assistant",
  description: "A modern voice assistant with AI capabilities",
}

export default function Home() {
  return <ClientPage />
}

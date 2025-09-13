"use client"

import { ChatInterface } from "@/components/chat/chat-interface"

export default function HomePage() {
  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="flex-1 p-4">
        <ChatInterface websocketUrl="ws://localhost:3001/api/ws" className="h-full" />
      </div>
    </div>
  )
}

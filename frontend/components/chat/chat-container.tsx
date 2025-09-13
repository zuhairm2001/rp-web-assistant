"use client"

import { useEffect, useRef } from "react"
import type { ChatMessage } from "@/lib/websocket"
import { ChatMessageComponent } from "./chat-message"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { MessageCircle } from "lucide-react"

interface ChatContainerProps {
  messages: ChatMessage[]
  isLoading?: boolean
}

export function ChatContainer({ messages, isLoading = false }: ChatContainerProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="p-8 text-center max-w-md">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Ask me about products, services, or anything else you'd like to know. I can help you find what you're
            looking for.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <ScrollArea ref={scrollAreaRef} className="flex-1">
      <div className="space-y-1">
        {messages.map((message, index) => (
          <ChatMessageComponent
            key={message.id}
            message={message}
            isStreaming={isLoading && index === messages.length - 1 && message.role === "assistant"}
          />
        ))}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  )
}

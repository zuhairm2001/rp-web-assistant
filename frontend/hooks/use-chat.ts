"use client"

import { useState, useCallback, useRef } from "react"
import { type ChatMessage, type WebSocketMessage, useWebSocket } from "@/lib/websocket"

interface UseChatOptions {
  websocketUrl: string
  onError?: (error: string) => void
}

export function useChat({ websocketUrl, onError }: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const currentMessageRef = useRef<ChatMessage | null>(null)

  const handleWebSocketMessage = useCallback(
    (wsMessage: WebSocketMessage) => {
      switch (wsMessage.type) {
        case "message_start":
          // Start building a new assistant message
          const newMessage: ChatMessage = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: "",
            timestamp: new Date(),
            toolCalls: [],
          }
          currentMessageRef.current = newMessage
          setMessages((prev) => [...prev, newMessage])
          setIsLoading(true)
          break

        case "content_delta":
          // Append streaming content to current message
          if (currentMessageRef.current && wsMessage.delta?.text) {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === currentMessageRef.current?.id
                  ? { ...msg, content: msg.content + wsMessage.delta!.text }
                  : msg,
              ),
            )
          }
          break

        case "message_end":
          // Finalize the current message
          currentMessageRef.current = null
          setIsLoading(false)
          break

        case "error":
          setIsLoading(false)
          onError?.(wsMessage.error || "Unknown error occurred")
          break

        default:
          console.warn("Unknown WebSocket message type:", wsMessage.type)
      }
    },
    [onError],
  )

  const { connectionState, connect, disconnect, sendMessage } = useWebSocket({
    url: websocketUrl,
    onMessage: handleWebSocketMessage,
    reconnectAttempts: 3,
    reconnectDelay: 1000,
  })

  const sendUserMessage = useCallback(
    (content: string) => {
      if (!content.trim()) return

      // Add user message to chat
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMessage])

      // Send message via WebSocket
      const success = sendMessage({
        type: "message",
        content: content.trim(),
      })

      if (!success) {
        onError?.("Failed to send message. Please check your connection.")
      }
    },
    [sendMessage, onError],
  )

  const clearMessages = useCallback(() => {
    setMessages([])
    currentMessageRef.current = null
    setIsLoading(false)
  }, [])

  return {
    messages,
    isLoading,
    connectionState,
    sendUserMessage,
    clearMessages,
    connect,
    disconnect,
  }
}

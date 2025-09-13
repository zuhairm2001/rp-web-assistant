"use client"

import { useChat } from "@/hooks/use-chat"
import { ChatContainer } from "./chat-container"
import { ChatInput } from "./chat-input"
import { ConnectionStatus } from "@/components/connection-status"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw, Trash2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useState, useEffect } from "react"

interface ChatInterfaceProps {
  websocketUrl?: string
  className?: string
}

export function ChatInterface({ websocketUrl = "ws://localhost:3001/api/ws", className }: ChatInterfaceProps) {
  const [error, setError] = useState<string | null>(null)

  const { messages, isLoading, connectionState, sendUserMessage, clearMessages, connect, disconnect } = useChat({
    websocketUrl,
    onError: setError,
  })

  // Auto-connect on mount
  useEffect(() => {
    connect()
    return () => disconnect()
  }, [connect, disconnect])

  const handleClearError = () => setError(null)

  return (
    <Card className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">AI Assistant</h2>
          <ConnectionStatus state={connectionState} />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={connect} disabled={connectionState === "connected"}>
            <RefreshCw className="h-4 w-4" />
          </Button>

          <Button variant="outline" size="sm" onClick={clearMessages} disabled={messages.length === 0}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="m-4 mb-0">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearError}
              className="h-auto p-1 text-destructive-foreground hover:text-destructive-foreground"
            >
              ×
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Chat Messages */}
      <ChatContainer messages={messages} isLoading={isLoading} />

      {/* Input */}
      <ChatInput
        onSendMessage={sendUserMessage}
        disabled={connectionState !== "connected"}
        isLoading={isLoading}
        placeholder={connectionState === "connected" ? "Ask me about products or services..." : "Connecting to chat..."}
      />
    </Card>
  )
}

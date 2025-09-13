"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useWebSocket, type WebSocketMessage, type ChatMessage, type ToolCall, ConnectionState } from "@/lib/websocket"
import {
  useCurrentSession,
  useCreateSession,
  useSetCurrentSession,
  useAddMessage,
  useUpdateMessage,
  useUpdateToolCall,
  useChatSessions,
  useDeleteSession,
  useUpdateSession,
} from "@/lib/chat-queries"

interface UseEnhancedChatOptions {
  websocketUrl: string
  autoConnect?: boolean
  sessionId?: string
}

export function useEnhancedChat({ websocketUrl, autoConnect = true, sessionId }: UseEnhancedChatOptions) {
  const [isLoading, setIsLoading] = useState(false)
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED)
  const [error, setError] = useState<string | null>(null)
  const currentMessageRef = useRef<ChatMessage | null>(null)

  // React Query hooks
  const { data: currentSession } = useCurrentSession()
  const { data: sessions = [] } = useChatSessions()
  const createSession = useCreateSession()
  const setCurrentSession = useSetCurrentSession()
  const addMessage = useAddMessage()
  const updateMessage = useUpdateMessage()
  const updateToolCall = useUpdateToolCall()
  const deleteSession = useDeleteSession()
  const updateSession = useUpdateSession()

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
          addMessage.mutate(newMessage)
          setIsLoading(true)
          break

        case "content_delta":
          // Append streaming content to current message
          if (currentMessageRef.current && wsMessage.delta?.text) {
            const updatedContent = currentMessageRef.current.content + wsMessage.delta.text
            currentMessageRef.current.content = updatedContent

            updateMessage.mutate({
              messageId: currentMessageRef.current.id,
              updates: { content: updatedContent },
            })
          }
          break

        case "message_end":
          // Finalize the current message
          currentMessageRef.current = null
          setIsLoading(false)
          break

        case "tool_call_start":
          // Handle tool call initiation
          if (currentMessageRef.current && wsMessage.toolCall) {
            const toolCall: ToolCall = {
              id: wsMessage.toolCall.id || crypto.randomUUID(),
              name: wsMessage.toolCall.name || "unknown",
              input: wsMessage.toolCall.input || {},
              status: "running",
            }

            // Add tool call to current message
            const updatedToolCalls = [...(currentMessageRef.current.toolCalls || []), toolCall]
            currentMessageRef.current.toolCalls = updatedToolCalls

            updateMessage.mutate({
              messageId: currentMessageRef.current.id,
              updates: { toolCalls: updatedToolCalls },
            })
          }
          break

        case "tool_call_end":
          // Handle tool call completion
          if (currentMessageRef.current && wsMessage.toolCall) {
            updateToolCall.mutate({
              messageId: currentMessageRef.current.id,
              toolCallId: wsMessage.toolCall.id,
              updates: {
                output: wsMessage.toolCall.output,
                status: "completed",
              },
            })
          }
          break

        case "error":
          setIsLoading(false)
          setError(wsMessage.error || "Unknown error occurred")
          break

        default:
          console.warn("Unknown WebSocket message type:", wsMessage.type)
      }
    },
    [addMessage, updateMessage, updateToolCall],
  )

  const { connect, disconnect, sendMessage } = useWebSocket({
    url: websocketUrl,
    onMessage: handleWebSocketMessage,
    onConnectionChange: setConnectionState,
    reconnectAttempts: 3,
    reconnectDelay: 1000,
  })

  // Load specific session on mount
  useEffect(() => {
    if (sessionId) {
      setCurrentSession.mutate(sessionId)
    } else if (!currentSession && !createSession.isPending) {
      createSession.mutate()
    }
  }, [sessionId, currentSession, createSession, setCurrentSession])

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect()
    }
    return () => disconnect()
  }, [autoConnect, connect, disconnect])

  const sendUserMessage = useCallback(
    (content: string) => {
      if (!content.trim()) return false

      // Ensure we have a session
      if (!currentSession && !createSession.isPending) {
        createSession.mutate()
      }

      // Add user message
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
      }

      addMessage.mutate(userMessage)

      // Send message via WebSocket
      const success = sendMessage({
        type: "message",
        content: content.trim(),
      })

      if (!success) {
        setError("Failed to send message. Please check your connection.")
        return false
      }

      // Clear any previous errors
      setError(null)
      return true
    },
    [currentSession, createSession, addMessage, sendMessage],
  )

  const clearCurrentSession = useCallback(() => {
    if (currentSession) {
      updateSession.mutate({
        sessionId: currentSession.id,
        updates: { messages: [] },
      })
    }
  }, [currentSession, updateSession])

  const startNewSession = useCallback(
    (title?: string) => {
      createSession.mutate(title)
    },
    [createSession],
  )

  const loadSession = useCallback(
    (sessionId: string) => {
      setCurrentSession.mutate(sessionId)
    },
    [setCurrentSession],
  )

  const removeSession = useCallback(
    (sessionId: string) => {
      deleteSession.mutate(sessionId)
    },
    [deleteSession],
  )

  const updateSessionTitle = useCallback(
    (sessionId: string, title: string) => {
      updateSession.mutate({
        sessionId,
        updates: { title },
      })
    },
    [updateSession],
  )

  return {
    // Session data
    currentSession,
    sessions,
    messages: currentSession?.messages || [],

    // State
    isLoading,
    connectionState,
    error,

    // Actions
    sendUserMessage,
    clearCurrentSession,
    startNewSession,
    loadSession,
    deleteSession: removeSession,
    updateSessionTitle,
    connect,
    disconnect,

    // Utilities
    clearError: () => setError(null),
  }
}

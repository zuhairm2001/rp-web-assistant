"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export enum ConnectionState {
  CONNECTING = "connecting",
  CONNECTED = "connected",
  DISCONNECTED = "disconnected",
  ERROR = "error",
}

export interface WebSocketMessage {
  type: string
  content?: string
  delta?: { text: string }
  error?: string
  timestamp?: string
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  toolCalls?: ToolCall[]
}

export interface ToolCall {
  id: string
  name: string
  input: Record<string, unknown>
  output?: unknown
  status: "pending" | "running" | "completed" | "error"
}

interface UseWebSocketOptions {
  url: string
  onMessage?: (message: WebSocketMessage) => void
  onConnectionChange?: (state: ConnectionState) => void
  reconnectAttempts?: number
  reconnectDelay?: number
}

export function useWebSocket({
  url,
  onMessage,
  onConnectionChange,
  reconnectAttempts = 3,
  reconnectDelay = 1000,
}: UseWebSocketOptions) {
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED)
  const [reconnectCount, setReconnectCount] = useState(0)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const updateConnectionState = useCallback(
    (state: ConnectionState) => {
      setConnectionState(state)
      onConnectionChange?.(state)
    },
    [onConnectionChange],
  )

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    updateConnectionState(ConnectionState.CONNECTING)

    try {
      const ws = new WebSocket(url)
      wsRef.current = ws

      ws.onopen = () => {
        updateConnectionState(ConnectionState.CONNECTED)
        setReconnectCount(0)
      }

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          onMessage?.(message)
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error)
        }
      }

      ws.onclose = () => {
        updateConnectionState(ConnectionState.DISCONNECTED)

        // Attempt reconnection if within retry limit
        if (reconnectCount < reconnectAttempts) {
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectCount((prev) => prev + 1)
            connect()
          }, reconnectDelay * Math.pow(2, reconnectCount)) // Exponential backoff
        }
      }

      ws.onerror = () => {
        updateConnectionState(ConnectionState.ERROR)
      }
    } catch (error) {
      updateConnectionState(ConnectionState.ERROR)
      console.error("WebSocket connection failed:", error)
    }
  }, [url, onMessage, updateConnectionState, reconnectCount, reconnectAttempts, reconnectDelay])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }

    updateConnectionState(ConnectionState.DISCONNECTED)
    setReconnectCount(0)
  }, [updateConnectionState])

  const sendMessage = useCallback((message: { type: string; content: string }) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
      return true
    }
    return false
  }, [])

  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return {
    connectionState,
    connect,
    disconnect,
    sendMessage,
    reconnectCount,
  }
}

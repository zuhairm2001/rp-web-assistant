"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  toolCalls?: ToolCall[];
}

export interface ToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
  output?: unknown;
  status: "pending" | "running" | "completed" | "error";
}

export interface UseWebSocketChatOptions {
  url?: string;
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export interface UseWebSocketChatReturn {
  messages: ChatMessage[];
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  sendMessage: (content: string) => void;
  clearMessages: () => void;
  reconnect: () => void;
  streamingMessage: string;
  isStreaming: boolean;
}

export function useWebSocketChat(
  options: UseWebSocketChatOptions = {},
): UseWebSocketChatReturn {
  const {
    url = "ws://localhost:3001/ws",
    autoReconnect = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
  } = options;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentMessageIdRef = useRef<string | null>(null);

  const generateId = () => Math.random().toString(36).substring(2, 15);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);
        setIsConnecting(false);
        setError(null);
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("Received WebSocket data:", data);

          if (data.type === "message_start") {
            const messageId = generateId();
            currentMessageIdRef.current = messageId;
            setStreamingMessage("");
            setIsStreaming(true);

            const newMessage: ChatMessage = {
              id: messageId,
              role: "assistant",
              content: "",
              timestamp: new Date(),
            };

            console.log("Adding new assistant message:", newMessage);
            setMessages((prev) => {
              const updated = [...prev, newMessage];
              console.log("Updated messages:", updated);
              return updated;
            });
          } else if (
            data.type === "content_delta" &&
            currentMessageIdRef.current
          ) {
            const deltaText = data.delta?.text || "";
            console.log("Received delta text:", deltaText);
            setStreamingMessage((prev) => prev + deltaText);

            setMessages((prev) =>
              prev.map((msg) => {
                if (msg.id === currentMessageIdRef.current) {
                  const updatedMsg = {
                    ...msg,
                    content: msg.content + deltaText,
                  };
                  console.log("Updated message content:", updatedMsg.content);
                  return updatedMsg;
                }
                return msg;
              }),
            );
          } else if (data.type === "tool_call") {
            const toolCall: ToolCall = {
              id: data.tool_call_id || generateId(),
              name: data.function_name || data.name,
              input: data.input || data.arguments,
              status: "running",
            };

            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === currentMessageIdRef.current
                  ? {
                      ...msg,
                      toolCalls: msg.toolCalls
                        ? [...msg.toolCalls, toolCall]
                        : [toolCall],
                    }
                  : msg,
              ),
            );
          } else if (data.type === "tool_result") {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === currentMessageIdRef.current
                  ? {
                      ...msg,
                      toolCalls: msg.toolCalls?.map((tc) =>
                        tc.id === data.tool_call_id
                          ? { ...tc, output: data.result, status: "completed" }
                          : tc,
                      ),
                    }
                  : msg,
              ),
            );
          } else if (data.type === "message_end") {
            setIsStreaming(false);
            setStreamingMessage("");
            currentMessageIdRef.current = null;
          } else if (data.type === "error") {
            setError(data.message || "An error occurred");
            setIsStreaming(false);
          }
        } catch (err) {
          console.error("Error parsing WebSocket message:", err);
        }
      };

      ws.onclose = (event) => {
        console.log("WebSocket closed:", event.code, event.reason);
        setIsConnected(false);
        setIsConnecting(false);
        wsRef.current = null;

        if (
          autoReconnect &&
          reconnectAttemptsRef.current < maxReconnectAttempts
        ) {
          reconnectAttemptsRef.current++;
          console.log(
            `Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`,
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          setError("Max reconnection attempts reached");
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setError("Connection error");
        setIsConnecting(false);
      };
    } catch (err) {
      console.error("Failed to create WebSocket connection:", err);
      setError("Failed to connect");
      setIsConnecting(false);
    }
  }, [url, autoReconnect, reconnectInterval, maxReconnectAttempts]);

  const sendMessage = useCallback((content: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setError("Not connected");
      return;
    }

    const userMessage: ChatMessage = {
      id: generateId(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      wsRef.current.send(
        JSON.stringify({
          type: "message",
          content,
        }),
      );
    } catch (err) {
      console.error("Failed to send message:", err);
      setError("Failed to send message");
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setStreamingMessage("");
    setIsStreaming(false);
  }, []);

  const reconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    reconnectAttemptsRef.current = 0;
    connect();
  }, [connect]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return {
    messages,
    isConnected,
    isConnecting,
    error,
    sendMessage,
    clearMessages,
    reconnect,
    streamingMessage,
    isStreaming,
  };
}

"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { ChatMessage, ToolCall } from "./websocket"

export interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
}

// Local storage utilities
const STORAGE_KEY = "chat-sessions"
const CURRENT_SESSION_KEY = "current-session-id"

function getStoredSessions(): ChatSession[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function setStoredSessions(sessions: ChatSession[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
}

function getCurrentSessionId(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(CURRENT_SESSION_KEY)
}

function setCurrentSessionId(sessionId: string | null) {
  if (typeof window === "undefined") return
  if (sessionId) {
    localStorage.setItem(CURRENT_SESSION_KEY, sessionId)
  } else {
    localStorage.removeItem(CURRENT_SESSION_KEY)
  }
}

// Query keys
export const chatKeys = {
  all: ["chat"] as const,
  sessions: () => [...chatKeys.all, "sessions"] as const,
  session: (id: string) => [...chatKeys.all, "session", id] as const,
  currentSession: () => [...chatKeys.all, "current-session"] as const,
}

// Hooks
export function useChatSessions() {
  return useQuery({
    queryKey: chatKeys.sessions(),
    queryFn: getStoredSessions,
    initialData: [],
  })
}

export function useCurrentSession() {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: chatKeys.currentSession(),
    queryFn: () => {
      const sessionId = getCurrentSessionId()
      if (!sessionId) return null

      const sessions = getStoredSessions()
      return sessions.find((s) => s.id === sessionId) || null
    },
    initialData: null,
  })
}

export function useCreateSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (title?: string): Promise<ChatSession> => {
      const session: ChatSession = {
        id: crypto.randomUUID(),
        title: title || "New Chat",
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const sessions = getStoredSessions()
      const newSessions = [session, ...sessions]
      setStoredSessions(newSessions)
      setCurrentSessionId(session.id)

      return session
    },
    onSuccess: (newSession) => {
      queryClient.setQueryData(chatKeys.sessions(), (old: ChatSession[] = []) => [newSession, ...old])
      queryClient.setQueryData(chatKeys.currentSession(), newSession)
    },
  })
}

export function useUpdateSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ sessionId, updates }: { sessionId: string; updates: Partial<ChatSession> }) => {
      const sessions = getStoredSessions()
      const updatedSessions = sessions.map((session) =>
        session.id === sessionId ? { ...session, ...updates, updatedAt: new Date() } : session,
      )
      setStoredSessions(updatedSessions)

      return updatedSessions.find((s) => s.id === sessionId)!
    },
    onSuccess: (updatedSession) => {
      queryClient.setQueryData(chatKeys.sessions(), (old: ChatSession[] = []) =>
        old.map((session) => (session.id === updatedSession.id ? updatedSession : session)),
      )

      const currentSession = queryClient.getQueryData(chatKeys.currentSession()) as ChatSession | null
      if (currentSession?.id === updatedSession.id) {
        queryClient.setQueryData(chatKeys.currentSession(), updatedSession)
      }
    },
  })
}

export function useDeleteSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const sessions = getStoredSessions()
      const newSessions = sessions.filter((s) => s.id !== sessionId)
      setStoredSessions(newSessions)

      const currentSessionId = getCurrentSessionId()
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null)
      }

      return sessionId
    },
    onSuccess: (deletedSessionId) => {
      queryClient.setQueryData(chatKeys.sessions(), (old: ChatSession[] = []) =>
        old.filter((s) => s.id !== deletedSessionId),
      )

      const currentSession = queryClient.getQueryData(chatKeys.currentSession()) as ChatSession | null
      if (currentSession?.id === deletedSessionId) {
        queryClient.setQueryData(chatKeys.currentSession(), null)
      }
    },
  })
}

export function useSetCurrentSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (sessionId: string | null) => {
      setCurrentSessionId(sessionId)

      if (!sessionId) return null

      const sessions = getStoredSessions()
      return sessions.find((s) => s.id === sessionId) || null
    },
    onSuccess: (session) => {
      queryClient.setQueryData(chatKeys.currentSession(), session)
    },
  })
}

export function useAddMessage() {
  const queryClient = useQueryClient()
  const updateSession = useUpdateSession()

  return useMutation({
    mutationFn: async (message: ChatMessage) => {
      const currentSession = queryClient.getQueryData(chatKeys.currentSession()) as ChatSession | null

      if (!currentSession) {
        throw new Error("No current session")
      }

      const updatedMessages = [...currentSession.messages, message]
      const updates: Partial<ChatSession> = {
        messages: updatedMessages,
        updatedAt: new Date(),
      }

      // Auto-generate title for first user message
      if (currentSession.messages.length === 0 && message.role === "user") {
        const content = message.content.trim()
        updates.title = content.length > 50 ? content.substring(0, 47) + "..." : content
      }

      return updateSession.mutateAsync({ sessionId: currentSession.id, updates })
    },
  })
}

export function useUpdateMessage() {
  const queryClient = useQueryClient()
  const updateSession = useUpdateSession()

  return useMutation({
    mutationFn: async ({ messageId, updates }: { messageId: string; updates: Partial<ChatMessage> }) => {
      const currentSession = queryClient.getQueryData(chatKeys.currentSession()) as ChatSession | null

      if (!currentSession) {
        throw new Error("No current session")
      }

      const updatedMessages = currentSession.messages.map((msg) =>
        msg.id === messageId ? { ...msg, ...updates } : msg,
      )

      return updateSession.mutateAsync({
        sessionId: currentSession.id,
        updates: { messages: updatedMessages, updatedAt: new Date() },
      })
    },
  })
}

export function useUpdateToolCall() {
  const queryClient = useQueryClient()
  const updateSession = useUpdateSession()

  return useMutation({
    mutationFn: async ({
      messageId,
      toolCallId,
      updates,
    }: {
      messageId: string
      toolCallId: string
      updates: Partial<ToolCall>
    }) => {
      const currentSession = queryClient.getQueryData(chatKeys.currentSession()) as ChatSession | null

      if (!currentSession) {
        throw new Error("No current session")
      }

      const updatedMessages = currentSession.messages.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              toolCalls: msg.toolCalls?.map((tool) => (tool.id === toolCallId ? { ...tool, ...updates } : tool)),
            }
          : msg,
      )

      return updateSession.mutateAsync({
        sessionId: currentSession.id,
        updates: { messages: updatedMessages, updatedAt: new Date() },
      })
    },
  })
}

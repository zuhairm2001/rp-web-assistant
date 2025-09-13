import type { ChatMessage } from "@/lib/websocket"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { User, Bot } from "lucide-react"
import { cn } from "@/lib/utils"
import { ToolCallDisplay } from "./tool-call-display"

interface ChatMessageProps {
  message: ChatMessage
  isStreaming?: boolean
}

export function ChatMessageComponent({ message, isStreaming = false }: ChatMessageProps) {
  const isUser = message.role === "user"

  return (
    <div className={cn("flex gap-3 p-4", isUser ? "flex-row-reverse" : "flex-row")}>
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback
          className={cn(
            "text-xs font-medium",
            isUser ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground",
          )}
        >
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      <div className={cn("flex flex-col gap-2 max-w-[80%]", isUser ? "items-end" : "items-start")}>
        <Card
          className={cn(
            "p-3 text-sm leading-relaxed",
            isUser ? "bg-primary text-primary-foreground ml-auto" : "bg-muted text-muted-foreground",
          )}
        >
          <div className="whitespace-pre-wrap text-pretty">
            {message.content}
            {isStreaming && <span className="inline-block w-2 h-4 bg-current animate-pulse ml-1" />}
          </div>
        </Card>

        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="flex flex-col gap-2 w-full">
            {message.toolCalls.map((toolCall) => (
              <ToolCallDisplay key={toolCall.id} toolCall={toolCall} />
            ))}
          </div>
        )}

        <span className="text-xs text-muted-foreground px-1">
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  )
}

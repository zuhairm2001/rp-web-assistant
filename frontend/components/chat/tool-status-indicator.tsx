import type { ToolCall } from "@/lib/websocket"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, XCircle, Clock } from "lucide-react"

interface ToolStatusIndicatorProps {
  toolCalls: ToolCall[]
  className?: string
}

export function ToolStatusIndicator({ toolCalls, className }: ToolStatusIndicatorProps) {
  if (!toolCalls || toolCalls.length === 0) return null

  const runningTools = toolCalls.filter((tool) => tool.status === "running")
  const completedTools = toolCalls.filter((tool) => tool.status === "completed")
  const errorTools = toolCalls.filter((tool) => tool.status === "error")
  const pendingTools = toolCalls.filter((tool) => tool.status === "pending")

  if (runningTools.length > 0) {
    return (
      <Badge variant="secondary" className={`flex items-center gap-1 ${className}`}>
        <Loader2 className="h-3 w-3 animate-spin" />
        <span className="text-xs">
          Running {runningTools.length} tool{runningTools.length > 1 ? "s" : ""}
        </span>
      </Badge>
    )
  }

  if (pendingTools.length > 0) {
    return (
      <Badge variant="outline" className={`flex items-center gap-1 ${className}`}>
        <Clock className="h-3 w-3" />
        <span className="text-xs">
          {pendingTools.length} tool{pendingTools.length > 1 ? "s" : ""} pending
        </span>
      </Badge>
    )
  }

  if (errorTools.length > 0) {
    return (
      <Badge variant="destructive" className={`flex items-center gap-1 ${className}`}>
        <XCircle className="h-3 w-3" />
        <span className="text-xs">
          {errorTools.length} tool{errorTools.length > 1 ? "s" : ""} failed
        </span>
      </Badge>
    )
  }

  if (completedTools.length > 0) {
    return (
      <Badge
        variant="default"
        className={`flex items-center gap-1 bg-green-100 text-green-800 border-green-200 ${className}`}
      >
        <CheckCircle className="h-3 w-3" />
        <span className="text-xs">
          {completedTools.length} tool{completedTools.length > 1 ? "s" : ""} completed
        </span>
      </Badge>
    )
  }

  return null
}

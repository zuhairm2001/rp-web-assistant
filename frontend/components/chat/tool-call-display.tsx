"use client"

import type { ToolCall } from "@/lib/websocket"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  Package,
  Info,
  Calendar,
  Phone,
} from "lucide-react"
import { useState } from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface ToolCallDisplayProps {
  toolCall: ToolCall
}

export function ToolCallDisplay({ toolCall }: ToolCallDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getStatusConfig = () => {
    switch (toolCall.status) {
      case "pending":
        return {
          icon: <Clock className="h-3 w-3" />,
          label: "Pending",
          variant: "secondary" as const,
          className: "bg-gray-100 text-gray-700 border-gray-200",
        }
      case "running":
        return {
          icon: <Loader2 className="h-3 w-3 animate-spin" />,
          label: "Running",
          variant: "default" as const,
          className: "bg-blue-100 text-blue-700 border-blue-200",
        }
      case "completed":
        return {
          icon: <CheckCircle className="h-3 w-3" />,
          label: "Completed",
          variant: "default" as const,
          className: "bg-green-100 text-green-700 border-green-200",
        }
      case "error":
        return {
          icon: <XCircle className="h-3 w-3" />,
          label: "Error",
          variant: "destructive" as const,
          className: "bg-red-100 text-red-700 border-red-200",
        }
    }
  }

  const getToolIcon = () => {
    switch (toolCall.name) {
      case "getWooCommerceProducts":
        return <Package className="h-4 w-4" />
      case "getServiceInfo":
        return <Info className="h-4 w-4" />
      case "bookCalendar":
        return <Calendar className="h-4 w-4" />
      case "humanHandoff":
        return <Phone className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getToolDisplayName = () => {
    switch (toolCall.name) {
      case "getWooCommerceProducts":
        return "Product Search"
      case "getServiceInfo":
        return "Service Information"
      case "bookCalendar":
        return "Calendar Booking"
      case "humanHandoff":
        return "Human Support"
      default:
        return toolCall.name
    }
  }

  const statusConfig = getStatusConfig()

  return (
    <Card className="p-3 bg-accent/50 border-accent">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getToolIcon()}
            <span className="text-sm font-medium">{getToolDisplayName()}</span>
            <Badge
              variant={statusConfig.variant}
              className={`flex items-center gap-1 text-xs ${statusConfig.className}`}
            >
              {statusConfig.icon}
              {statusConfig.label}
            </Badge>
          </div>

          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </Button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent className="mt-3 space-y-2">
          {/* Input Parameters */}
          {Object.keys(toolCall.input).length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-1">Input:</h4>
              <div className="bg-muted/50 rounded p-2 text-xs font-mono">
                <pre className="whitespace-pre-wrap">{JSON.stringify(toolCall.input, null, 2)}</pre>
              </div>
            </div>
          )}

          {/* Output/Result */}
          {toolCall.output && (
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-1">Output:</h4>
              <div className="bg-muted/50 rounded p-2 text-xs">
                {typeof toolCall.output === "string" ? (
                  <div className="whitespace-pre-wrap">{toolCall.output}</div>
                ) : (
                  <pre className="font-mono whitespace-pre-wrap">{JSON.stringify(toolCall.output, null, 2)}</pre>
                )}
              </div>
            </div>
          )}

          {/* Error Message */}
          {toolCall.status === "error" && (
            <div>
              <h4 className="text-xs font-medium text-destructive mb-1">Error:</h4>
              <div className="bg-destructive/10 border border-destructive/20 rounded p-2 text-xs text-destructive">
                Tool execution failed. Please try again.
              </div>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

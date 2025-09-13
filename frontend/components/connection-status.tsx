import { ConnectionState } from "@/lib/websocket"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, Loader2, AlertTriangle } from "lucide-react"

interface ConnectionStatusProps {
  state: ConnectionState
  reconnectCount?: number
}

export function ConnectionStatus({ state, reconnectCount = 0 }: ConnectionStatusProps) {
  const getStatusConfig = () => {
    switch (state) {
      case ConnectionState.CONNECTED:
        return {
          icon: <Wifi className="h-3 w-3" />,
          label: "Connected",
          variant: "default" as const,
          className: "bg-green-100 text-green-800 border-green-200",
        }
      case ConnectionState.CONNECTING:
        return {
          icon: <Loader2 className="h-3 w-3 animate-spin" />,
          label: reconnectCount > 0 ? `Reconnecting (${reconnectCount})` : "Connecting",
          variant: "secondary" as const,
          className: "bg-blue-100 text-blue-800 border-blue-200",
        }
      case ConnectionState.ERROR:
        return {
          icon: <AlertTriangle className="h-3 w-3" />,
          label: "Connection Error",
          variant: "destructive" as const,
          className: "bg-red-100 text-red-800 border-red-200",
        }
      case ConnectionState.DISCONNECTED:
      default:
        return {
          icon: <WifiOff className="h-3 w-3" />,
          label: "Disconnected",
          variant: "outline" as const,
          className: "bg-gray-100 text-gray-800 border-gray-200",
        }
    }
  }

  const config = getStatusConfig()

  return (
    <Badge variant={config.variant} className={`flex items-center gap-1 ${config.className}`}>
      {config.icon}
      <span className="text-xs font-medium">{config.label}</span>
    </Badge>
  )
}

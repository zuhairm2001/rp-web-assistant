"use client"

import type { ServiceInfo } from "@/lib/types"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Mail, Phone, ExternalLink, CheckCircle } from "lucide-react"

interface ServiceCardProps {
  service: ServiceInfo
  onContactService?: (service: ServiceInfo) => void
  compact?: boolean
}

export function ServiceCard({ service, onContactService, compact = false }: ServiceCardProps) {
  const getPricingDisplay = () => {
    if (!service.pricing) return "Contact for pricing"

    switch (service.pricing.type) {
      case "fixed":
        return `$${service.pricing.amount} ${service.pricing.currency || "USD"}`
      case "variable":
        return `Starting at $${service.pricing.amount} ${service.pricing.currency || "USD"}`
      case "quote":
        return "Custom quote"
      default:
        return "Contact for pricing"
    }
  }

  return (
    <Card className={`overflow-hidden hover:shadow-md transition-shadow ${compact ? "h-auto" : "h-full"}`}>
      <CardHeader className={compact ? "p-3" : "p-4"}>
        <div className="flex items-start justify-between gap-2">
          <h3 className={`font-semibold leading-tight text-pretty ${compact ? "text-sm" : "text-base"}`}>
            {service.name}
          </h3>
          <Badge variant="secondary" className="text-xs">
            Service
          </Badge>
        </div>
      </CardHeader>

      <CardContent className={compact ? "p-3 pt-0" : "p-4 pt-0"}>
        <p className={`text-muted-foreground leading-relaxed mb-3 ${compact ? "text-xs line-clamp-2" : "text-sm"}`}>
          {service.description}
        </p>

        {service.features && service.features.length > 0 && (
          <div className="space-y-1 mb-3">
            <h4 className="text-xs font-medium text-muted-foreground">Features:</h4>
            <ul className="space-y-1">
              {service.features.slice(0, compact ? 2 : 4).map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-xs">
                  <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
              {compact && service.features.length > 2 && (
                <li className="text-xs text-muted-foreground ml-5">+{service.features.length - 2} more features</li>
              )}
            </ul>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className={`font-semibold ${compact ? "text-sm" : "text-base"}`}>{getPricingDisplay()}</span>
        </div>
      </CardContent>

      <CardFooter className={`flex gap-2 ${compact ? "p-3 pt-0" : "p-4 pt-0"}`}>
        <Button
          variant="default"
          size={compact ? "sm" : "default"}
          className="flex-1"
          onClick={() => onContactService?.(service)}
        >
          Get Quote
        </Button>

        {service.contact && (
          <div className="flex gap-1">
            {service.contact.email && (
              <Button variant="ghost" size={compact ? "sm" : "default"} asChild>
                <a href={`mailto:${service.contact.email}`}>
                  <Mail className="h-4 w-4" />
                </a>
              </Button>
            )}

            {service.contact.phone && (
              <Button variant="ghost" size={compact ? "sm" : "default"} asChild>
                <a href={`tel:${service.contact.phone}`}>
                  <Phone className="h-4 w-4" />
                </a>
              </Button>
            )}

            {service.contact.form_url && (
              <Button variant="ghost" size={compact ? "sm" : "default"} asChild>
                <a href={service.contact.form_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  )
}

"use client"

import type { Product } from "@/lib/types"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, ShoppingCart, Package } from "lucide-react"
import Image from "next/image"

interface ProductCardProps {
  product: Product
  onViewProduct?: (product: Product) => void
  compact?: boolean
}

export function ProductCard({ product, onViewProduct, compact = false }: ProductCardProps) {
  const primaryImage = product.images?.[0]
  const hasDiscount = product.on_sale && product.sale_price !== product.regular_price

  const getStockStatusConfig = () => {
    switch (product.stock_status) {
      case "instock":
        return { label: "In Stock", className: "bg-green-100 text-green-800 border-green-200" }
      case "outofstock":
        return { label: "Out of Stock", className: "bg-red-100 text-red-800 border-red-200" }
      case "onbackorder":
        return { label: "Backorder", className: "bg-yellow-100 text-yellow-800 border-yellow-200" }
      default:
        return { label: "Unknown", className: "bg-gray-100 text-gray-800 border-gray-200" }
    }
  }

  const stockConfig = getStockStatusConfig()

  return (
    <Card className={`overflow-hidden hover:shadow-md transition-shadow ${compact ? "h-auto" : "h-full"}`}>
      <CardHeader className={compact ? "p-3" : "p-4"}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold leading-tight text-pretty ${compact ? "text-sm" : "text-base"}`}>
              {product.name}
            </h3>
            {product.categories.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {product.categories.map((cat) => cat.name).join(", ")}
              </p>
            )}
          </div>
          <Badge className={`text-xs ${stockConfig.className}`}>{stockConfig.label}</Badge>
        </div>
      </CardHeader>

      <CardContent className={compact ? "p-3 pt-0" : "p-4 pt-0"}>
        <div className="flex gap-3">
          {primaryImage ? (
            <div
              className={`relative shrink-0 rounded-md overflow-hidden bg-muted ${compact ? "w-16 h-16" : "w-20 h-20"}`}
            >
              <Image
                src={primaryImage.src || "/placeholder.svg"}
                alt={primaryImage.alt || product.name}
                fill
                className="object-cover"
                sizes={compact ? "64px" : "80px"}
              />
            </div>
          ) : (
            <div
              className={`shrink-0 rounded-md bg-muted flex items-center justify-center ${compact ? "w-16 h-16" : "w-20 h-20"}`}
            >
              <Package className={`text-muted-foreground ${compact ? "h-6 w-6" : "h-8 w-8"}`} />
            </div>
          )}

          <div className="flex-1 min-w-0">
            {product.short_description && (
              <p className={`text-muted-foreground leading-relaxed line-clamp-2 ${compact ? "text-xs" : "text-sm"}`}>
                {product.short_description.replace(/<[^>]*>/g, "")}
              </p>
            )}

            <div className="flex items-center gap-2 mt-2">
              {hasDiscount ? (
                <>
                  <span className={`font-semibold text-primary ${compact ? "text-sm" : "text-base"}`}>
                    ${product.sale_price}
                  </span>
                  <span className={`line-through text-muted-foreground ${compact ? "text-xs" : "text-sm"}`}>
                    ${product.regular_price}
                  </span>
                  <Badge variant="destructive" className="text-xs">
                    Sale
                  </Badge>
                </>
              ) : (
                <span className={`font-semibold ${compact ? "text-sm" : "text-base"}`}>${product.price}</span>
              )}
            </div>

            {product.stock_quantity !== null && (
              <p className="text-xs text-muted-foreground mt-1">{product.stock_quantity} in stock</p>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className={`flex gap-2 ${compact ? "p-3 pt-0" : "p-4 pt-0"}`}>
        <Button
          variant="outline"
          size={compact ? "sm" : "default"}
          className="flex-1 bg-transparent"
          onClick={() => onViewProduct?.(product)}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          View Details
        </Button>

        <Button variant="ghost" size={compact ? "sm" : "default"} asChild>
          <a href={product.permalink} target="_blank" rel="noopener noreferrer" className="flex items-center">
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  )
}

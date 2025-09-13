import type { Product } from "@/lib/types"
import { ProductCard } from "./product-card"
import { Card } from "@/components/ui/card"
import { Package } from "lucide-react"

interface ProductGridProps {
  products: Product[]
  onViewProduct?: (product: Product) => void
  loading?: boolean
  compact?: boolean
  maxItems?: number
}

export function ProductGrid({ products, onViewProduct, loading = false, compact = false, maxItems }: ProductGridProps) {
  const displayProducts = maxItems ? products.slice(0, maxItems) : products

  if (loading) {
    return (
      <div
        className={`grid gap-4 ${compact ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}
      >
        {Array.from({ length: compact ? 2 : 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="p-4">
              <div className="h-4 bg-muted rounded mb-2" />
              <div className="h-3 bg-muted rounded w-2/3 mb-4" />
              <div className="flex gap-3">
                <div className={`bg-muted rounded ${compact ? "w-16 h-16" : "w-20 h-20"}`} />
                <div className="flex-1">
                  <div className="h-3 bg-muted rounded mb-2" />
                  <div className="h-3 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No products found</h3>
        <p className="text-muted-foreground text-sm">Try adjusting your search or browse our categories.</p>
      </Card>
    )
  }

  return (
    <div
      className={`grid gap-4 ${compact ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}
    >
      {displayProducts.map((product) => (
        <ProductCard key={product.id} product={product} onViewProduct={onViewProduct} compact={compact} />
      ))}
    </div>
  )
}

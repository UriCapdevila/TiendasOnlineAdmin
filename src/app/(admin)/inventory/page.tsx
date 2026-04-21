"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Boxes, AlertTriangle, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface InventoryItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  stock: number;
  isAvailable: boolean;
  images: Array<{ url: string }>;
}

export default function InventoryPage() {
  const [products, setProducts] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ products: InventoryItem[]; total: number }>("/api/v1/admin/products?limit=200&sortBy=stock")
      .then((data) => setProducts(data.products))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const adjustStock = async (productId: string, delta: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const newStock = Math.max(0, product.stock + delta);
    try {
      await api.put(`/api/v1/admin/products/${productId}`, { stock: newStock });
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
      );
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-40 bg-muted animate-pulse rounded-lg" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-card animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Inventario</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Controlá y ajustá el stock de tus productos
        </p>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        {products.length === 0 ? (
          <div className="text-center py-16">
            <Boxes className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-lg font-medium text-foreground mb-2">Sin productos</p>
            <p className="text-muted-foreground text-sm">Creá productos para gestionar su inventario</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between px-5 py-4 hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {product.stock <= 5 && (
                    <AlertTriangle className={cn("w-4 h-4 shrink-0", product.stock === 0 ? "text-destructive" : "text-warning")} />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.category}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => adjustStock(product.id, -1)}
                    disabled={product.stock === 0}
                    className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground disabled:opacity-30 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <span
                    className={cn(
                      "w-12 text-center text-sm font-bold",
                      product.stock === 0
                        ? "text-destructive"
                        : product.stock <= 5
                        ? "text-warning"
                        : "text-foreground"
                    )}
                  >
                    {product.stock}
                  </span>

                  <button
                    onClick={() => adjustStock(product.id, 1)}
                    className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

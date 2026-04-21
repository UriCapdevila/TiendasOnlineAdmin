"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import {
  Plus,
  Search,
  Package,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  tags: string[];
  stock: number;
  isAvailable: boolean;
  images: Array<{ url: string; alt: string; isPrimary: boolean }>;
  createdAt: string;
}

interface ProductListResponse {
  products: Product[];
  total: number;
}

function formatCurrency(amount: number, currency = "ARS") {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      params.set("limit", "50");

      const data = await api.get<ProductListResponse>(
        `/api/v1/admin/products?${params.toString()}`
      );
      setProducts(data.products);
      setTotal(data.total);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timeout = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timeout);
  }, [fetchProducts]);

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/v1/admin/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setTotal((prev) => prev - 1);
      setDeleteId(null);
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  };

  const toggleAvailability = async (product: Product) => {
    try {
      await api.put(`/api/v1/admin/products/${product.id}`, {
        isAvailable: !product.isAvailable,
      });
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, isAvailable: !p.isAvailable } : p
        )
      );
    } catch (error) {
      console.error("Failed to toggle availability:", error);
    }
  };

  const primaryImage = (product: Product) => {
    const primary = product.images.find((img) => img.isPrimary);
    return primary?.url || product.images[0]?.url;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Productos</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {total} {total === 1 ? "producto" : "productos"} en tu catálogo
          </p>
        </div>
        <Link
          href="/products/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          Nuevo Producto
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar por nombre o descripción..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Products table */}
      <div className="glass rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-muted/50 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-lg font-medium text-foreground mb-2">No hay productos</p>
            <p className="text-muted-foreground text-sm mb-6">
              {search ? "No se encontraron productos con esa búsqueda" : "Empezá agregando tu primer producto"}
            </p>
            {!search && (
              <Link
                href="/products/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm"
              >
                <Plus className="w-4 h-4" />
                Crear Producto
              </Link>
            )}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Producto
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                  Categoría
                </th>
                <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Precio
                </th>
                <th className="text-center px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                  Stock
                </th>
                <th className="text-center px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                  Estado
                </th>
                <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center overflow-hidden shrink-0">
                        {primaryImage(product) ? (
                          <img
                            src={primaryImage(product)}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-muted-foreground/50" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {product.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <span className="px-2.5 py-1 rounded-lg bg-accent text-xs font-medium text-accent-foreground">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="text-sm font-semibold text-foreground">
                      {formatCurrency(product.price, product.currency)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center hidden sm:table-cell">
                    <span
                      className={cn(
                        "text-sm font-medium",
                        product.stock === 0
                          ? "text-destructive"
                          : product.stock <= 5
                          ? "text-warning"
                          : "text-foreground"
                      )}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center hidden lg:table-cell">
                    <button
                      onClick={() => toggleAvailability(product)}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors",
                        product.isAvailable
                          ? "bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20"
                          : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                      )}
                    >
                      {product.isAvailable ? (
                        <>
                          <Eye className="w-3 h-3" /> Visible
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3" /> Oculto
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/products/${product.id}/edit`}
                        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => setDeleteId(product.id)}
                        className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass rounded-2xl p-6 max-w-sm w-full mx-4 animate-fade-in">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              ¿Eliminar producto?
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Esta acción no se puede deshacer. El producto será eliminado permanentemente.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-accent transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

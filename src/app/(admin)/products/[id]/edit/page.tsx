"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { ArrowLeft, Save, Loader2, Plus, X, Upload, Trash2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  longDescription: string | null;
  price: number;
  currency: string;
  category: string;
  tags: string[];
  stock: number;
  isAvailable: boolean;
  images: Array<{ id: string; url: string; alt: string; isPrimary: boolean; sortOrder: number }>;
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    api
      .get<Product>(`/api/v1/admin/products/${id}`)
      .then(setProduct)
      .catch(() => setError("Producto no encontrado"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    setSaving(true);
    setError(null);

    try {
      await api.put(`/api/v1/admin/products/${id}`, {
        name: product.name,
        description: product.description,
        longDescription: product.longDescription,
        price: product.price,
        category: product.category,
        tags: product.tags,
        stock: product.stock,
        isAvailable: product.isAvailable,
      });
      router.push("/products");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al actualizar");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !product) return;

    try {
      const result = await api.uploadFile<{ url: string; imageId: string }>(
        `/api/v1/admin/products/${id}/upload`,
        file
      );
      setProduct({
        ...product,
        images: [
          ...product.images,
          {
            id: result.imageId,
            url: result.url,
            alt: product.name,
            isPrimary: product.images.length === 0,
            sortOrder: product.images.length,
          },
        ],
      });
    } catch (err) {
      console.error(err);
    }
  };

  const addTag = () => {
    if (!product || !tagInput.trim() || product.tags.includes(tagInput.trim())) return;
    setProduct({ ...product, tags: [...product.tags, tagInput.trim()] });
    setTagInput("");
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="h-8 w-64 bg-muted animate-pulse rounded-lg" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-card animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto text-center py-16">
        <p className="text-foreground text-lg font-medium">Producto no encontrado</p>
        <Link href="/products" className="text-primary text-sm mt-2 inline-block">
          ← Volver a productos
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/products" className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Editar Producto</h1>
          <p className="text-muted-foreground text-sm">{product.name}</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-fade-in">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Images */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-foreground">Imágenes</h2>
          <div className="flex gap-3 flex-wrap">
            {product.images.map((img) => (
              <div key={img.id} className="w-24 h-24 rounded-xl overflow-hidden bg-muted border border-border relative group">
                <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                {img.isPrimary && (
                  <span className="absolute bottom-1 left-1 text-[10px] bg-primary text-white px-1.5 py-0.5 rounded">
                    Principal
                  </span>
                )}
              </div>
            ))}
            <label className="w-24 h-24 rounded-xl border-2 border-dashed border-border hover:border-primary/50 flex items-center justify-center cursor-pointer transition-colors">
              <Upload className="w-6 h-6 text-muted-foreground" />
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          </div>
        </div>

        {/* Basic info */}
        <div className="glass rounded-2xl p-6 space-y-5">
          <h2 className="font-semibold text-foreground">Información Básica</h2>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">Nombre *</label>
            <input
              type="text"
              value={product.name}
              onChange={(e) => setProduct({ ...product, name: e.target.value })}
              required
              className="w-full px-4 py-3 rounded-xl bg-input/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">Descripción corta *</label>
            <textarea
              value={product.description}
              onChange={(e) => setProduct({ ...product, description: e.target.value })}
              rows={2}
              required
              className="w-full px-4 py-3 rounded-xl bg-input/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">Descripción larga</label>
            <textarea
              value={product.longDescription || ""}
              onChange={(e) => setProduct({ ...product, longDescription: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-input/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
            />
          </div>
        </div>

        {/* Price & Stock */}
        <div className="glass rounded-2xl p-6 space-y-5">
          <h2 className="font-semibold text-foreground">Precio y Stock</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">Precio (ARS) *</label>
              <input
                type="number"
                value={product.price}
                onChange={(e) => setProduct({ ...product, price: parseFloat(e.target.value) || 0 })}
                min="0"
                step="0.01"
                required
                className="w-full px-4 py-3 rounded-xl bg-input/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">Stock</label>
              <input
                type="number"
                value={product.stock}
                onChange={(e) => setProduct({ ...product, stock: parseInt(e.target.value) || 0 })}
                min="0"
                className="w-full px-4 py-3 rounded-xl bg-input/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Category & Tags */}
        <div className="glass rounded-2xl p-6 space-y-5">
          <h2 className="font-semibold text-foreground">Categoría y Tags</h2>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">Categoría *</label>
            <input
              type="text"
              value={product.category}
              onChange={(e) => setProduct({ ...product, category: e.target.value })}
              required
              className="w-full px-4 py-3 rounded-xl bg-input/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">Tags</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                placeholder="Agregar tag"
                className="flex-1 px-4 py-3 rounded-xl bg-input/50 border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
              <button type="button" onClick={addTag} className="px-4 py-3 rounded-xl bg-accent text-accent-foreground hover:bg-accent/80 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {product.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium">
                    {tag}
                    <button type="button" onClick={() => setProduct({ ...product, tags: product.tags.filter((t) => t !== tag) })}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Visibility */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-foreground">Visibilidad</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {product.isAvailable ? "Visible en la tienda" : "Oculto"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setProduct({ ...product, isAvailable: !product.isAvailable })}
              className={cn("relative w-12 h-7 rounded-full transition-colors", product.isAvailable ? "bg-primary" : "bg-muted")}
            >
              <span className={cn("absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform", product.isAvailable ? "left-6" : "left-1")} />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/products" className="px-5 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-accent transition-colors">
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}

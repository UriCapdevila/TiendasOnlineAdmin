"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { ArrowLeft, Save, Loader2, Plus, X, Upload } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function NewProductPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    longDescription: "",
    price: "",
    category: "",
    tags: [] as string[],
    stock: "0",
    isAvailable: true,
  });
  const [tagInput, setTagInput] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await api.post("/api/v1/admin/products", {
        name: form.name,
        description: form.description,
        longDescription: form.longDescription || null,
        price: parseFloat(form.price),
        category: form.category,
        tags: form.tags,
        stock: parseInt(form.stock),
        isAvailable: form.isAvailable,
        images: [],
      });
      router.push("/products");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al crear producto");
    } finally {
      setSaving(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm({ ...form, tags: [...form.tags, tagInput.trim()] });
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setForm({ ...form, tags: form.tags.filter((t) => t !== tag) });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/products"
          className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nuevo Producto</h1>
          <p className="text-muted-foreground text-sm">
            Completá los datos de tu nuevo producto
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-fade-in">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <div className="glass rounded-2xl p-6 space-y-5">
          <h2 className="font-semibold text-foreground">Información Básica</h2>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">
              Nombre del producto *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ej: Libreta Artesanal Puntos"
              required
              className="w-full px-4 py-3 rounded-xl bg-input/50 border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">
              Descripción corta *
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Descripción breve que aparece en las tarjetas de producto"
              rows={2}
              required
              className="w-full px-4 py-3 rounded-xl bg-input/50 border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">
              Descripción larga
            </label>
            <textarea
              value={form.longDescription}
              onChange={(e) => setForm({ ...form, longDescription: e.target.value })}
              placeholder="Descripción detallada para la página del producto"
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-input/50 border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
            />
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="glass rounded-2xl p-6 space-y-5">
          <h2 className="font-semibold text-foreground">Precio y Stock</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">
                Precio (ARS) *
              </label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="0"
                min="0"
                step="0.01"
                required
                className="w-full px-4 py-3 rounded-xl bg-input/50 border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">
                Stock inicial
              </label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                placeholder="0"
                min="0"
                className="w-full px-4 py-3 rounded-xl bg-input/50 border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Category & Tags */}
        <div className="glass rounded-2xl p-6 space-y-5">
          <h2 className="font-semibold text-foreground">Categoría y Tags</h2>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">
              Categoría *
            </label>
            <input
              type="text"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="Ej: Libretas, Amigurumis, Skincare"
              required
              className="w-full px-4 py-3 rounded-xl bg-input/50 border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
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
                placeholder="Agregar tag y presionar Enter"
                className="flex-1 px-4 py-3 rounded-xl bg-input/50 border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-3 rounded-xl bg-accent text-accent-foreground hover:bg-accent/80 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {form.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium"
                  >
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)}>
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
                {form.isAvailable
                  ? "El producto será visible en tu tienda"
                  : "El producto estará oculto hasta que lo actives"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setForm({ ...form, isAvailable: !form.isAvailable })}
              className={cn(
                "relative w-12 h-7 rounded-full transition-colors",
                form.isAvailable ? "bg-primary" : "bg-muted"
              )}
            >
              <span
                className={cn(
                  "absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform",
                  form.isAvailable ? "left-6" : "left-1"
                )}
              />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/products"
            className="px-5 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-accent transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? "Guardando..." : "Crear Producto"}
          </button>
        </div>
      </form>
    </div>
  );
}

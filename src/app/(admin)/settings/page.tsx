"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Save, Loader2, Upload, Store } from "lucide-react";
import { cn } from "@/lib/utils";

interface StoreSettings {
  id: string;
  slug: string;
  name: string;
  description: string;
  logoUrl: string | null;
  primaryColor: string;
  accentColor: string;
  whatsappNumber: string | null;
  instagramUrl: string | null;
  email: string | null;
  currency: string;
  isActive: boolean;
}

export default function SettingsPage() {
  const [store, setStore] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api
      .get<StoreSettings>("/api/v1/admin/store")
      .then(setStore)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!store) return;
    setSaving(true);
    setSaved(false);
    try {
      const updated = await api.put<StoreSettings>("/api/v1/admin/store", {
        name: store.name,
        description: store.description,
        primaryColor: store.primaryColor,
        accentColor: store.accentColor,
        whatsappNumber: store.whatsappNumber,
        instagramUrl: store.instagramUrl,
        email: store.email,
      });
      setStore(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await api.uploadFile<{ url: string }>("/api/v1/admin/store/logo", file);
      setStore((prev) => prev ? { ...prev, logoUrl: result.url } : prev);
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="h-8 w-40 bg-muted animate-pulse rounded-lg" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-card animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!store) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mi Tienda</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Configurá la información de tu emprendimiento
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={cn(
            "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-lg",
            saved
              ? "bg-green-500 text-white shadow-green-500/20"
              : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20"
          )}
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saved ? (
            "✓ Guardado"
          ) : (
            <>
              <Save className="w-4 h-4" />
              Guardar Cambios
            </>
          )}
        </button>
      </div>

      {/* Logo & Branding */}
      <div className="glass rounded-2xl p-6 space-y-5">
        <h2 className="font-semibold text-foreground">Logo y Branding</h2>

        <div className="flex items-center gap-6">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-dashed border-border"
            style={{ backgroundColor: store.primaryColor + "20" }}
          >
            {store.logoUrl ? (
              <img src={store.logoUrl} alt={store.name} className="w-full h-full object-cover" />
            ) : (
              <Store className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
          <div>
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-accent-foreground text-sm font-medium cursor-pointer hover:bg-accent/80 transition-colors">
              <Upload className="w-4 h-4" />
              Subir Logo
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </label>
            <p className="text-xs text-muted-foreground mt-2">PNG, JPG o SVG. Máx 2MB.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">Color primario</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={store.primaryColor}
                onChange={(e) => setStore({ ...store, primaryColor: e.target.value })}
                className="w-10 h-10 rounded-lg cursor-pointer border-0"
              />
              <input
                type="text"
                value={store.primaryColor}
                onChange={(e) => setStore({ ...store, primaryColor: e.target.value })}
                className="flex-1 px-4 py-2.5 rounded-xl bg-input/50 border border-border text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">Color accent</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={store.accentColor}
                onChange={(e) => setStore({ ...store, accentColor: e.target.value })}
                className="w-10 h-10 rounded-lg cursor-pointer border-0"
              />
              <input
                type="text"
                value={store.accentColor}
                onChange={(e) => setStore({ ...store, accentColor: e.target.value })}
                className="flex-1 px-4 py-2.5 rounded-xl bg-input/50 border border-border text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Store info */}
      <div className="glass rounded-2xl p-6 space-y-5">
        <h2 className="font-semibold text-foreground">Información</h2>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/80">Nombre de la tienda</label>
          <input
            type="text"
            value={store.name}
            onChange={(e) => setStore({ ...store, name: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-input/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/80">Descripción</label>
          <textarea
            value={store.description}
            onChange={(e) => setStore({ ...store, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 rounded-xl bg-input/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
          />
        </div>
      </div>

      {/* Contact */}
      <div className="glass rounded-2xl p-6 space-y-5">
        <h2 className="font-semibold text-foreground">Contacto</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">WhatsApp</label>
            <input
              type="text"
              value={store.whatsappNumber || ""}
              onChange={(e) => setStore({ ...store, whatsappNumber: e.target.value })}
              placeholder="5491100000000"
              className="w-full px-4 py-3 rounded-xl bg-input/50 border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">Email</label>
            <input
              type="email"
              value={store.email || ""}
              onChange={(e) => setStore({ ...store, email: e.target.value })}
              placeholder="contacto@tienda.com"
              className="w-full px-4 py-3 rounded-xl bg-input/50 border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/80">Instagram URL</label>
          <input
            type="url"
            value={store.instagramUrl || ""}
            onChange={(e) => setStore({ ...store, instagramUrl: e.target.value })}
            placeholder="https://instagram.com/tutienda"
            className="w-full px-4 py-3 rounded-xl bg-input/50 border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>
      </div>
    </div>
  );
}

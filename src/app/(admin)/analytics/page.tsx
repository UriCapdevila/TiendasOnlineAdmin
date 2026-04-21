"use client";

import { BarChart3, Construction } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Estadísticas y métricas de tu tienda
        </p>
      </div>

      <div className="glass rounded-2xl p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
          <BarChart3 className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Próximamente</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Acá vas a poder ver las visitas, conversiones y métricas de venta de tu tienda.
          Estamos trabajando en esta sección.
        </p>
        <div className="flex items-center justify-center gap-2 mt-4 text-muted-foreground/50 text-sm">
          <Construction className="w-4 h-4" />
          En desarrollo
        </div>
      </div>
    </div>
  );
}

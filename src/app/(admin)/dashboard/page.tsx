"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  Package,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardData {
  products: {
    total: number;
    active: number;
    lowStockItems: Array<{
      id: string;
      name: string;
      stock: number;
      category: string;
    }>;
  };
  orders: {
    total: number;
    pending: number;
    recentOrders: Array<{
      id: string;
      status: string;
      total: number;
      customerName: string | null;
      createdAt: string | null;
    }>;
  };
  revenue: {
    last30Days: number;
    allTime: number;
    currency: string;
  };
  store: {
    name: string;
    slug: string;
  };
}

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  reserved: "Reservado",
  paid: "Pagado",
  preparing: "Preparando",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
};

const statusClasses: Record<string, string> = {
  pending: "badge-pending",
  reserved: "badge-pending",
  paid: "badge-paid",
  preparing: "badge-paid",
  shipped: "badge-shipped",
  delivered: "badge-delivered",
  cancelled: "badge-cancelled",
  refunded: "badge-cancelled",
};

function formatCurrency(amount: number, currency = "ARS") {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<DashboardData>("/api/v1/admin/dashboard")
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-card animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const kpis = [
    {
      label: "Productos Activos",
      value: data.products.active,
      total: data.products.total,
      icon: Package,
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
    },
    {
      label: "Pedidos Pendientes",
      value: data.orders.pending,
      total: data.orders.total,
      icon: ShoppingCart,
      color: "text-amber-400",
      bgColor: "bg-amber-400/10",
    },
    {
      label: "Ventas (30 días)",
      value: formatCurrency(data.revenue.last30Days, data.revenue.currency),
      icon: TrendingUp,
      color: "text-green-400",
      bgColor: "bg-green-400/10",
    },
    {
      label: "Ingresos Totales",
      value: formatCurrency(data.revenue.allTime, data.revenue.currency),
      icon: DollarSign,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          ¡Hola! 👋 Bienvenido a <span className="gradient-text">{data.store.name}</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Acá tenés un resumen de tu tienda
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div
              key={i}
              className="glass rounded-2xl p-5 hover:shadow-lg hover:shadow-black/5 transition-all duration-300 group cursor-default"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={cn("p-2.5 rounded-xl", kpi.bgColor)}>
                  <Icon className={cn("w-5 h-5", kpi.color)} />
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
              </div>
              <p className="text-2xl font-bold text-foreground">
                {kpi.value}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {kpi.label}
                {kpi.total !== undefined && (
                  <span className="text-muted-foreground/50"> / {kpi.total} total</span>
                )}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="lg:col-span-2 glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-foreground">Pedidos Recientes</h2>
            <a href="/orders" className="text-sm text-primary hover:text-primary/80 transition-colors">
              Ver todos →
            </a>
          </div>

          {data.orders.recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No hay pedidos aún</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.orders.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between py-3 px-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                      <ShoppingCart className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {order.customerName || `Pedido #${order.id.slice(0, 8)}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn("px-2.5 py-1 rounded-lg text-xs font-medium border", statusClasses[order.status] || "")}>
                      {statusLabels[order.status] || order.status}
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low stock alerts */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <h2 className="font-semibold text-foreground">Stock Bajo</h2>
          </div>

          {data.products.lowStockItems.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                Todo el stock está bien 🎉
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {data.products.lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-muted/30"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground truncate max-w-[160px]">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.category}</p>
                  </div>
                  <span
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-bold",
                      item.stock === 0
                        ? "bg-destructive/10 text-destructive"
                        : "bg-warning/10 text-warning"
                    )}
                  >
                    {item.stock === 0 ? "Agotado" : `${item.stock} uds`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

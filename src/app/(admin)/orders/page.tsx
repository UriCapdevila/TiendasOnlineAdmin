"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ShoppingCart, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface Order {
  id: string;
  status: string;
  customerEmail: string | null;
  customerName: string | null;
  subtotal: number;
  shippingCost: number;
  total: number;
  currency: string;
  items: Array<{
    id: string;
    productName: string;
    quantity: number;
    unitPrice: number;
  }>;
  createdAt: string;
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

const statusOptions = ["", "pending", "reserved", "paid", "preparing", "shipped", "delivered", "cancelled"];

function formatCurrency(amount: number, currency = "ARS") {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency, minimumFractionDigits: 0 }).format(amount);
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(dateStr));
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (statusFilter) params.set("status", statusFilter);
        const data = await api.get<Order[]>(`/api/v1/admin/orders?${params.toString()}`);
        setOrders(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [statusFilter]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      const updated = await api.put<Order>(`/api/v1/admin/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      if (selectedOrder?.id === orderId) setSelectedOrder(updated);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pedidos</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gestioná los pedidos de tu tienda
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <div className="flex gap-2 flex-wrap">
          {statusOptions.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                statusFilter === s
                  ? "bg-primary/10 text-primary border-primary/20"
                  : "bg-card text-muted-foreground border-border hover:text-foreground"
              )}
            >
              {s === "" ? "Todos" : statusLabels[s] || s}
            </button>
          ))}
        </div>
      </div>

      {/* Orders list */}
      <div className="glass rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted/50 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-lg font-medium text-foreground mb-2">No hay pedidos</p>
            <p className="text-muted-foreground text-sm">
              {statusFilter ? "No hay pedidos con ese filtro" : "Los pedidos aparecerán acá cuando los clientes compren"}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Pedido</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Cliente</th>
                <th className="text-center px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Estado</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Total</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {orders.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className="hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-foreground font-mono">
                      #{order.id.slice(0, 8)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.items.length} {order.items.length === 1 ? "item" : "items"}
                    </p>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <p className="text-sm text-foreground">{order.customerName || "—"}</p>
                    <p className="text-xs text-muted-foreground">{order.customerEmail || "—"}</p>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className={cn("px-2.5 py-1 rounded-lg text-xs font-medium border", statusClasses[order.status] || "")}>
                      {statusLabels[order.status] || order.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="text-sm font-semibold text-foreground">
                      {formatCurrency(order.total, order.currency)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right hidden sm:table-cell">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Order detail modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedOrder(null)}>
          <div className="glass rounded-2xl p-6 max-w-lg w-full animate-fade-in max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">
                Pedido #{selectedOrder.id.slice(0, 8)}
              </h3>
              <span className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border", statusClasses[selectedOrder.status] || "")}>
                {statusLabels[selectedOrder.status]}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Cliente</p>
                <p className="text-sm text-foreground">{selectedOrder.customerName || "Sin nombre"}</p>
                <p className="text-xs text-muted-foreground">{selectedOrder.customerEmail || "Sin email"}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2">Items</p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between py-2 px-3 rounded-lg bg-muted/30">
                      <div>
                        <p className="text-sm text-foreground">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        {formatCurrency(item.unitPrice * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">{formatCurrency(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Envío</span>
                  <span className="text-foreground">{formatCurrency(selectedOrder.shippingCost)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold pt-1">
                  <span className="text-foreground">Total</span>
                  <span className="text-foreground">{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>

              {/* Status actions */}
              <div className="pt-3">
                <p className="text-xs text-muted-foreground mb-2">Cambiar estado</p>
                <div className="flex gap-2 flex-wrap">
                  {["paid", "preparing", "shipped", "delivered", "cancelled"].map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(selectedOrder.id, s)}
                      disabled={selectedOrder.status === s}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors disabled:opacity-30",
                        statusClasses[s]
                      )}
                    >
                      {statusLabels[s]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

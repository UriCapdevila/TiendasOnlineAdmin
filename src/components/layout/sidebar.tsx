"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  Store,
  LogOut,
  Boxes,
  ChevronLeft,
} from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";

interface SidebarProps {
  currentPath: string;
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Productos", icon: Package },
  { href: "/orders", label: "Pedidos", icon: ShoppingCart },
  { href: "/inventory", label: "Inventario", icon: Boxes },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

const bottomItems = [
  { href: "/settings", label: "Mi Tienda", icon: Store },
];

export function Sidebar({ currentPath }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuthStore();

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-300 shrink-0",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Store branding */}
      <div className="flex items-center gap-3 p-4 border-b border-sidebar-border min-h-[65px]">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-sm"
          style={{ backgroundColor: user?.storePrimaryColor || "hsl(262, 83%, 58%)" }}
        >
          {user?.storeName?.charAt(0) || "T"}
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="font-semibold text-sm text-sidebar-foreground truncate">
              {user?.storeName}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.storeSlug}
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = currentPath === item.href || (item.href !== "/" && currentPath.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={cn("w-5 h-5 shrink-0", isActive && "text-primary")} />
              {!collapsed && <span>{item.label}</span>}
              {isActive && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="py-3 px-3 space-y-1 border-t border-sidebar-border">
        {bottomItems.map((item) => {
          const isActive = currentPath.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}

        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 w-full"
          title={collapsed ? "Cerrar sesión" : undefined}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Cerrar Sesión</span>}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full py-2 mt-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200"
        >
          <ChevronLeft className={cn("w-4 h-4 transition-transform", collapsed && "rotate-180")} />
        </button>
      </div>
    </aside>
  );
}

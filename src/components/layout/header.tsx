"use client";

import { useAuthStore } from "@/lib/auth-store";
import { Bell, Search } from "lucide-react";

export function Header() {
  const { user } = useAuthStore();

  return (
    <header className="h-[65px] border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6 shrink-0">
      {/* Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar productos, pedidos..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-muted/50 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
          />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
        </button>

        {/* User profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-border">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
            style={{ backgroundColor: user?.storePrimaryColor || "hsl(262, 83%, 58%)" }}
          >
            {user?.name?.charAt(0) || "U"}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-foreground leading-tight">
              {user?.name}
            </p>
            <p className="text-xs text-muted-foreground leading-tight">
              {user?.role === "owner" ? "Propietario" : user?.role}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

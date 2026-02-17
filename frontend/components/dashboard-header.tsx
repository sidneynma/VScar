"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { LogOut, User } from "lucide-react";

export function DashboardHeader() {
  const [mounted, setMounted] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <header className="md:ml-64 bg-card border-b border-border">
        <div className="px-6 py-4 flex justify-between items-center">
          <span className="text-muted-foreground">Carregando...</span>
        </div>
      </header>
    );
  }

  return (
    <header className="md:ml-64 bg-card border-b border-border">
      <div className="px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <User className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <p className="font-semibold text-sm">{user?.name || "Usuário"}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <button onClick={logout} className="btn-ghost flex items-center gap-2">
          <LogOut className="w-5 h-5" />
          <span className="hidden sm:inline">Sair</span>
        </button>
      </div>
    </header>
  );
}

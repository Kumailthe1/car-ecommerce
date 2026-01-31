import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme) return savedTheme as "light" | "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "light";
  });

  const isMobile = useIsMobile();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const [user, setUser] = useState<{ name: string; email: string; role: "admin" | "user" } | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const savedUser = localStorage.getItem("user");
        return savedUser ? JSON.parse(savedUser) : null;
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
        return null;
      }
    }
    return null;
  });

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        user={user}
        onLogout={logout}
      />
      <div
        className={cn(
          "transition-all duration-300",
          isMobile ? "ml-0" : sidebarCollapsed ? "ml-20" : "ml-64"
        )}
      >
        <AppHeader
          theme={theme}
          onToggleTheme={toggleTheme}
          onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          user={user}
        />
        <main className="p-8 max-w-[1600px] mx-auto">
          <Outlet context={{ user }} />
        </main>
      </div>
    </div>
  );
}

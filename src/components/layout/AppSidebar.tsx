import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  LayoutDashboard,
  Car,
  Truck,
  History,
  Settings,
  LogOut,
  ChevronLeft,
  Users,
  CreditCard,
  Heart,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  user: { name: string; email: string; role: "admin" | "user" } | null;
  onLogout: () => void;
}

export function AppSidebar({ collapsed, onToggle, user, onLogout }: AppSidebarProps) {
  const location = useLocation();
  const isMobile = useIsMobile();

  // Navigation items based on role
  const navItems = [
    { title: "Browse Cars", url: "/inventory", icon: Car, show: true },
    {
      title: "Dashboard",
      url: "/",
      icon: LayoutDashboard,
      show: user?.role === "admin"
    },
    {
      title: "User Management",
      url: "/users",
      icon: Users,
      show: user?.role === "admin"
    },
    {
      title: "All Payments",
      url: "/payments",
      icon: CreditCard,
      show: user?.role === "admin"
    },
    {
      title: user?.role === "admin" ? "Shipment Management" : "My Orders",
      url: "/deliveries",
      icon: Package,
      show: !!user
    },
    {
      title: "Wishlist",
      url: "/wishlist",
      icon: Heart,
      show: user?.role === "user"
    },
    {
      title: "Sold History",
      url: "/sold-history",
      icon: History,
      show: user?.role === "admin"
    },
    { title: "Settings", url: "/settings", icon: Settings, show: !!user },
  ];

  // Close sidebar on route change on mobile
  useEffect(() => {
    if (isMobile && !collapsed) {
      onToggle();
    }
  }, [location.pathname, isMobile]);

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobile && !collapsed && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={onToggle}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen transition-all duration-300",
          isMobile
            ? cn("w-64 bg-background shadow-2xl", collapsed ? "-translate-x-full" : "translate-x-0")
            : cn("bg-transparent", collapsed ? "w-16" : "w-60") // Made slightly wider for better readability
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo - Easy Buy */}
          <div className="flex h-20 items-center gap-3 px-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
              <Package className="h-6 w-6 text-primary-foreground" />
            </div>
            {(!collapsed || isMobile) && (
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tighter text-foreground leading-none">
                  EASY BUY
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Automotive</span>
              </div>
            )}
          </div>

          {/* Desktop Toggle Button */}
          {!isMobile && (
            <button
              onClick={onToggle}
              className="absolute -right-3 top-24 flex h-6 w-6 items-center justify-center rounded-full border bg-card shadow-sm hover:bg-muted"
            >
              <ChevronLeft
                className={cn(
                  "h-4 w-4 transition-transform",
                  collapsed && "rotate-180"
                )}
              />
            </button>
          )}

          {/* Navigation */}
          <nav className="flex-1 space-y-1.5 px-4 py-6">
            {navItems.filter(item => item.show).map((item) => {
              const isActive = location.pathname === item.url;
              return (
                <NavLink
                  key={item.title}
                  to={item.url}
                  className={cn(
                    "nav-item flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-bold text-sm",
                    isActive
                      ? "bg-muted text-foreground ring-1 ring-muted-foreground/10"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-primary" : "")} />
                  {(!collapsed || isMobile) && <span>{item.title}</span>}
                </NavLink>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="px-4 py-6 border-t border-muted/20">
            {user && (
              <button
                onClick={onLogout}
                className="nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all font-bold text-sm"
              >
                <LogOut className="h-5 w-5 flex-shrink-0" />
                {(!collapsed || isMobile) && <span>Sign Out</span>}
              </button>
            )}
            {!user && (!collapsed || isMobile) && (
              <NavLink
                to="/login"
                className="nav-item flex items-center gap-3 px-3 py-2.5 rounded-xl bg-muted/50 text-foreground transition-all font-bold text-sm"
              >
                <LayoutDashboard className="h-5 w-5 flex-shrink-0" />
                <span>Sign In</span>
              </NavLink>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

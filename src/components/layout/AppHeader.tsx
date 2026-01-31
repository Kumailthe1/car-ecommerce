import { Search, Sun, Moon, Bell, User, Menu, LogIn } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface AppHeaderProps {
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onMenuToggle: () => void;
  user: { name: string; email: string; role: "admin" | "user" } | null;
}

export function AppHeader({ theme, onToggleTheme, onMenuToggle, user }: AppHeaderProps) {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between bg-background/80 backdrop-blur-md px-4 sm:px-6">
      <div className="flex items-center gap-4">
        {isMobile && (
          <button
            onClick={onMenuToggle}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/50 text-foreground transition-all active:scale-90"
          >
            <Menu className="h-6 w-6" />
          </button>
        )}

        {/* Search - Hidden on small mobile, shown on tablet/desktop */}
        <div className="relative w-full max-w-xs sm:max-w-md hidden xs:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search..."
            className="pl-10 h-10 bg-muted/50 border-none rounded-2xl transition-all focus:bg-muted focus:ring-1 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-muted transition-all active:scale-95"
        >
          {theme === "light" ? (
            <Moon className="h-5 w-5 text-muted-foreground" />
          ) : (
            <Sun className="h-5 w-5 text-muted-foreground" />
          )}
        </button>

        {/* Notifications */}
        <button className="relative flex h-10 w-10 items-center justify-center rounded-xl hover:bg-muted transition-all active:scale-95">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-destructive shadow-sm" />
        </button>

        {/* User Profile / Login */}
        {user ? (
          <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 border-2 border-background shadow-sm">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-bold leading-none">{user.name}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">{user.role}</p>
            </div>
          </div>
        ) : (
          <Button
            onClick={() => navigate("/login")}
            className="h-10 rounded-xl px-4 font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <LogIn className="h-4 w-4" />
            <span className="hidden xs:inline">Login</span>
          </Button>
        )}
      </div>
    </header>
  );
}

import { Link, useLocation } from "wouter";
import {
  Activity, AlertTriangle, ShieldAlert, Cpu, Network, Users, LogOut, Bell, Menu,
  LayoutDashboard, Radio, GitFork, Atom, Settings, Database, BarChart3,
  UserSearch, FlaskConical, Search, FileText, CreditCard, Lock, Headphones,
  Server, UserCog, BrainCircuit
} from "lucide-react";
import { useAuth, setAuthUser } from "@/hooks/use-auth";
import { useLogout, useGetNotifications } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { CyberCorrLogo } from "@/components/cybercorr-logo";

type NavItem = { href: string; label: string; icon: any };

function getNavItems(role: string | undefined): NavItem[] {
  if (role === 'admin') {
    return [
      { href: "/", label: "SOC Overview", icon: LayoutDashboard },
      { href: "/telemetry", label: "Telemetry", icon: Radio },
      { href: "/alerts", label: "Threat Alerts", icon: AlertTriangle },
      { href: "/correlations", label: "Correlation Engine", icon: GitFork },
      { href: "/quantum", label: "Quantum Risk", icon: Atom },
      { href: "/users", label: "User Management", icon: UserCog },
      { href: "/notifications", label: "Audit Logs", icon: FileText },
    ];
  }
  if (role === 'analyst') {
    return [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
      { href: "/customers", label: "Customers", icon: UserSearch },
      { href: "/alerts", label: "Investigations", icon: Search },
      { href: "/telemetry", label: "Threat Correlation", icon: Radio },
      { href: "/correlations", label: "Graph Analysis", icon: GitFork },
      { href: "/quantum", label: "Quantum Monitor", icon: Atom },
      { href: "/notifications", label: "Reports", icon: FileText },
      { href: "/users", label: "User Registry", icon: Users },
    ];
  }
  // standard user
  return [
    { href: "/", label: "My Overview", icon: LayoutDashboard },
    { href: "/transactions", label: "My Transactions", icon: CreditCard },
    { href: "/alerts", label: "My Alerts", icon: AlertTriangle },
    { href: "/notifications", label: "Notifications", icon: Bell },
  ];
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { user, isAnalyst, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const logoutMut = useLogout();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: notifications } = useGetNotifications({
    query: {
      enabled: isAuthenticated,
      queryKey: ["notifications"],
      refetchInterval: 30000,
    }
  });

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  if (!isAuthenticated) return <>{children}</>;

  const handleLogout = () => {
    logoutMut.mutate(undefined, {
      onSettled: () => {
        setAuthUser(null);
        queryClient.clear();
        setLocation("/login");
      }
    });
  };

  const navItems = getNavItems(user?.role);

  const roleLabel = user?.role === 'admin' ? 'SOC Director' : user?.role === 'analyst' ? 'Threat Analyst' : 'Banking User';
  const roleBadgeColor = user?.role === 'admin' ? 'text-[#7C4DFF] border-[#7C4DFF]/40' : user?.role === 'analyst' ? 'text-primary border-primary/40' : 'text-emerald-400 border-emerald-400/40';

  return (
    <div className="flex h-[100dvh] w-full bg-background text-foreground overflow-hidden">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-sidebar z-20">
        <div className="h-16 flex items-center px-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <CyberCorrLogo className="w-9 h-9 shrink-0" />
            <div>
              <div className="text-primary font-bold font-mono tracking-wider text-sm leading-none">
                CYBER<span className="text-white">CORR</span>
              </div>
              <div className="text-[9px] text-muted-foreground font-mono leading-none mt-0.5 tracking-wide">
                AI THREAT INTELLIGENCE
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-5 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all font-mono cursor-pointer",
                location === item.href
                  ? "bg-primary/20 text-primary border border-primary/50 shadow-[0_0_10px_rgba(0,229,255,0.1)]"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              )}>
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
              </div>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border bg-sidebar/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center border border-primary/30 text-primary font-bold shadow-[0_0_10px_rgba(0,229,255,0.2)] shrink-0">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-sm font-bold truncate">{user?.name}</div>
              <div className={`text-[10px] font-mono border rounded px-1.5 py-0.5 inline-block mt-0.5 ${roleBadgeColor}`}>
                {roleLabel}
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full justify-start text-muted-foreground text-xs" onClick={handleLogout}>
            <LogOut className="w-3.5 h-3.5 mr-2" />
            Disconnect Session
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-4 lg:px-8 z-10">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-foreground" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold font-mono tracking-tight text-white capitalize hidden sm:block">
              {navItems.find(n => n.href === location)?.label ?? (location === "/" ? "Overview" : location.replace("/", "").replace(/-/g, " "))}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/notifications">
              <Button variant="ghost" size="icon" className="relative cursor-pointer hover:bg-primary/10">
                <Bell className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive shadow-[0_0_8px_rgba(255,45,85,1)]" />
                )}
              </Button>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none z-0" />
          <div className="relative z-10 h-full">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex flex-col">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <div className="flex items-center gap-2.5 text-primary font-bold font-mono">
              <CyberCorrLogo className="w-8 h-8" /> CYBERCORR
            </div>
            <Button variant="ghost" onClick={() => setMobileMenuOpen(false)}>Close</Button>
          </div>
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <div
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-lg text-lg font-mono",
                    location === item.href
                      ? "bg-primary/20 text-primary border border-primary/50"
                      : "text-muted-foreground"
                  )}>
                  <item.icon className="w-6 h-6" />
                  {item.label}
                </div>
              </Link>
            ))}
          </nav>
          <div className="p-8 border-t border-border">
            <Button variant="destructive" className="w-full" onClick={handleLogout}>Disconnect</Button>
          </div>
        </div>
      )}
    </div>
  );
}

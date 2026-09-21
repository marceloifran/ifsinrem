import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { checkRolePermission } from "@/services/permissionService";
import LanguageSelector from "@/components/LanguageSelector";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LayoutDashboard,
  Building2,
  Boxes,
  Truck,
  QrCode,
  Users,
  BarChart3,
  Shield,
  Settings,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  PlusCircle,
  ExternalLink
} from "lucide-react";

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, isAdmin, signOut, isLoading: authLoading } = useAuth();
  const { t, language } = useLanguage();

  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("ifsinrem_sidebar_collapsed") === "true";
    }
    return false;
  });

  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") || "light";
    }
    return "light";
  });

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem("ifsinrem_sidebar_collapsed", String(next));
  };

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    if (next === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
    window.dispatchEvent(new CustomEvent("theme-changed", { detail: next }));
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } finally {
      navigate("/auth");
    }
  };

  const effectiveRole = profile?.role || user?.user_metadata?.role || (isAdmin ? "admin" : "owner");
  const companyId = profile?.company_id;
  const isSuperAdminPage = location.pathname === "/superadmin";
  const isUserAdminOrOwner = profile?.role === "owner" || profile?.role === "admin" || (!profile && authLoading) || checkRolePermission(effectiveRole, "manage_users_roles", companyId);

  // Grouped Navigation Items
  const navGroups = [
    {
      title: "Operaciones",
      items: [
        ...(checkRolePermission(effectiveRole, "view_dashboard", companyId) ? [{
          path: "/dashboard",
          label: t("nav.dashboard") || "Dashboard",
          icon: LayoutDashboard,
        }] : []),
        ...(checkRolePermission(effectiveRole, "view_locations", companyId) ? [{
          path: "/ubicaciones",
          label: t("nav.locations") || "Ubicaciones",
          icon: Building2,
        }] : []),
        ...(checkRolePermission(effectiveRole, "view_inventario", companyId) ? [{
          path: "/inventario",
          label: t("nav.inventory") || "Inventario & Stock",
          icon: Boxes,
        }] : []),
        ...(checkRolePermission(effectiveRole, "view_transfers", companyId) ? [{
          path: "/transferencias",
          label: t("nav.transfers") || "Transferencias",
          icon: Truck,
        }] : []),
        {
          path: "/recepcion",
          label: t("nav.reception") || "Recepción QR",
          icon: QrCode,
          badge: "Mobile",
        },
      ],
    },
    {
      title: "Personal & Seguridad",
      items: [
        ...(checkRolePermission(effectiveRole, "view_operarios", companyId) ? [{
          path: "/operarios",
          label: t("nav.employees") || "Operarios",
          icon: Users,
        }] : []),
        ...(checkRolePermission(effectiveRole, "view_reportes", companyId) ? [{
          path: "/reportes",
          label: t("nav.reports") || "Reportes SRT 299",
          icon: BarChart3,
        }] : []),
      ],
    },
    {
      title: "Administración",
      items: [
        ...(isUserAdminOrOwner ? [{
          path: "/usuarios",
          label: t("nav.users") || "Usuarios & Roles",
          icon: Shield,
        }] : []),
        ...(checkRolePermission(effectiveRole, "view_configuracion", companyId) ? [{
          path: "/configuracion",
          label: t("nav.settings") || "Configuración",
          icon: Settings,
        }] : []),
      ],
    },
  ];

  const renderNavContent = () => (
    <div className="flex flex-col h-full justify-between select-none">
      {/* Top Header: Logo + Toggle */}
      <div>
        <div className="flex items-center justify-between p-4 border-b border-border/80 h-16">
          <div
            onClick={() => {
              if (onMobileClose) onMobileClose();
              navigate(isSuperAdminPage ? "/superadmin" : "/dashboard");
            }}
            className="flex items-center gap-3 cursor-pointer overflow-hidden"
          >
            <div className="h-9 w-9 min-w-[36px] rounded-xl overflow-hidden shadow-md border border-emerald-500/30 flex items-center justify-center bg-slate-950">
              <img src="/logo.png" alt="Logo" className="h-full w-full object-cover" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-foreground flex items-center gap-1">
                  ifsin<span className="text-emerald-500 font-extrabold">rem</span>
                </span>
                <span className="text-[10px] text-muted-foreground tracking-wider uppercase font-semibold">
                  Operaciones Físicas
                </span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            className="hidden md:flex h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg"
            title={isCollapsed ? "Expandir Menú Lateral" : "Colapsar Menú Lateral"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>

          {/* Mobile Close Button */}
          {onMobileClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMobileClose}
              className="md:hidden h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-6 overflow-y-auto max-h-[calc(100vh-14rem)] custom-scrollbar">
          {navGroups.map((group, gIdx) => {
            if (group.items.length === 0) return null;
            return (
              <div key={gIdx} className="space-y-1">
                {!isCollapsed && (
                  <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 block mb-1.5">
                    {group.title}
                  </span>
                )}
                {group.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;

                  const buttonContent = (
                    <button
                      key={item.path}
                      onClick={() => {
                        if (onMobileClose) onMobileClose();
                        navigate(item.path);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group relative ${
                        isActive
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                      } ${isCollapsed ? "justify-center px-0" : ""}`}
                    >
                      <Icon
                        className={`w-4.5 h-4.5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                          isActive ? "text-emerald-500" : "text-muted-foreground"
                        }`}
                      />

                      {!isCollapsed && (
                        <span className="truncate flex-1 text-left">{item.label}</span>
                      )}

                      {!isCollapsed && item.badge && (
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-mono font-bold">
                          {item.badge}
                        </span>
                      )}

                      {/* Active Indicator Strip */}
                      {isActive && isCollapsed && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-emerald-500 rounded-r-full" />
                      )}
                    </button>
                  );

                  if (isCollapsed) {
                    return (
                      <Tooltip key={item.path} delayDuration={100}>
                        <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
                        <TooltipContent side="right" className="font-semibold text-xs bg-slate-900 text-white border-slate-800">
                          {item.label}
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return buttonContent;
                })}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer: User Profile & Preferences */}
      <div className="p-3 border-t border-border/80 bg-background/50 space-y-2">
        {/* User Card */}
        <div
          onClick={() => navigate("/configuracion")}
          className={`flex items-center gap-2.5 p-2 rounded-xl hover:bg-accent/60 cursor-pointer transition-colors ${
            isCollapsed ? "justify-center p-1" : ""
          }`}
          title="Ver Perfil y Configuración"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm">
            {(profile?.name || user?.email || "U").slice(0, 2).toUpperCase()}
          </div>

          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-foreground truncate">
                {profile?.name || user?.email?.split("@")[0] || "Usuario"}
              </p>
              <span className="text-[10px] text-muted-foreground uppercase font-mono block truncate">
                {profile?.role || "Operador"} {profile?.plan ? `· ${profile.plan}` : ""}
              </span>
            </div>
          )}
        </div>

        {/* Quick Controls: Theme, Language, Logout */}
        <div className={`flex items-center gap-1 pt-1 ${isCollapsed ? "flex-col" : "justify-between"}`}>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg"
            title={theme === "light" ? "Modo Oscuro" : "Modo Claro"}
          >
            {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </Button>

          {!isCollapsed && <LanguageSelector />}

          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="h-8 w-8 text-muted-foreground hover:text-red-400 rounded-lg"
            title="Cerrar Sesión"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden md:block fixed left-0 top-0 h-screen bg-card border-r border-border z-40 transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {renderNavContent()}
      </aside>

      {/* Mobile Drawer (Slide-over overlay) */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={onMobileClose}
          />
          {/* Drawer Content */}
          <div className="relative w-72 max-w-[80vw] h-full bg-card border-r border-border shadow-2xl z-50 animate-in slide-in-from-left duration-300">
            {renderNavContent()}
          </div>
        </div>
      )}
    </>
  );
}

import { Button } from "@/components/ui/button";
import { LogOut, User, LayoutDashboard, BarChart3, Users, Boxes, Shield, Sun, Moon, Menu, X, Snowflake, ShieldAlert, Calendar, Building2, Truck, QrCode } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSelector from "@/components/LanguageSelector";
import { useEffect, useState } from "react";
import { checkRolePermission } from "@/services/permissionService";
import { openCalDemo } from "@/utils/cal";

interface HeaderProps {
  userName?: string;
  onLogout?: () => void;
  isAdmin?: boolean;
  userPlan?: string;
}

const Header = ({ userName = "Usuario", onLogout, isAdmin = false, userPlan }: HeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, isLoading: authLoading, signOut } = useAuth();
  const [permissionsVer, setPermissionsVer] = useState(0);

  const handleSignOut = async () => {
    try {
      if (onLogout) {
        await onLogout();
      }
      await signOut();
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    } finally {
      navigate('/auth');
    }
  };

  const isSuperAdminPage = location.pathname === '/superadmin';

  // Effective role derived from profile, user metadata, or default to owner/admin while profile is loading
  const effectiveRole = profile?.role || user?.user_metadata?.role || (isAdmin ? "admin" : "owner");
  const companyId = profile?.company_id;
  const isUserAdminOrOwner = profile?.role === "owner" || profile?.role === "admin" || (!profile && authLoading) || checkRolePermission(effectiveRole, "manage_users_roles", companyId);

  // User display name: profile name -> user metadata name -> userName prop (if not an email) -> null (shows skeleton)
  const rawDisplayName = profile?.name || user?.user_metadata?.name || (userName && !userName.includes('@') ? userName : null);

  // Theme state synced with documentElement class list and localStorage
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") || "light";
    }
    return "light";
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handlePermissionsUpdated = () => {
      setPermissionsVer((v) => v + 1);
    };
    window.addEventListener("permissions-updated", handlePermissionsUpdated);
    return () => {
      window.removeEventListener("permissions-updated", handlePermissionsUpdated);
    };
  }, []);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [theme]);

  useEffect(() => {
    const handleGlobalTheme = (e: any) => {
      setTheme(e.detail);
    };
    window.addEventListener("theme-changed", handleGlobalTheme);
    return () => {
      window.removeEventListener("theme-changed", handleGlobalTheme);
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    window.dispatchEvent(new CustomEvent("theme-changed", { detail: nextTheme }));
  };

  const { t } = useLanguage();

  // If on SuperAdmin portal, hide normal user company navigation
  const navItems = isSuperAdminPage ? [] : [
    ...(checkRolePermission(effectiveRole, "view_dashboard", companyId) ? [{
      path: '/dashboard',
      label: t('nav.dashboard'),
      icon: LayoutDashboard,
    }] : []),
    ...(checkRolePermission(effectiveRole, "view_locations", companyId) ? [{
      path: '/ubicaciones',
      label: t('nav.locations'),
      icon: Building2,
    }] : []),
    ...(checkRolePermission(effectiveRole, "view_inventario", companyId) ? [{
      path: '/inventario',
      label: t('nav.inventory'),
      icon: Boxes,
    }] : []),
    ...(checkRolePermission(effectiveRole, "view_transfers", companyId) ? [{
      path: '/transferencias',
      label: t('nav.transfers'),
      icon: Truck,
    }] : []),
    ...(checkRolePermission(effectiveRole, "view_operarios", companyId) ? [{
      path: '/operarios',
      label: t('nav.employees'),
      icon: Users,
    }] : []),
    ...(checkRolePermission(effectiveRole, "view_reportes", companyId) ? [{
      path: '/reportes',
      label: t('nav.reports'),
      icon: BarChart3,
    }] : []),
    ...(isUserAdminOrOwner ? [{
      path: '/usuarios',
      label: t('nav.users'),
      icon: Shield,
    }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/85 dark:bg-[#070b14]/85 backdrop-blur-md border-b border-border dark:border-slate-800/80 transition-colors duration-200">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3 md:h-16">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer flex-shrink-0"
            onClick={() => {
              setMobileMenuOpen(false);
              navigate(isSuperAdminPage ? '/superadmin' : '/dashboard');
            }}
          >
            <div className="h-8 w-8 md:h-9 md:w-9 rounded-xl overflow-hidden shadow-md border border-emerald-500/30 flex items-center justify-center bg-slate-950/80">
              <img src="/logo.png" alt="Logo" className="h-full w-full object-cover rounded-xl" />
            </div>
            <span className="text-lg md:text-xl font-bold text-foreground dark:text-white tracking-tight">
              ifsin<span className="text-emerald-500">rem</span>
            </span>
            {isSuperAdminPage && (
              <span className="hidden sm:flex ml-1 md:ml-2 bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] md:text-[11px] px-2 md:px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-amber-400" />
                Admin
              </span>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center gap-1 md:gap-2">
            {navItems.length > 0 && (
              <nav className="flex items-center gap-0.5 md:gap-1 bg-muted/50 dark:bg-slate-900/60 p-1 rounded-lg border border-slate-200/20 dark:border-slate-800/40">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className={`
                        flex items-center gap-1 px-2 md:px-3.5 py-1.5 md:py-2 rounded-md text-xs md:text-sm font-semibold
                        transition-all duration-200 whitespace-nowrap
                        ${isActive
                          ? 'bg-white dark:bg-[#0c101d] text-slate-900 dark:text-white shadow-sm border border-slate-200/10 dark:border-slate-800/30'
                          : 'text-muted-foreground dark:text-slate-400 hover:text-foreground dark:hover:text-white hover:bg-white/40 dark:hover:bg-slate-800/40'
                        }
                      `}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="hidden md:inline">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            )}

            <LanguageSelector />

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-muted-foreground dark:text-slate-400 hover:text-foreground dark:hover:text-white h-9 w-9"
              title="Cambiar tema de la interfaz"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </Button>

            {!isSuperAdminPage && (
              <button
                onClick={() => navigate('/configuracion')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary dark:bg-[#0d1220] hover:bg-secondary/80 dark:hover:bg-[#12192c] border border-transparent dark:border-slate-800/35 transition-colors cursor-pointer"
              >
                <User className="w-4 h-4 text-muted-foreground dark:text-slate-400" />
                {rawDisplayName ? (
                  <span className="text-sm font-medium text-secondary-foreground dark:text-slate-350">
                    {rawDisplayName}
                  </span>
                ) : (
                  <div className="h-3.5 w-24 bg-slate-200 dark:bg-slate-800/80 animate-pulse rounded" />
                )}
              </button>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="text-muted-foreground dark:text-slate-400 hover:text-foreground dark:hover:text-white"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>

          {/* Mobile controls */}
          <div className="flex md:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-muted-foreground dark:text-slate-400 hover:text-foreground dark:hover:text-white"
            >
              {theme === "dark" ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5 text-slate-600" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-muted-foreground dark:text-slate-400 hover:text-foreground dark:hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border dark:border-slate-800/80 bg-background dark:bg-[#080c14] px-4 py-4 space-y-3 animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <button
                  key={item.path}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate(item.path);
                  }}
                  className={`
                    flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all
                    ${isActive
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      : 'text-muted-foreground dark:text-slate-400 hover:bg-muted/50 dark:hover:bg-slate-900/60'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {navItems.length > 0 && <div className="h-px bg-border dark:bg-slate-800/80 my-2" />}

            {!isSuperAdminPage && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/configuracion');
                }}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-muted-foreground dark:text-slate-400 hover:bg-muted/50 dark:hover:bg-slate-900/60"
              >
                <User className="w-5 h-5 shrink-0" />
                <span>Mi Perfil {rawDisplayName ? `(${rawDisplayName})` : ''}</span>
              </button>
            )}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleSignOut();
              }}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-500/10"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              <span>Cerrar Sesión</span>
            </button>
          </nav>
        </div>
      )}

      {profile?.is_frozen && !isSuperAdminPage && (
        <div className="bg-cyan-950/90 border-t border-b border-cyan-500/30 text-cyan-200 px-4 py-2 text-center text-xs font-bold flex items-center justify-center gap-2 shadow-inner">
          <Snowflake className="w-4 h-4 text-cyan-400 shrink-0 animate-pulse" />
          <span>EMPRESA SUSPENDIDA / CONGELADA: Tu cuenta fue congelada por el Administrador. Podés ingresar y consultar datos, pero la edición y creación están restringidas.</span>
        </div>
      )}
    </header>
  );
};

export default Header;

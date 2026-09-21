import { useState, useEffect, ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Button } from "@/components/ui/button";
import { Menu, QrCode, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("ifsinrem_sidebar_collapsed") === "true";
    }
    return false;
  });

  useEffect(() => {
    const handleStorage = () => {
      setIsCollapsed(localStorage.getItem("ifsinrem_sidebar_collapsed") === "true");
    };

    window.addEventListener("storage", handleStorage);
    // Interval check or custom event
    const interval = setInterval(handleStorage, 300);
    return () => {
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      {/* Sidebar (Desktop + Mobile Drawer) */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 min-w-0 flex flex-col transition-all duration-300 ease-in-out ${
          isCollapsed ? "md:pl-20" : "md:pl-64"
        }`}
      >
        {/* Mobile Top Navigation Bar */}
        <header className="md:hidden sticky top-0 z-30 bg-card/90 backdrop-blur-md border-b border-border h-14 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileSidebarOpen(true)}
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 cursor-pointer"
            >
              <div className="h-7 w-7 rounded-lg overflow-hidden shadow-sm border border-emerald-500/30 flex items-center justify-center bg-slate-950">
                <img src="/logo.png" alt="Logo" className="h-full w-full object-cover" />
              </div>
              <span className="text-base font-bold tracking-tight text-foreground">
                ifsin<span className="text-emerald-500">rem</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate("/recepcion")}
              className="h-8 text-xs gap-1 border-emerald-500/30 text-emerald-400"
            >
              <QrCode className="w-3.5 h-3.5" /> Recepción
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}

export default AppLayout;

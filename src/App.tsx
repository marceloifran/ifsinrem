import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import UserSettings from "./pages/UserSettings";
import Reports from "./pages/Reports";
import Welcome from "./pages/Welcome";
import Employees from "./pages/Employees";
import EPPInventory from "./pages/EPPInventory";
import VerifyDelivery from "./pages/VerifyDelivery";
import UserManagement from "./pages/UserManagement";
import SuperAdmin from "./pages/SuperAdmin";
import NotFound from "./pages/NotFound";
import AboutUs from "./pages/AboutUs";
import Security from "./pages/Security";
import Contact from "./pages/Contact";
import Resources from "./pages/Resources";

import { useEffect } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes cache - avoid unnecessary repeated API requests
      gcTime: 1000 * 60 * 30,    // 30 minutes memory persistence
      refetchOnWindowFocus: false, // Do not refetch when switching tabs/windows
      refetchOnReconnect: false,
    },
  },
});

const App = () => {
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner position="top-center" />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/operarios" element={<Employees />} />
                <Route path="/inventario" element={<EPPInventory />} />
                <Route path="/configuracion" element={<UserSettings />} />
                <Route path="/usuarios" element={<UserManagement />} />
                <Route path="/superadmin" element={<SuperAdmin />} />
                <Route path="/reportes" element={<Reports />} />
                <Route path="/bienvenida" element={<Welcome />} />
                <Route path="/verificar-constancia/:id" element={<VerifyDelivery />} />
                <Route path="/nosotros" element={<AboutUs />} />
                <Route path="/seguridad" element={<Security />} />
                <Route path="/contacto" element={<Contact />} />
                <Route path="/recursos" element={<Resources />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { SuperAdminPlanManager } from "@/components/SuperAdminPlanManager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { ShieldAlert, ArrowLeft, Lock, KeyRound, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function SuperAdmin() {
  const navigate = useNavigate();
  const { user, profile, isAdmin, signOut } = useAuth();
  const [passcode, setPasscode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if session previously unlocked superadmin mode
  useEffect(() => {
    const isUnlocked = sessionStorage.getItem("superadmin_unlocked") === "true";
    if (isUnlocked) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    // Default master PIN or admin check
    if (passcode === "admin123" || passcode === "superadmin" || passcode === "123456" || isAdmin) {
      setIsAuthenticated(true);
      sessionStorage.setItem("superadmin_unlocked", "true");
      toast.success("Modo SuperAdmin Activado");
    } else {
      toast.error("Clave de SuperAdmin incorrecta");
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Header
        userName={profile?.name || user?.email || "SuperAdmin"}
        onLogout={handleLogout}
        isAdmin={true}
        userPlan="enterprise"
      />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al dashboard
        </button>

        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                Portal SuperAdmin
              </h1>
              <p className="text-sm text-slate-400">
                Gestión global de empresas, asignación de planes y desbloqueo de límites de usuarios.
              </p>
            </div>
          </div>
        </div>

        {!isAuthenticated ? (
          <Card className="max-w-md mx-auto p-8 border-slate-800 bg-slate-950/80 shadow-2xl text-center space-y-6">
            <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center">
              <Lock className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Acceso Restringido a SuperAdmin</h2>
              <p className="text-xs text-slate-400 mt-1">
                Ingresá la clave maestra para acceder a la gestión de empresas y planes.
              </p>
            </div>

            <form onSubmit={handleUnlock} className="space-y-4">
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  type="password"
                  placeholder="Clave de SuperAdmin"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="pl-10 bg-slate-900 border-slate-800 text-white rounded-xl"
                  autoFocus
                />
              </div>

              <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl h-11">
                Desbloquear Portal SuperAdmin
              </Button>
            </form>
          </Card>
        ) : (
          <div className="space-y-6">
            <SuperAdminPlanManager />
          </div>
        )}
      </main>
    </div>
  );
}

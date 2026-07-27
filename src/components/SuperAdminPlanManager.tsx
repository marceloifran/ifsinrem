import { useState, useEffect } from "react";
import { createClient } from '@supabase/supabase-js';
import {
  getAllCompaniesOverview,
  updateCompanyPlanAndLimits,
  updateCompanyStatus,
  deleteCompany,
  createCompany,
  getPlanMaxUsers,
  CompanyPlanOverview,
} from "@/services/userService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { ShieldAlert, Save, Building2, Users, Loader2, Snowflake, Flame, Trash2, ShieldCheck, Plus, Mail, Lock, User, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://rrxdlswuqwhoeojcksvs.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export function SuperAdminPlanManager() {
  const { refreshProfile } = useAuth();
  const [companies, setCompanies] = useState<CompanyPlanOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [freezingId, setFreezingId] = useState<string | null>(null);

  // Editable local state per company
  const [plans, setPlans] = useState<Record<string, 'starter' | 'professional' | 'enterprise'>>({});

  // New Company & Admin Registration state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newCompanyCuit, setNewCompanyCuit] = useState("");
  const [newCompanyPlan, setNewCompanyPlan] = useState<'starter' | 'professional' | 'enterprise'>('starter');
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const data = await getAllCompaniesOverview();
      setCompanies(data);

      const initialPlans: Record<string, 'starter' | 'professional' | 'enterprise'> = {};
      data.forEach((c) => {
        initialPlans[c.id] = c.plan;
      });

      setPlans(initialPlans);
    } catch (err: any) {
      console.error("Error loading companies overview:", err);
      toast.error("Error al cargar las empresas");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (companyId: string) => {
    const selectedPlan = plans[companyId] || 'starter';
    const newMaxUsers = getPlanMaxUsers(selectedPlan);

    setSavingId(companyId);
    try {
      await updateCompanyPlanAndLimits(companyId, selectedPlan);
      setCompanies((prev) =>
        prev.map((c) =>
          c.id === companyId ? { ...c, plan: selectedPlan, max_users: newMaxUsers } : c
        )
      );
      toast.success(`Plan de la empresa actualizado a ${selectedPlan.toUpperCase()}`);
      await refreshProfile();
      await loadCompanies();
    } catch (err: any) {
      console.error("Error updating plan:", err);
      toast.error(err.message || "Error al actualizar el plan de la empresa");
    } finally {
      setSavingId(null);
    }
  };

  const handleToggleFreeze = async (company: CompanyPlanOverview) => {
    const newStatus = company.status === 'frozen' ? 'active' : 'frozen';
    setFreezingId(company.id);
    try {
      await updateCompanyStatus(company.id, newStatus);
      toast.success(newStatus === 'frozen' ? `Empresa "${company.name}" congelada` : `Empresa "${company.name}" reactivada`);
      await refreshProfile();
      await loadCompanies();
    } catch (err: any) {
      console.error("Error updating company status:", err);
      toast.error("Error al cambiar el estado de la empresa");
    } finally {
      setFreezingId(null);
    }
  };

  const handleDeleteCompany = async (company: CompanyPlanOverview) => {
    setDeletingId(company.id);
    try {
      await deleteCompany(company.id);
      toast.success(`Empresa "${company.name}" eliminada correctamente`);
      await refreshProfile();
      await loadCompanies();
    } catch (err: any) {
      console.error("Error deleting company:", err);
      toast.error(err.message || "Error al eliminar la empresa");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreateCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim()) {
      toast.error("Por favor ingresá el nombre de la empresa");
      return;
    }
    if (!newAdminEmail.trim() || !newAdminPassword.trim()) {
      toast.error("Por favor ingresá el email y clave para la cuenta Administradora");
      return;
    }
    if (newAdminPassword.trim().length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setIsCreating(true);
    try {
      // Create isolated Supabase auth client so SuperAdmin session is untouched
      const tempClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false
        }
      });

      const { data: authData, error: authError } = await tempClient.auth.signUp({
        email: newAdminEmail.trim().toLowerCase(),
        password: newAdminPassword.trim(),
        options: {
          data: {
            name: newAdminName.trim() || newCompanyName.trim() + " Admin",
            plan: newCompanyPlan,
            company_name: newCompanyName.trim(),
          }
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          toast.error("Este email ya está registrado en la plataforma.");
          setIsCreating(false);
          return;
        }
        throw authError;
      }

      toast.success(`Empresa "${newCompanyName}" y cuenta de Administrador (${newAdminEmail}) creadas exitosamente.`);

      setCreateDialogOpen(false);
      setNewCompanyName("");
      setNewCompanyCuit("");
      setNewCompanyPlan("starter");
      setNewAdminName("");
      setNewAdminEmail("");
      setNewAdminPassword("");
      await loadCompanies();
    } catch (err: any) {
      console.error("Error creating company with admin:", err);
      toast.error(err.message || "Error al registrar la empresa y cuenta de administrador");
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="card-elevated p-8 text-center flex items-center justify-center gap-3">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
        <span className="text-sm text-muted-foreground font-medium">Cargando empresas y planes...</span>
      </div>
    );
  }

  return (
    <div className="card-elevated p-6 animate-fade-in border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-background to-background">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              Panel SuperAdmin: Gestión de Planes y Cuentas
            </h3>
            <p className="text-xs text-muted-foreground">
              Dá de alta empresas asignando su cuenta de Administrador (mail + clave), modificá planes corporativos, congelá o eliminá empresas.
            </p>
          </div>
        </div>

        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-2 rounded-xl shadow-lg shadow-emerald-600/20 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Dar de Alta Empresa y Admin
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead>Empresa & Estado</TableHead>
              <TableHead>Usuarios Actuales / Límite</TableHead>
              <TableHead>Plan Activo</TableHead>
              <TableHead className="text-right">Acciones SuperAdmin</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.map((company) => {
              const currentPlan = plans[company.id] || company.plan;
              const expectedLimit = getPlanMaxUsers(currentPlan);
              const isUnlimited = expectedLimit === -1;
              const isSaving = savingId === company.id;
              const isFreezing = freezingId === company.id;
              const isDeleting = deletingId === company.id;
              const isFrozen = company.status === 'frozen';

              return (
                <TableRow key={company.id} className={`hover:bg-muted/30 ${isFrozen ? 'bg-cyan-950/20' : ''}`}>
                  <TableCell>
                    <div className="flex items-start gap-2.5">
                      <Building2 className={`w-4 h-4 mt-1 shrink-0 ${isFrozen ? 'text-cyan-400' : 'text-muted-foreground'}`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground">{company.name}</span>
                          {isFrozen ? (
                            <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30 text-[10px] font-bold gap-1">
                              <Snowflake className="w-3 h-3 text-cyan-400" /> Congelada
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px] font-bold gap-1">
                              <ShieldCheck className="w-3 h-3 text-emerald-400" /> Activa
                            </Badge>
                          )}
                        </div>
                        {company.cuit && (
                          <div className="text-[11px] text-muted-foreground font-mono mt-0.5">CUIT: {company.cuit}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2 font-mono text-sm">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="font-bold text-foreground">{company.user_count}</span>
                      <span className="text-muted-foreground">/</span>
                      <span className="text-muted-foreground font-semibold">
                        {isUnlimited ? "∞ Ilimitados" : `${company.max_users} max`}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="w-44">
                      <Select
                        value={currentPlan}
                        disabled={isSaving || isFreezing || isDeleting}
                        onValueChange={(val: 'starter' | 'professional' | 'enterprise') => {
                          setPlans((prev) => ({ ...prev, [company.id]: val }));
                        }}
                      >
                        <SelectTrigger className="h-8 text-xs font-semibold rounded-lg bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="starter">
                            <span className="font-bold text-emerald-500">Starter</span> (3 usuarios)
                          </SelectItem>
                          <SelectItem value="professional">
                            <span className="font-bold text-indigo-500">Professional</span> (15 usuarios)
                          </SelectItem>
                          <SelectItem value="enterprise">
                            <span className="font-bold text-purple-500">Enterprise</span> (Ilimitado)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        type="button"
                        size="sm"
                        disabled={isSaving || isFreezing || isDeleting || currentPlan === company.plan}
                        onClick={() => handleSave(company.id)}
                        className="h-8 px-3 text-xs font-bold gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg disabled:opacity-40"
                      >
                        {isSaving ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Save className="w-3.5 h-3.5" />
                        )}
                        Guardar Plan
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isSaving || isFreezing || isDeleting}
                        onClick={() => handleToggleFreeze(company)}
                        className={`h-8 px-2.5 text-xs font-bold gap-1.5 rounded-lg border ${
                          isFrozen
                            ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                            : 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10'
                        }`}
                        title={isFrozen ? "Reactivar acceso a la empresa" : "Congelar temporalmente el acceso"}
                      >
                        {isFreezing ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : isFrozen ? (
                          <Flame className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Snowflake className="w-3.5 h-3.5 text-cyan-400" />
                        )}
                        {isFrozen ? "Descongelar" : "Congelar"}
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={isSaving || isFreezing || isDeleting}
                            className="h-8 px-2.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg"
                            title="Eliminar empresa"
                          >
                            {isDeleting ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-slate-950 border-slate-800 text-white">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-lg font-bold text-rose-400 flex items-center gap-2">
                              <Trash2 className="w-5 h-5 text-rose-400" />
                              ¿Eliminar empresa {company.name}?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-slate-400 text-sm mt-2">
                              Esta acción eliminará permanentemente la empresa <strong className="text-white">{company.name}</strong>, sus usuarios registrados, legajos de operarios, entregas de EPP y obligaciones asociadas. Esta acción no se puede deshacer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="mt-4">
                            <AlertDialogCancel className="bg-slate-900 border-slate-800 text-white hover:bg-slate-800">
                              Cancelar
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteCompany(company)}
                              className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
                            >
                              Eliminar Empresa
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Modal: Registrar Empresa y Cuenta de Administrador */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="bg-slate-950 border-slate-800 text-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-400" />
              Alta de Empresa y Cuenta Administradora
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs mt-1">
              Completá los datos corporativos y credenciales de acceso (Mail y Clave) para habilitar a la nueva empresa en la plataforma.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateCompanySubmit} className="space-y-4 font-sans mt-2">
            
            {/* Sección Datos de Empresa */}
            <div className="space-y-3 p-3.5 bg-slate-900/60 border border-slate-800/80 rounded-2xl">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> 1. Datos Corporativos
              </span>

              <div className="space-y-1">
                <Label htmlFor="c-name" className="text-xs font-bold text-slate-300">
                  Nombre de la Empresa *
                </Label>
                <Input
                  id="c-name"
                  placeholder="Ej: Constructora del Norte S.A."
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-white placeholder-slate-600 rounded-xl h-10"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="c-cuit" className="text-xs font-bold text-slate-300">
                    CUIT (Opcional)
                  </Label>
                  <Input
                    id="c-cuit"
                    placeholder="Ej: 30-71234567-8"
                    value={newCompanyCuit}
                    onChange={(e) => setNewCompanyCuit(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white placeholder-slate-600 rounded-xl h-10 font-mono text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="c-plan" className="text-xs font-bold text-slate-300">
                    Plan Inicial *
                  </Label>
                  <Select
                    value={newCompanyPlan}
                    onValueChange={(val: 'starter' | 'professional' | 'enterprise') => setNewCompanyPlan(val)}
                  >
                    <SelectTrigger id="c-plan" className="bg-slate-950 border-slate-800 text-white rounded-xl h-10 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-950 border-slate-800 text-white">
                      <SelectItem value="starter">
                        <span className="font-bold text-emerald-400">Starter</span> (Hasta 3 usuarios)
                      </SelectItem>
                      <SelectItem value="professional">
                        <span className="font-bold text-indigo-400">Professional</span> (Hasta 15 usuarios)
                      </SelectItem>
                      <SelectItem value="enterprise">
                        <span className="font-bold text-purple-400">Enterprise</span> (Ilimitado)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Sección Credenciales de Administrador */}
            <div className="space-y-3 p-3.5 bg-slate-900/60 border border-slate-800/80 rounded-2xl">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> 2. Credenciales del Administrador
              </span>

              <div className="space-y-1">
                <Label htmlFor="c-admin-name" className="text-xs font-bold text-slate-300">
                  Nombre del Responsable
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    id="c-admin-name"
                    placeholder="Ej: Ing. Juan Pérez"
                    value={newAdminName}
                    onChange={(e) => setNewAdminName(e.target.value)}
                    className="pl-9 bg-slate-950 border-slate-800 text-white placeholder-slate-600 rounded-xl h-10 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="c-email" className="text-xs font-bold text-slate-300">
                  Email del Administrador *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    id="c-email"
                    type="email"
                    placeholder="admin@empresa.com"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    className="pl-9 bg-slate-950 border-slate-800 text-white placeholder-slate-600 rounded-xl h-10 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="c-password" className="text-xs font-bold text-slate-300">
                  Contraseña de Acceso *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    id="c-password"
                    type={showAdminPassword ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    className="pl-9 pr-10 bg-slate-950 border-slate-800 text-white placeholder-slate-600 rounded-xl h-10 text-xs"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-6 gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setCreateDialogOpen(false)}
                className="bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 rounded-xl"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isCreating}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl gap-2 shadow-lg shadow-emerald-600/20"
              >
                {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Crear Empresa y Administrador
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

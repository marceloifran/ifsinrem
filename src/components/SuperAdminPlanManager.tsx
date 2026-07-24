import { useState, useEffect } from "react";
import {
  getAllCompaniesOverview,
  updateCompanyPlanAndLimits,
  updateCompanyStatus,
  deleteCompany,
  CompanyPlanOverview,
} from "@/services/userService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { ShieldAlert, Sparkles, Save, Infinity, Building2, Users, Loader2, Snowflake, Flame, Trash2, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function SuperAdminPlanManager() {
  const { refreshProfile } = useAuth();
  const [companies, setCompanies] = useState<CompanyPlanOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [freezingId, setFreezingId] = useState<string | null>(null);

  // Editable local state per company
  const [plans, setPlans] = useState<Record<string, 'starter' | 'professional' | 'enterprise'>>({});
  const [maxUsers, setMaxUsers] = useState<Record<string, number>>({});

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const data = await getAllCompaniesOverview();
      setCompanies(data);

      const initialPlans: Record<string, 'starter' | 'professional' | 'enterprise'> = {};
      const initialMaxUsers: Record<string, number> = {};

      data.forEach((c) => {
        initialPlans[c.id] = c.plan;
        initialMaxUsers[c.id] = c.max_users;
      });

      setPlans(initialPlans);
      setMaxUsers(initialMaxUsers);
    } catch (err: any) {
      console.error("Error loading companies overview:", err);
      toast.error("Error al cargar las empresas");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (companyId: string) => {
    const plan = plans[companyId] || 'starter';
    const limit = maxUsers[companyId] ?? 10;

    setSavingId(companyId);
    try {
      await updateCompanyPlanAndLimits(companyId, plan, limit);
      toast.success(`Plan y límites actualizados con éxito`);
      await refreshProfile();
      await loadCompanies();
    } catch (err: any) {
      console.error("Error updating plan:", err);
      toast.error(err.message || "Error al actualizar los límites de la empresa");
    } finally {
      setSavingId(null);
    }
  };

  const handleSetUnlimited = async (companyId: string) => {
    setMaxUsers((prev) => ({ ...prev, [companyId]: -1 }));
    setPlans((prev) => ({ ...prev, [companyId]: 'enterprise' }));
    
    setSavingId(companyId);
    try {
      await updateCompanyPlanAndLimits(companyId, 'enterprise', -1);
      toast.success("¡Plan configurado como Enterprise / Ilimitado!");
      await refreshProfile();
      await loadCompanies();
    } catch (err: any) {
      console.error("Error setting unlimited:", err);
      toast.error(err.message || "Error al establecer ilimitado");
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
              Panel SuperAdmin: Gestión de Planes, Usuarios y Estado
            </h3>
            <p className="text-xs text-muted-foreground">
              Modificá planes, aumentá límites de usuarios, congelá cuentas o eliminá empresas.
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead>Empresa & Estado</TableHead>
              <TableHead>Usuarios Actuales</TableHead>
              <TableHead>Plan Activo</TableHead>
              <TableHead>Límite Máximo</TableHead>
              <TableHead className="text-right">Acciones SuperAdmin</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.map((company) => {
              const currentPlan = plans[company.id] || company.plan;
              const currentLimit = maxUsers[company.id] ?? company.max_users;
              const isUnlimited = currentLimit === -1;
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
                    <div className="flex items-center gap-1.5 font-semibold text-sm">
                      <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="font-bold">{company.user_count}</span>
                      <span className="text-xs text-muted-foreground font-normal">
                        / {isUnlimited ? "∞" : currentLimit}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Select
                      value={currentPlan}
                      onValueChange={(val: 'starter' | 'professional' | 'enterprise') => {
                        setPlans((prev) => ({ ...prev, [company.id]: val }));
                        if (val === 'enterprise') {
                          setMaxUsers((prev) => ({ ...prev, [company.id]: -1 }));
                        }
                      }}
                    >
                      <SelectTrigger className="w-[150px] h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="starter">🌱 Starter (5 us.)</SelectItem>
                        <SelectItem value="professional">⚡ Professional (10 us.)</SelectItem>
                        <SelectItem value="enterprise">👑 Enterprise (Ilimitado)</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={currentLimit}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          setMaxUsers((prev) => ({ ...prev, [company.id]: isNaN(val) ? -1 : val }));
                        }}
                        className="w-24 h-9 text-xs font-mono"
                        placeholder="-1 = Ilimitado"
                      />
                      {isUnlimited && (
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-bold">
                          <Infinity className="w-3 h-3 mr-1" /> Sin Límite
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5 flex-wrap">
                      {/* Set Unlimited */}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetUnlimited(company.id)}
                        disabled={isSaving || isFreezing || isDeleting}
                        className="h-8 text-xs gap-1 border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
                        title="Asignar automáticamente plan Enterprise y usuarios ilimitados"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Ilimitado
                      </Button>

                      {/* Save Plan & Limits */}
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleSave(company.id)}
                        disabled={isSaving || isFreezing || isDeleting}
                        className="h-8 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                      >
                        {isSaving ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Save className="w-3.5 h-3.5" />
                        )}
                        Guardar
                      </Button>

                      {/* Freeze / Unfreeze toggle */}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleFreeze(company)}
                        disabled={isSaving || isFreezing || isDeleting}
                        className={`h-8 text-xs gap-1 ${
                          isFrozen
                            ? "border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
                            : "border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10"
                        }`}
                        title={isFrozen ? "Descongelar empresa" : "Congelar empresa (modo lectura)"}
                      >
                        {isFreezing ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : isFrozen ? (
                          <>
                            <Flame className="w-3.5 h-3.5 text-emerald-400" />
                            Activar
                          </>
                        ) : (
                          <>
                            <Snowflake className="w-3.5 h-3.5 text-cyan-400" />
                            Congelar
                          </>
                        )}
                      </Button>

                      {/* Delete Company */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={isSaving || isFreezing || isDeleting}
                            className="h-8 px-2.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
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
    </div>
  );
}

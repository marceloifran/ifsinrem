import { useState, useEffect } from "react";
import {
  PERMISSION_DEFINITIONS,
  getCompanyPermissions,
  saveCompanyPermissions,
  RolePermissionConfig,
  PermissionKey,
} from "@/services/permissionService";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Shield, ShieldCheck, Eye, Save, Lock, CheckCircle2 } from "lucide-react";

interface RolePermissionsManagerProps {
  companyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RolePermissionsManager({
  companyId,
  open,
  onOpenChange,
}: RolePermissionsManagerProps) {
  const [matrix, setMatrix] = useState<Record<string, RolePermissionConfig>>({});

  useEffect(() => {
    if (open) {
      const current = getCompanyPermissions(companyId);
      setMatrix(current);
    }
  }, [open, companyId]);

  const togglePermission = (role: "supervisor" | "operario", key: PermissionKey) => {
    setMatrix((prev) => {
      const roleKey = role === "supervisor" ? "responsable" : "operativo";
      const currentRoleConfig = prev[roleKey] || prev[role] || {
        view_dashboard: true,
        view_operarios: true,
        manage_operarios: false,
        view_inventario: true,
        manage_inventario: false,
        view_reportes: false,
        view_configuracion: false,
        manage_company_config: false,
        manage_users_roles: false,
      };

      const updatedRoleConfig = {
        ...currentRoleConfig,
        [key]: !currentRoleConfig[key],
      };

      return {
        ...prev,
        [roleKey]: updatedRoleConfig,
        [role]: updatedRoleConfig,
      };
    });
  };

  const handleSave = () => {
    saveCompanyPermissions(companyId, matrix);
    toast.success("¡Matriz de permisos por rol guardada correctamente!");
    onOpenChange(false);
  };

  const supervisorConfig = matrix["responsable"] || matrix["supervisor"] || getCompanyPermissions(companyId)["supervisor"];
  const operarioConfig = matrix["operativo"] || matrix["operario"] || getCompanyPermissions(companyId)["operario"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-6">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <DialogTitle className="text-xl">Gestión de Permisos por Rol</DialogTitle>
          </div>
          <DialogDescription>
            Como Administrador, definí exactamente a qué pantallas y acciones tiene acceso cada rol en la empresa.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 py-4 pr-1">
          {/* Roles header summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
                <Shield className="w-4 h-4" /> Administrador / Propietario
              </div>
              <p className="text-xs text-muted-foreground mt-1">Acceso total a todos los módulos y configuraciones (no restringible).</p>
            </div>

            <div className="p-3.5 rounded-xl border border-purple-500/20 bg-purple-500/5">
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-sm">
                <ShieldCheck className="w-4 h-4" /> Supervisor
              </div>
              <p className="text-xs text-muted-foreground mt-1">Gestión operativa de personal, EPP, entregas e informes.</p>
            </div>

            <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                <Eye className="w-4 h-4" /> Operario
              </div>
              <p className="text-xs text-muted-foreground mt-1">Acceso para consulta de EPPs asignados y firmas.</p>
            </div>
          </div>

          {/* Permissions Table */}
          <div className="border border-border rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="p-3.5 font-bold text-xs uppercase tracking-wider text-muted-foreground">Permiso / Función</th>
                  <th className="p-3.5 font-bold text-xs uppercase tracking-wider text-purple-600 text-center w-36">Rol Supervisor</th>
                  <th className="p-3.5 font-bold text-xs uppercase tracking-wider text-emerald-600 text-center w-36">Rol Operario</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {PERMISSION_DEFINITIONS.map((def) => {
                  const supervisorVal = Boolean(supervisorConfig?.[def.key]);
                  const operarioVal = Boolean(operarioConfig?.[def.key]);

                  return (
                    <tr key={def.key} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{def.label}</span>
                          <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal">
                            {def.category}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{def.description}</p>
                      </td>

                      <td className="p-3.5 text-center">
                        <div className="flex justify-center">
                          <Switch
                            checked={supervisorVal}
                            onCheckedChange={() => togglePermission("supervisor", def.key)}
                          />
                        </div>
                      </td>

                      <td className="p-3.5 text-center">
                        <div className="flex justify-center">
                          <Switch
                            checked={operarioVal}
                            onCheckedChange={() => togglePermission("operario", def.key)}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <DialogFooter className="gap-2 border-t border-border pt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSave} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
            <Save className="w-4 h-4" /> Guardar Permisos
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

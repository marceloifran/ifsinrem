export interface RolePermissionConfig {
  view_dashboard: boolean;
  view_operarios: boolean;
  manage_operarios: boolean;
  view_inventario: boolean;
  manage_inventario: boolean;
  view_reportes: boolean;
  view_configuracion: boolean;
  manage_company_config: boolean;
  manage_users_roles: boolean;
}

export type PermissionKey = keyof RolePermissionConfig;

export interface PermissionDefinition {
  key: PermissionKey;
  label: string;
  category: "Modulos" | "Acciones" | "Administración";
  description: string;
}

export const PERMISSION_DEFINITIONS: PermissionDefinition[] = [
  {
    key: "view_dashboard",
    label: "Acceso al Dashboard",
    category: "Modulos",
    description: "Permite ver el panel principal con estadísticas de entregas y stock",
  },
  {
    key: "view_operarios",
    label: "Ver Operarios / Personal",
    category: "Modulos",
    description: "Permite visualizar el listado y fichas del personal",
  },
  {
    key: "manage_operarios",
    label: "Gestionar Operarios (Crear/Editar/Importar)",
    category: "Acciones",
    description: "Permite registrar nuevos trabajadores, modificarlos o cargarlos vía Excel",
  },
  {
    key: "view_inventario",
    label: "Ver Catálogo e Inventario EPP",
    category: "Modulos",
    description: "Permite consultar el catálogo y stock de equipos de protección",
  },
  {
    key: "manage_inventario",
    label: "Gestionar Stock EPP (Catalogar/Editar/Importar)",
    category: "Acciones",
    description: "Permite agregar nuevos EPPs, actualizar cantidades y modificar datos",
  },
  {
    key: "view_reportes",
    label: "Ver Reportes y Planilla SRT 299",
    category: "Modulos",
    description: "Permite acceder a los informes de constancia y descargas PDF",
  },
  {
    key: "view_configuracion",
    label: "Ver Configuración de Empresa",
    category: "Modulos",
    description: "Permite ver los datos de la empresa en la sección de configuración",
  },
  {
    key: "manage_company_config",
    label: "Editar Datos de Empresa y Logo",
    category: "Administración",
    description: "Permite guardar cambios en CUIT, Razón Social y subir el Logo",
  },
  {
    key: "manage_users_roles",
    label: "Gestionar Usuarios y Roles del Equipo",
    category: "Administración",
    description: "Permite invitar nuevos usuarios y modificar sus roles",
  },
];

// Default Matrix per role
export const DEFAULT_ROLE_PERMISSIONS: Record<string, RolePermissionConfig> = {
  owner: {
    view_dashboard: true,
    view_operarios: true,
    manage_operarios: true,
    view_inventario: true,
    manage_inventario: true,
    view_reportes: true,
    view_configuracion: true,
    manage_company_config: true,
    manage_users_roles: true,
  },
  admin: {
    view_dashboard: true,
    view_operarios: true,
    manage_operarios: true,
    view_inventario: true,
    manage_inventario: true,
    view_reportes: true,
    view_configuracion: true,
    manage_company_config: true,
    manage_users_roles: true,
  },
  supervisor: {
    view_dashboard: true,
    view_operarios: true,
    manage_operarios: true,
    view_inventario: true,
    manage_inventario: true,
    view_reportes: true,
    view_configuracion: true,
    manage_company_config: false,
    manage_users_roles: false,
  },
  responsable: {
    view_dashboard: true,
    view_operarios: true,
    manage_operarios: true,
    view_inventario: true,
    manage_inventario: true,
    view_reportes: true,
    view_configuracion: true,
    manage_company_config: false,
    manage_users_roles: false,
  },
  operario: {
    view_dashboard: true,
    view_operarios: true,
    manage_operarios: false,
    view_inventario: true,
    manage_inventario: false,
    view_reportes: false,
    view_configuracion: false,
    manage_company_config: false,
    manage_users_roles: false,
  },
  operativo: {
    view_dashboard: true,
    view_operarios: true,
    manage_operarios: false,
    view_inventario: true,
    manage_inventario: false,
    view_reportes: false,
    view_configuracion: false,
    manage_company_config: false,
    manage_users_roles: false,
  },
};

const STORAGE_KEY = "ifsinrem_role_permissions_matrix";

export function getCompanyPermissions(companyId?: string): Record<string, RolePermissionConfig> {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_${companyId || 'default'}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_ROLE_PERMISSIONS, ...parsed };
    }
  } catch (err) {
    console.error("Error reading permissions:", err);
  }
  return DEFAULT_ROLE_PERMISSIONS;
}

export function saveCompanyPermissions(
  companyId: string,
  matrix: Record<string, RolePermissionConfig>
): void {
  try {
    localStorage.setItem(`${STORAGE_KEY}_${companyId || 'default'}`, JSON.stringify(matrix));
    window.dispatchEvent(new CustomEvent("permissions-updated"));
  } catch (err) {
    console.error("Error saving permissions:", err);
  }
}

export function checkRolePermission(
  role: string | null | undefined,
  permission: PermissionKey,
  companyId?: string
): boolean {
  if (!role) return false;
  const normalizedRole = role.toLowerCase();
  if (normalizedRole === "owner" || normalizedRole === "admin") return true; // Owner & Admin always have full access

  const matrix = getCompanyPermissions(companyId);
  
  let roleConfig = matrix[normalizedRole];
  if (!roleConfig) {
    if (normalizedRole === "operario" || normalizedRole === "operativo") {
      roleConfig = matrix["operario"] || matrix["operativo"];
    } else if (normalizedRole === "supervisor" || normalizedRole === "responsable") {
      roleConfig = matrix["supervisor"] || matrix["responsable"];
    }
  }
  if (!roleConfig) {
    roleConfig = DEFAULT_ROLE_PERMISSIONS[normalizedRole];
  }

  if (!roleConfig) return false;
  return Boolean(roleConfig[permission]);
}

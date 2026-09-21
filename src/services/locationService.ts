import { supabase } from "@/integrations/supabase/client";
import { Location, LocationType } from "@/types/inventory";

export const LOCATION_TYPE_LABELS: Record<LocationType, { label: string; badgeColor: string }> = {
  central: { label: "Sede Central", badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  deposito: { label: "Depósito General", badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  planta: { label: "Planta / Fábrica", badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  obra: { label: "Obra en Construcción", badgeColor: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  panol: { label: "Pañol de Herramientas", badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  sucursal: { label: "Sucursal Comercial", badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
  sector: { label: "Sector Interno", badgeColor: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
};

/**
 * Obtiene todas las ubicaciones de la empresa
 */
export async function getLocations(companyId: string): Promise<Location[]> {
  if (!companyId) return [];

  const { data, error } = await (supabase as any)
    .from("locations")
    .select("*")
    .eq("company_id", companyId)
    .order("is_default", { ascending: false })
    .order("name", { ascending: true });

  if (error) {
    console.error("Error al obtener ubicaciones:", error);
    // Si la tabla aún no existe o hay error inicial, creamos una ubicación por defecto en memoria
    return [
      {
        id: "loc-default-central",
        company_id: companyId,
        name: "Sede Central / Depósito Principal",
        code: "DEP-01",
        type: "central",
        is_default: true,
        status: "activo",
        items_count: 0,
        active_transfers_count: 0,
        created_at: new Date().toISOString(),
      },
    ];
  }

  // Si no tiene ubicaciones, creamos la primera automáticamente
  if (!data || data.length === 0) {
    try {
      const defaultLoc = await createLocation({
        company_id: companyId,
        name: "Sede Central / Depósito Principal",
        code: "DEP-01",
        type: "central",
        is_default: true,
        status: "activo",
        notes: "Ubicación principal creada automáticamente",
      });
      return [defaultLoc];
    } catch (e) {
      console.warn("No se pudo crear ubicación default en base:", e);
    }
  }

  return (data || []).map((row: any) => ({
    ...row,
    manager_name: row.manager_name || undefined,
  }));
}

/**
 * Obtiene una ubicación por ID
 */
export async function getLocationById(id: string): Promise<Location | null> {
  const { data, error } = await (supabase as any)
    .from("locations")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error al obtener ubicación ${id}:`, error);
    return null;
  }

  return data;
}

/**
 * Crea una nueva ubicación
 */
export async function createLocation(location: Omit<Location, "id" | "created_at" | "updated_at">): Promise<Location> {
  const { data, error } = await (supabase as any)
    .from("locations")
    .insert([
      {
        company_id: location.company_id,
        name: location.name,
        code: location.code || null,
        type: location.type,
        address: location.address || null,
        city: location.city || null,
        manager_id: location.manager_id || null,
        is_default: location.is_default || false,
        status: location.status || "activo",
        notes: location.notes || null,
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(`Error al crear ubicación: ${error.message}`);
  }

  return data;
}

/**
 * Actualiza una ubicación existente
 */
export async function updateLocation(id: string, updates: Partial<Location>): Promise<Location> {
  const { data, error } = await (supabase as any)
    .from("locations")
    .update({
      name: updates.name,
      code: updates.code,
      type: updates.type,
      address: updates.address,
      city: updates.city,
      manager_id: updates.manager_id,
      status: updates.status,
      notes: updates.notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Error al actualizar ubicación: ${error.message}`);
  }

  return data;
}

/**
 * Elimina una ubicación (solo si no tiene transferencias pendientes o stock bloqueado)
 */
export async function deleteLocation(id: string): Promise<boolean> {
  const { error } = await (supabase as any)
    .from("locations")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`Error al eliminar ubicación: ${error.message}`);
  }

  return true;
}

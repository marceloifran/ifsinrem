import { supabase } from "@/integrations/supabase/client";
import { 
  InventoryItem, 
  ItemType, 
  ItemUnit, 
  LocationStock, 
  MovementLog, 
  MovementType 
} from "@/types/inventory";

export const ITEM_TYPE_CONFIG: Record<ItemType, { label: string; badgeColor: string; description: string }> = {
  epp: { 
    label: "EPP / Seguridad", 
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    description: "Elemento de Protección Personal con trazabilidad legal y firma SRT 299/11" 
  },
  consumible: { 
    label: "Consumible", 
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    description: "Materiales de un solo uso o gasto recurrente" 
  },
  insumo: { 
    label: "Insumo Operativo", 
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    description: "Materia prima o insumos para obra y producción" 
  },
  repuesto: { 
    label: "Repuesto", 
    badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    description: "Piezas para mantenimiento de maquinaria y vehículos" 
  },
  activo: { 
    label: "Activo / Herramienta", 
    badgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    description: "Equipos durables con número de serie y asignación nominal" 
  },
};

/**
 * Obtiene el catálogo de ítems de inventario de la empresa
 */
export async function getInventoryItems(companyId: string, typeFilter?: ItemType): Promise<InventoryItem[]> {
  if (!companyId) return [];

  let query = (supabase as any)
    .from("inventory_items")
    .select("*")
    .eq("company_id", companyId)
    .order("name", { ascending: true });

  if (typeFilter) {
    query = query.eq("type", typeFilter);
  }

  const { data, error } = await query;

  if (error) {
    console.warn("Tabla inventory_items no disponible aún, fallback a epp_items:", error);
    // Fallback retrocompatible con epp_items
    const { data: eppData, error: eppError } = await supabase
      .from("epp_items")
      .select("*")
      .eq("company_id", companyId)
      .order("name", { ascending: true });

    if (eppError) {
      console.error("Error al obtener epp_items:", eppError);
      return [];
    }

    return (eppData || []).map((e: any) => ({
      id: e.id,
      company_id: e.company_id,
      name: e.name,
      description: e.description || undefined,
      type: "epp" as ItemType,
      category: e.category || "otro",
      unit: "unidad" as ItemUnit,
      min_global_stock: 5,
      total_stock: e.stock || 0,
      in_transit_stock: 0,
      status: "activo" as const,
      metadata: {
        certifying_body: e.certifying_body,
        certificate_number: e.certificate_number,
        brand: e.brand,
        model: e.model,
      },
      created_at: e.created_at,
      updated_at: e.updated_at,
    }));
  }

  // Traer stock total acumulado de cada ítem
  const { data: stockData } = await (supabase as any)
    .from("location_stock")
    .select("item_id, quantity")
    .eq("company_id", companyId);

  const stockMap = new Map<string, number>();
  if (stockData) {
    for (const s of stockData) {
      stockMap.set(s.item_id, (stockMap.get(s.item_id) || 0) + (s.quantity || 0));
    }
  }

  return (data || []).map((item: any) => ({
    ...item,
    total_stock: stockMap.get(item.id) || 0,
    in_transit_stock: 0, // calculado dinámicamente si hay transferencias activas
  }));
}

/**
 * Crea un nuevo ítem en el catálogo
 */
export async function createInventoryItem(item: Omit<InventoryItem, "id" | "created_at" | "updated_at">): Promise<InventoryItem> {
  const { data, error } = await (supabase as any)
    .from("inventory_items")
    .insert([
      {
        company_id: item.company_id,
        name: item.name,
        code: item.code || null,
        description: item.description || null,
        type: item.type,
        category: item.category || "general",
        unit: item.unit || "unidad",
        min_global_stock: item.min_global_stock || 0,
        metadata: item.metadata || {},
        status: item.status || "activo",
      },
    ])
    .select()
    .single();

  if (error) {
    // Si falla porque no existe aún la tabla, guardar en epp_items si es EPP
    if (item.type === "epp") {
      const { data: eppFallback, error: eppErr } = await (supabase as any)
        .from("epp_items")
        .insert([
          {
            company_id: item.company_id,
            name: item.name,
            description: item.description || null,
            category: item.category || "otro",
            stock: item.total_stock || 0,
            brand: item.metadata?.brand || null,
            model: item.metadata?.model || null,
            certifying_body: item.metadata?.certifying_body || null,
            certificate_number: item.metadata?.certificate_number || null,
          }
        ])
        .select()
        .single();
      
      if (eppErr) throw new Error(eppErr.message);
      return {
        id: eppFallback.id,
        company_id: eppFallback.company_id,
        name: eppFallback.name,
        description: eppFallback.description,
        type: "epp",
        category: eppFallback.category,
        unit: "unidad",
        min_global_stock: 5,
        total_stock: eppFallback.stock,
        status: "activo",
      };
    }
    throw new Error(`Error al crear ítem de inventario: ${error.message}`);
  }

  return data;
}

/**
 * Actualiza un ítem en el catálogo
 */
export async function updateInventoryItem(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem> {
  const { data, error } = await (supabase as any)
    .from("inventory_items")
    .update({
      name: updates.name,
      code: updates.code,
      description: updates.description,
      type: updates.type,
      category: updates.category,
      unit: updates.unit,
      min_global_stock: updates.min_global_stock,
      metadata: updates.metadata,
      status: updates.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    // Fallback a epp_items si aplica
    const { data: eppUpd, error: eppErr } = await (supabase as any)
      .from("epp_items")
      .update({
        name: updates.name,
        description: updates.description,
        category: updates.category,
        brand: updates.metadata?.brand,
        model: updates.metadata?.model,
      })
      .eq("id", id)
      .select()
      .single();

    if (eppErr) throw new Error(error.message);
    return eppUpd;
  }

  return data;
}

/**
 * Elimina un ítem del catálogo
 */
export async function deleteInventoryItem(id: string): Promise<boolean> {
  const { error } = await (supabase as any)
    .from("inventory_items")
    .delete()
    .eq("id", id);

  if (error) {
    const { error: eppErr } = await (supabase as any)
      .from("epp_items")
      .delete()
      .eq("id", id);

    if (eppErr) throw new Error(error.message);
  }

  return true;
}

/**
 * Obtiene el stock detallado por ubicación física
 */
export async function getLocationStock(companyId: string, locationId?: string): Promise<LocationStock[]> {
  if (!companyId) return [];

  let query = (supabase as any)
    .from("location_stock")
    .select(`
      *,
      locations:location_id (name, type),
      inventory_items:item_id (name, code, type, category, unit)
    `)
    .eq("company_id", companyId);

  if (locationId) {
    query = query.eq("location_id", locationId);
  }

  const { data, error } = await query;

  if (error) {
    console.warn("No se pudo cargar location_stock, usando fallback de epp_items:", error);
    return [];
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    company_id: row.company_id,
    location_id: row.location_id,
    location_name: row.locations?.name || "Ubicación",
    location_type: row.locations?.type || "deposito",
    item_id: row.item_id,
    item_name: row.inventory_items?.name || "Ítem",
    item_code: row.inventory_items?.code || undefined,
    item_type: row.inventory_items?.type || "consumible",
    item_unit: row.inventory_items?.unit || "unidad",
    category: row.inventory_items?.category || "general",
    quantity: row.quantity || 0,
    min_stock: row.min_stock || 0,
    updated_at: row.updated_at,
  }));
}

/**
 * Ajusta manualmente el stock de una ubicación física y genera el registro en movements_log
 */
export async function adjustLocationStock(params: {
  companyId: string;
  locationId: string;
  itemId: string;
  newQuantity: number;
  reason: string;
  userId?: string;
}): Promise<void> {
  const { companyId, locationId, itemId, newQuantity, reason, userId } = params;

  // 1. Obtener stock actual
  const { data: currentStock } = await (supabase as any)
    .from("location_stock")
    .select("quantity")
    .eq("location_id", locationId)
    .eq("item_id", itemId)
    .maybeSingle();

  const prevQty = currentStock?.quantity || 0;
  const difference = newQuantity - prevQty;

  // 2. Upsert stock
  const { error: upsertError } = await (supabase as any)
    .from("location_stock")
    .upsert({
      company_id: companyId,
      location_id: locationId,
      item_id: itemId,
      quantity: newQuantity,
      updated_at: new Date().toISOString(),
    }, { onConflict: "location_id,item_id" });

  if (upsertError) {
    throw new Error(`Error al ajustar stock: ${upsertError.message}`);
  }

  // 3. Registrar auditoría de movimiento inmutable
  await logMovement({
    company_id: companyId,
    item_id: itemId,
    movement_type: "ajuste_inventario",
    quantity: difference,
    to_location_id: locationId,
    responsible_user_id: userId,
    notes: `Ajuste manual de inventario: ${reason} (de ${prevQty} a ${newQuantity})`,
  });
}

/**
 * Registra un evento inmutable en el timeline de auditoría de movimientos
 */
export async function logMovement(movement: {
  company_id: string;
  item_id: string;
  movement_type: MovementType;
  quantity: number;
  from_location_id?: string;
  to_location_id?: string;
  responsible_user_id?: string;
  employee_id?: string;
  related_document_id?: string;
  notes?: string;
}): Promise<void> {
  try {
    await (supabase as any)
      .from("movements_log")
      .insert([
        {
          ...movement,
          created_at: new Date().toISOString(),
        }
      ]);
  } catch (err) {
    console.warn("No se pudo insertar en movements_log:", err);
  }
}

/**
 * Obtiene el historial de movimientos de auditoría
 */
export async function getMovementsLog(companyId: string, limit: number = 100): Promise<MovementLog[]> {
  if (!companyId) return [];

  const { data, error } = await (supabase as any)
    .from("movements_log")
    .select(`
      *,
      inventory_items:item_id (name, code, type, unit),
      from_loc:from_location_id (name),
      to_loc:to_location_id (name),
      employees:employee_id (name)
    `)
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error al obtener movements_log:", error);
    return [];
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    company_id: row.company_id,
    item_id: row.item_id,
    item_name: row.inventory_items?.name || "Ítem",
    item_code: row.inventory_items?.code || undefined,
    item_type: row.inventory_items?.type || "consumible",
    movement_type: row.movement_type,
    quantity: row.quantity,
    unit: row.inventory_items?.unit || "unidad",
    from_location_id: row.from_location_id || undefined,
    from_location_name: row.from_loc?.name || undefined,
    to_location_id: row.to_location_id || undefined,
    to_location_name: row.to_loc?.name || undefined,
    responsible_user_id: row.responsible_user_id || undefined,
    responsible_name: row.responsible_name || undefined,
    employee_id: row.employee_id || undefined,
    employee_name: row.employees?.name || undefined,
    related_document_id: row.related_document_id || undefined,
    notes: row.notes || undefined,
    created_at: row.created_at,
  }));
}

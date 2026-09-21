import { supabase } from "@/integrations/supabase/client";
import { 
  Transfer, 
  TransferItem, 
  TransferStatus, 
  TransferException, 
  ExceptionType 
} from "@/types/inventory";
import QRCode from "qrcode";
import { logMovement } from "./inventoryService";

export const TRANSFER_STATUS_CONFIG: Record<TransferStatus, { label: string; badgeColor: string; step: number }> = {
  borrador: { 
    label: "Borrador", 
    badgeColor: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    step: 1 
  },
  preparada: { 
    label: "Preparada para Despacho", 
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    step: 2 
  },
  despachada: { 
    label: "Despachada", 
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    step: 3 
  },
  en_transito: { 
    label: "En Tránsito", 
    badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    step: 3 
  },
  recibida: { 
    label: "Recibida Conforme", 
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    step: 4 
  },
  recibida_con_diferencias: { 
    label: "Recibida con Diferencias", 
    badgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    step: 4 
  },
  rechazada: { 
    label: "Rechazada en Destino", 
    badgeColor: "bg-red-500/10 text-red-400 border-red-500/20",
    step: 0 
  },
  cancelada: { 
    label: "Cancelada", 
    badgeColor: "bg-slate-500/10 text-slate-500 border-slate-500/20",
    step: 0 
  },
};

/**
 * Genera un código de seguimiento único para la transferencia
 */
export function generateTrackingCode(): string {
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `TRF-${dateStr}-${randomSuffix}`;
}

/**
 * Genera un código QR como DataURL base64 para imprimir en el remito o escanear con el móvil
 */
export async function generateTransferQR(trackingCode: string): Promise<string> {
  const receptionUrl = `${window.location.origin}/recepcion/${trackingCode}`;
  try {
    return await QRCode.toDataURL(receptionUrl, {
      width: 320,
      margin: 2,
      color: {
        dark: "#090d16",
        light: "#ffffff",
      },
    });
  } catch (err) {
    console.error("Error al generar QR de transferencia:", err);
    return "";
  }
}

/**
 * Obtiene todas las transferencias de la empresa con filtros opcionales
 */
export async function getTransfers(companyId: string, statusFilter?: TransferStatus): Promise<Transfer[]> {
  if (!companyId) return [];

  let query = (supabase as any)
    .from("transfers")
    .select(`
      *,
      origin:origin_location_id (name),
      destination:destination_location_id (name),
      transfer_items (
        id, item_id, requested_qty, dispatched_qty, received_qty, status, difference_notes,
        inventory_items:item_id (name, code, type, unit)
      ),
      transfer_exceptions (
        id, item_id, exception_type, declared_qty, actual_qty, difference, photo_evidence_url, notes, resolved
      )
    `)
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error al obtener transferencias:", error);
    return [];
  }

  return (data || []).map((row: any) => {
    const items: TransferItem[] = (row.transfer_items || []).map((ti: any) => ({
      id: ti.id,
      transfer_id: row.id,
      item_id: ti.item_id,
      item_name: ti.inventory_items?.name || "Ítem",
      item_code: ti.inventory_items?.code || undefined,
      item_type: ti.inventory_items?.type || "consumible",
      unit: ti.inventory_items?.unit || "unidad",
      requested_qty: ti.requested_qty,
      dispatched_qty: ti.dispatched_qty,
      received_qty: ti.received_qty,
      status: ti.status,
      difference_notes: ti.difference_notes,
    }));

    const exceptions: TransferException[] = (row.transfer_exceptions || []).map((ex: any) => ({
      id: ex.id,
      transfer_id: row.id,
      item_id: ex.item_id,
      exception_type: ex.exception_type,
      declared_qty: ex.declared_qty,
      actual_qty: ex.actual_qty,
      difference: ex.difference,
      photo_evidence_url: ex.photo_evidence_url,
      notes: ex.notes,
      resolved: ex.resolved,
      created_at: ex.created_at,
    }));

    const totalDispatched = items.reduce((acc, i) => acc + (i.dispatched_qty || 0), 0);
    const totalReceived = items.reduce((acc, i) => acc + (i.received_qty || 0), 0);

    return {
      id: row.id,
      tracking_code: row.tracking_code,
      company_id: row.company_id,
      origin_location_id: row.origin_location_id,
      origin_location_name: row.origin?.name || "Origen",
      destination_location_id: row.destination_location_id,
      destination_location_name: row.destination?.name || "Destino",
      status: row.status,
      sender_user_id: row.sender_user_id,
      sender_user_name: row.sender_name || undefined,
      receiver_user_id: row.receiver_user_id,
      receiver_user_name: row.receiver_name || undefined,
      transport_carrier: row.transport_carrier,
      transport_vehicle_plate: row.transport_vehicle_plate,
      transport_driver_name: row.transport_driver_name,
      notes: row.notes,
      remito_number: row.remito_number,
      qr_token: row.qr_token,
      dispatched_at: row.dispatched_at,
      received_at: row.received_at,
      items,
      exceptions,
      items_count: items.length,
      total_units_dispatched: totalDispatched,
      total_units_received: totalReceived,
      has_exceptions: exceptions.length > 0 || row.status === "recibida_con_diferencias",
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  });
}

/**
 * Obtiene una transferencia por su tracking code (usado en recepción mobile)
 */
export async function getTransferByTrackingCode(trackingCode: string): Promise<Transfer | null> {
  const cleanCode = trackingCode.trim().toUpperCase();

  const { data, error } = await (supabase as any)
    .from("transfers")
    .select(`
      *,
      origin:origin_location_id (name, type, address),
      destination:destination_location_id (name, type, address),
      transfer_items (
        id, item_id, requested_qty, dispatched_qty, received_qty, status, difference_notes,
        inventory_items:item_id (name, code, type, unit, category)
      ),
      transfer_exceptions (
        id, item_id, exception_type, declared_qty, actual_qty, difference, photo_evidence_url, notes, resolved
      )
    `)
    .eq("tracking_code", cleanCode)
    .single();

  if (error || !data) {
    console.error(`Error al buscar transferencia ${cleanCode}:`, error);
    return null;
  }

  const items: TransferItem[] = (data.transfer_items || []).map((ti: any) => ({
    id: ti.id,
    transfer_id: data.id,
    item_id: ti.item_id,
    item_name: ti.inventory_items?.name || "Ítem",
    item_code: ti.inventory_items?.code || undefined,
    item_type: ti.inventory_items?.type || "consumible",
    unit: ti.inventory_items?.unit || "unidad",
    requested_qty: ti.requested_qty,
    dispatched_qty: ti.dispatched_qty,
    received_qty: ti.received_qty,
    status: ti.status,
    difference_notes: ti.difference_notes,
  }));

  const exceptions: TransferException[] = (data.transfer_exceptions || []).map((ex: any) => ({
    id: ex.id,
    transfer_id: data.id,
    item_id: ex.item_id,
    exception_type: ex.exception_type,
    declared_qty: ex.declared_qty,
    actual_qty: ex.actual_qty,
    difference: ex.difference,
    photo_evidence_url: ex.photo_evidence_url,
    notes: ex.notes,
    resolved: ex.resolved,
    created_at: ex.created_at,
  }));

  return {
    id: data.id,
    tracking_code: data.tracking_code,
    company_id: data.company_id,
    origin_location_id: data.origin_location_id,
    origin_location_name: data.origin?.name || "Origen",
    destination_location_id: data.destination_location_id,
    destination_location_name: data.destination?.name || "Destino",
    status: data.status,
    sender_user_id: data.sender_user_id,
    sender_user_name: data.sender_name || undefined,
    receiver_user_id: data.receiver_user_id,
    receiver_user_name: data.receiver_name || undefined,
    transport_carrier: data.transport_carrier,
    transport_vehicle_plate: data.transport_vehicle_plate,
    transport_driver_name: data.transport_driver_name,
    notes: data.notes,
    remito_number: data.remito_number,
    qr_token: data.qr_token,
    dispatched_at: data.dispatched_at,
    received_at: data.received_at,
    items,
    exceptions,
    items_count: items.length,
    has_exceptions: exceptions.length > 0 || data.status === "recibida_con_diferencias",
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

/**
 * Crea una nueva transferencia con sus ítems asociados y descuenta el stock de origen
 */
export async function createAndDispatchTransfer(params: {
  companyId: string;
  originLocationId: string;
  destinationLocationId: string;
  senderUserId?: string;
  transportCarrier?: string;
  transportVehiclePlate?: string;
  transportDriverName?: string;
  notes?: string;
  remitoNumber?: string;
  items: Array<{ itemId: string; quantity: number }>;
  dispatchImmediately?: boolean;
}): Promise<Transfer> {
  const {
    companyId,
    originLocationId,
    destinationLocationId,
    senderUserId,
    transportCarrier,
    transportVehiclePlate,
    transportDriverName,
    notes,
    remitoNumber,
    items,
    dispatchImmediately = true,
  } = params;

  if (!items || items.length === 0) {
    throw new Error("Debe incluir al menos un ítem en la transferencia.");
  }

  if (originLocationId === destinationLocationId) {
    throw new Error("La ubicación de origen y destino no pueden ser la misma.");
  }

  const trackingCode = generateTrackingCode();
  const initialStatus: TransferStatus = dispatchImmediately ? "en_transito" : "borrador";
  const dispatchedAt = dispatchImmediately ? new Date().toISOString() : null;

  // 1. Insertar Transferencia principal
  const { data: transferData, error: transferError } = await (supabase as any)
    .from("transfers")
    .insert([
      {
        company_id: companyId,
        tracking_code: trackingCode,
        origin_location_id: originLocationId,
        destination_location_id: destinationLocationId,
        status: initialStatus,
        sender_user_id: senderUserId || null,
        transport_carrier: transportCarrier || null,
        transport_vehicle_plate: transportVehiclePlate || null,
        transport_driver_name: transportDriverName || null,
        notes: notes || null,
        remito_number: remitoNumber || null,
        dispatched_at: dispatchedAt,
      },
    ])
    .select()
    .single();

  if (transferError) {
    throw new Error(`Error al crear transferencia: ${transferError.message}`);
  }

  // 2. Insertar los ítems
  const transferItemsToInsert = items.map((it) => ({
    transfer_id: transferData.id,
    item_id: it.itemId,
    requested_qty: it.quantity,
    dispatched_qty: it.quantity,
    status: "pendiente",
  }));

  const { error: itemsError } = await (supabase as any)
    .from("transfer_items")
    .insert(transferItemsToInsert);

  if (itemsError) {
    console.error("Error al insertar ítems de transferencia:", itemsError);
  }

  // 3. Si se despacha inmediatamente, descontar stock de la ubicación origen
  if (dispatchImmediately) {
    for (const it of items) {
      try {
        const { data: originStock } = await (supabase as any)
          .from("location_stock")
          .select("quantity")
          .eq("location_id", originLocationId)
          .eq("item_id", it.itemId)
          .maybeSingle();

        const currentQty = originStock?.quantity || 0;
        const newQty = Math.max(0, currentQty - it.quantity);

        await (supabase as any)
          .from("location_stock")
          .upsert({
            company_id: companyId,
            location_id: originLocationId,
            item_id: it.itemId,
            quantity: newQty,
            updated_at: new Date().toISOString(),
          }, { onConflict: "location_id,item_id" });

        // Registrar auditoría de salida
        await logMovement({
          company_id: companyId,
          item_id: it.itemId,
          movement_type: "transferencia_despacho",
          quantity: it.quantity,
          from_location_id: originLocationId,
          to_location_id: destinationLocationId,
          responsible_user_id: senderUserId,
          related_document_id: trackingCode,
          notes: `Despacho de transferencia ${trackingCode}`,
        });
      } catch (stockErr) {
        console.warn(`Error al actualizar stock para item ${it.itemId}:`, stockErr);
      }
    }
  }

  return await getTransferByTrackingCode(trackingCode) as Transfer;
}

/**
 * Procesa la recepción física mobile-first de una transferencia
 */
export async function processTransferReception(params: {
  transferId: string;
  trackingCode: string;
  companyId: string;
  destinationLocationId: string;
  receiverUserId?: string;
  receivedItems: Array<{
    itemId: string;
    dispatchedQty: number;
    receivedQty: number;
    differenceNotes?: string;
  }>;
  exceptions: Array<{
    itemId: string;
    exceptionType: ExceptionType;
    declaredQty: number;
    actualQty: number;
    photoUrl?: string;
    notes?: string;
  }>;
}): Promise<{ status: TransferStatus; hasExceptions: boolean }> {
  const {
    transferId,
    trackingCode,
    companyId,
    destinationLocationId,
    receiverUserId,
    receivedItems,
    exceptions,
  } = params;

  const hasDifferences = exceptions.length > 0 || receivedItems.some((i) => i.receivedQty !== i.dispatchedQty);
  const finalStatus: TransferStatus = hasDifferences ? "recibida_con_diferencias" : "recibida";
  const receivedAt = new Date().toISOString();

  // 1. Actualizar estado de la transferencia
  const { error: updError } = await (supabase as any)
    .from("transfers")
    .update({
      status: finalStatus,
      receiver_user_id: receiverUserId || null,
      received_at: receivedAt,
      updated_at: receivedAt,
    })
    .eq("id", transferId);

  if (updError) {
    throw new Error(`Error al actualizar transferencia: ${updError.message}`);
  }

  // 2. Actualizar cada item recibido
  for (const item of receivedItems) {
    const itemStatus = item.receivedQty === item.dispatchedQty ? "ok" : item.receivedQty < item.dispatchedQty ? "faltante" : "sobrante";
    await (supabase as any)
      .from("transfer_items")
      .update({
        received_qty: item.receivedQty,
        status: itemStatus,
        difference_notes: item.differenceNotes || null,
      })
      .eq("transfer_id", transferId)
      .eq("item_id", item.itemId);

    // 3. Acreditar stock efectivamente recibido en la ubicación destino
    if (item.receivedQty > 0) {
      try {
        const { data: destStock } = await (supabase as any)
          .from("location_stock")
          .select("quantity")
          .eq("location_id", destinationLocationId)
          .eq("item_id", item.itemId)
          .maybeSingle();

        const currentQty = destStock?.quantity || 0;
        const newQty = currentQty + item.receivedQty;

        await (supabase as any)
          .from("location_stock")
          .upsert({
            company_id: companyId,
            location_id: destinationLocationId,
            item_id: item.itemId,
            quantity: newQty,
            updated_at: new Date().toISOString(),
          }, { onConflict: "location_id,item_id" });

        // Registrar auditoría de entrada
        await logMovement({
          company_id: companyId,
          item_id: item.itemId,
          movement_type: "transferencia_recepcion",
          quantity: item.receivedQty,
          to_location_id: destinationLocationId,
          responsible_user_id: receiverUserId,
          related_document_id: trackingCode,
          notes: `Recepción física de transferencia ${trackingCode} (${itemStatus})`,
        });
      } catch (err) {
        console.warn(`Error al acreditar stock destino para item ${item.itemId}:`, err);
      }
    }
  }

  // 4. Registrar excepciones / incidencias si las hay
  for (const ex of exceptions) {
    const diff = ex.actualQty - ex.declaredQty;
    await (supabase as any)
      .from("transfer_exceptions")
      .insert([
        {
          company_id: companyId,
          transfer_id: transferId,
          item_id: ex.itemId,
          exception_type: ex.exceptionType,
          declared_qty: ex.declaredQty,
          actual_qty: ex.actualQty,
          difference: diff,
          photo_evidence_url: ex.photoUrl || null,
          notes: ex.notes || null,
          reported_by: receiverUserId || null,
          resolved: false,
          created_at: receivedAt,
        }
      ]);
  }

  return { status: finalStatus, hasExceptions: hasDifferences };
}

/**
 * Obtiene todas las excepciones operativas no resueltas de la empresa
 */
export async function getActiveExceptions(companyId: string): Promise<TransferException[]> {
  if (!companyId) return [];

  const { data, error } = await (supabase as any)
    .from("transfer_exceptions")
    .select(`
      *,
      transfers:transfer_id (tracking_code, origin_location_id, destination_location_id),
      inventory_items:item_id (name, code, unit)
    `)
    .eq("company_id", companyId)
    .eq("resolved", false)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error al obtener excepciones:", error);
    return [];
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    transfer_id: row.transfer_id,
    item_id: row.item_id,
    item_name: row.inventory_items?.name || "Ítem",
    exception_type: row.exception_type,
    declared_qty: row.declared_qty,
    actual_qty: row.actual_qty,
    difference: row.difference,
    photo_evidence_url: row.photo_evidence_url,
    notes: row.notes,
    reported_by: row.reported_by,
    reported_by_name: row.reported_by_name || undefined,
    resolved: row.resolved,
    created_at: row.created_at,
  }));
}

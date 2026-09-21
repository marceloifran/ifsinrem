export type LocationType = 
  | 'central' 
  | 'deposito' 
  | 'planta' 
  | 'obra' 
  | 'panol' 
  | 'sucursal' 
  | 'sector';

export interface Location {
  id: string;
  company_id: string;
  name: string;
  code?: string;
  type: LocationType;
  address?: string;
  city?: string;
  manager_id?: string;
  manager_name?: string;
  is_default?: boolean;
  status: 'activo' | 'inactivo';
  notes?: string;
  items_count?: number;
  active_transfers_count?: number;
  created_at?: string;
  updated_at?: string;
}

export type ItemType = 
  | 'consumible' 
  | 'epp' 
  | 'insumo' 
  | 'repuesto' 
  | 'activo';

export type ItemUnit = 
  | 'unidad' 
  | 'par' 
  | 'juego' 
  | 'kg' 
  | 'litro' 
  | 'metro' 
  | 'caja' 
  | 'pack';

export interface InventoryItem {
  id: string;
  company_id: string;
  name: string;
  code?: string;
  description?: string;
  type: ItemType;
  category?: string; // ej: 'cabeza', 'manos', 'mecanico', 'electrico', 'limpieza'
  unit: ItemUnit;
  min_global_stock: number;
  total_stock?: number;
  in_transit_stock?: number;
  status: 'activo' | 'inactivo';
  metadata?: {
    certifying_body?: string;
    certificate_number?: string;
    brand?: string;
    model?: string;
    serial_number?: string;
    asset_status?: 'disponible' | 'en_transito' | 'asignado' | 'en_reparacion' | 'baja';
    assigned_employee_id?: string;
    assigned_employee_name?: string;
    [key: string]: any;
  };
  created_at?: string;
  updated_at?: string;
}

export interface LocationStock {
  id: string;
  company_id: string;
  location_id: string;
  location_name?: string;
  location_type?: LocationType;
  item_id: string;
  item_name?: string;
  item_code?: string;
  item_type?: ItemType;
  item_unit?: ItemUnit;
  category?: string;
  quantity: number;
  min_stock: number;
  updated_at?: string;
}

export type TransferStatus = 
  | 'borrador' 
  | 'preparada' 
  | 'despachada' 
  | 'en_transito' 
  | 'recibida' 
  | 'recibida_con_diferencias' 
  | 'rechazada' 
  | 'cancelada';

export interface TransferItem {
  id: string;
  transfer_id: string;
  item_id: string;
  item_name: string;
  item_code?: string;
  item_type: ItemType;
  unit: ItemUnit;
  requested_qty: number;
  dispatched_qty: number;
  received_qty?: number;
  status: 'ok' | 'faltante' | 'sobrante' | 'danado' | 'pendiente';
  difference_notes?: string;
}

export type ExceptionType = 
  | 'faltante' 
  | 'sobrante' 
  | 'dano' 
  | 'producto_incorrecto' 
  | 'transferencia_demorada';

export interface TransferException {
  id: string;
  transfer_id: string;
  item_id?: string;
  item_name?: string;
  exception_type: ExceptionType;
  declared_qty: number;
  actual_qty: number;
  difference: number;
  photo_evidence_url?: string;
  notes?: string;
  reported_by?: string;
  reported_by_name?: string;
  resolved: boolean;
  resolved_at?: string;
  resolution_notes?: string;
  created_at: string;
}

export interface Transfer {
  id: string;
  tracking_code: string;
  company_id: string;
  origin_location_id: string;
  origin_location_name?: string;
  destination_location_id: string;
  destination_location_name?: string;
  status: TransferStatus;
  sender_user_id?: string;
  sender_user_name?: string;
  receiver_user_id?: string;
  receiver_user_name?: string;
  transport_carrier?: string;
  transport_vehicle_plate?: string;
  transport_driver_name?: string;
  notes?: string;
  remito_number?: string;
  qr_token?: string;
  dispatched_at?: string;
  received_at?: string;
  items?: TransferItem[];
  exceptions?: TransferException[];
  items_count?: number;
  total_units_dispatched?: number;
  total_units_received?: number;
  has_exceptions?: boolean;
  created_at: string;
  updated_at: string;
}

export type MovementType = 
  | 'ingreso_inicial'
  | 'ingreso_compra'
  | 'transferencia_despacho'
  | 'transferencia_recepcion'
  | 'entrega_epp'
  | 'consumo_interno'
  | 'asignacion_activo'
  | 'devolucion_activo'
  | 'ajuste_inventario'
  | 'baja_deterioro';

export interface MovementLog {
  id: string;
  company_id: string;
  item_id: string;
  item_name?: string;
  item_code?: string;
  item_type?: ItemType;
  movement_type: MovementType;
  quantity: number;
  unit?: string;
  from_location_id?: string;
  from_location_name?: string;
  to_location_id?: string;
  to_location_name?: string;
  responsible_user_id?: string;
  responsible_name?: string;
  employee_id?: string;
  employee_name?: string;
  related_document_id?: string; // id de transferencia, entrega EPP, remito
  notes?: string;
  created_at: string;
}

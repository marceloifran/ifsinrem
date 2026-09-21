-- ====================================================================
-- MIGRATION: Operational Platform - Multi-Location, Transfers & Movements
-- Description: Evolves IfsinRem into a distributed operational platform
-- ====================================================================

-- 1. Create Locations table
CREATE TABLE IF NOT EXISTS public.locations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  code        TEXT,
  type        TEXT NOT NULL DEFAULT 'deposito' CHECK (type IN ('central', 'deposito', 'planta', 'obra', 'panol', 'sucursal', 'sector')),
  address     TEXT,
  city        TEXT,
  manager_id  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_default  BOOLEAN NOT NULL DEFAULT false,
  status      TEXT NOT NULL DEFAULT 'activo' CHECK (status IN ('activo', 'inactivo')),
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_locations_company ON public.locations(company_id);

-- 2. Create Generalized Inventory Items table
CREATE TABLE IF NOT EXISTS public.inventory_items (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id       UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  code             TEXT,
  description      TEXT,
  type             TEXT NOT NULL DEFAULT 'consumible' CHECK (type IN ('consumible', 'epp', 'insumo', 'repuesto', 'activo')),
  category         TEXT,
  unit             TEXT NOT NULL DEFAULT 'unidad' CHECK (unit IN ('unidad', 'par', 'juego', 'kg', 'litro', 'metro', 'caja', 'pack')),
  min_global_stock INTEGER NOT NULL DEFAULT 0,
  metadata         JSONB NOT NULL DEFAULT '{}'::jsonb,
  status           TEXT NOT NULL DEFAULT 'activo' CHECK (status IN ('activo', 'inactivo')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inventory_items_company ON public.inventory_items(company_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_type ON public.inventory_items(type);

-- 3. Create Location Stock table
CREATE TABLE IF NOT EXISTS public.location_stock (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  item_id     UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  quantity    INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  min_stock   INTEGER NOT NULL DEFAULT 0,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_location_stock_item UNIQUE (location_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_location_stock_comp_loc ON public.location_stock(company_id, location_id);
CREATE INDEX IF NOT EXISTS idx_location_stock_item ON public.location_stock(item_id);

-- 4. Create Transfers table
CREATE TABLE IF NOT EXISTS public.transfers (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id              UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  tracking_code           TEXT NOT NULL UNIQUE,
  origin_location_id      UUID NOT NULL REFERENCES public.locations(id) ON DELETE RESTRICT,
  destination_location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE RESTRICT,
  status                  TEXT NOT NULL DEFAULT 'borrador' CHECK (status IN ('borrador', 'preparada', 'despachada', 'en_transito', 'recibida', 'recibida_con_diferencias', 'rechazada', 'cancelada')),
  sender_user_id          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  receiver_user_id        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  transport_carrier       TEXT,
  transport_vehicle_plate TEXT,
  transport_driver_name   TEXT,
  notes                   TEXT,
  remito_number           TEXT,
  qr_token                TEXT UNIQUE,
  dispatched_at           TIMESTAMPTZ,
  received_at             TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transfers_company ON public.transfers(company_id);
CREATE INDEX IF NOT EXISTS idx_transfers_status ON public.transfers(status);
CREATE INDEX IF NOT EXISTS idx_transfers_tracking ON public.transfers(tracking_code);

-- 5. Create Transfer Items table
CREATE TABLE IF NOT EXISTS public.transfer_items (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_id      UUID NOT NULL REFERENCES public.transfers(id) ON DELETE CASCADE,
  item_id          UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE RESTRICT,
  requested_qty    INTEGER NOT NULL DEFAULT 1 CHECK (requested_qty > 0),
  dispatched_qty   INTEGER NOT NULL DEFAULT 0 CHECK (dispatched_qty >= 0),
  received_qty     INTEGER DEFAULT NULL CHECK (received_qty IS NULL OR received_qty >= 0),
  status           TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'ok', 'faltante', 'sobrante', 'danado')),
  difference_notes TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transfer_items_transfer ON public.transfer_items(transfer_id);

-- 6. Create Transfer Exceptions (Incidents) table
CREATE TABLE IF NOT EXISTS public.transfer_exceptions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id          UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  transfer_id         UUID NOT NULL REFERENCES public.transfers(id) ON DELETE CASCADE,
  item_id             UUID REFERENCES public.inventory_items(id) ON DELETE SET NULL,
  exception_type      TEXT NOT NULL CHECK (exception_type IN ('faltante', 'sobrante', 'dano', 'producto_incorrecto', 'transferencia_demorada')),
  declared_qty        INTEGER NOT NULL DEFAULT 0,
  actual_qty          INTEGER NOT NULL DEFAULT 0,
  difference          INTEGER NOT NULL DEFAULT 0,
  photo_evidence_url  TEXT,
  notes               TEXT,
  reported_by         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved            BOOLEAN NOT NULL DEFAULT false,
  resolved_at         TIMESTAMPTZ,
  resolution_notes    TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transfer_exceptions_company ON public.transfer_exceptions(company_id);
CREATE INDEX IF NOT EXISTS idx_transfer_exceptions_transfer ON public.transfer_exceptions(transfer_id);

-- 7. Create Movement Audit Log (Immutable Chain of Custody)
CREATE TABLE IF NOT EXISTS public.movements_log (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id          UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  item_id             UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  movement_type       TEXT NOT NULL CHECK (movement_type IN (
    'ingreso_inicial', 'ingreso_compra', 'transferencia_despacho', 
    'transferencia_recepcion', 'entrega_epp', 'consumo_interno', 
    'asignacion_activo', 'devolucion_activo', 'ajuste_inventario', 'baja_deterioro'
  )),
  quantity            INTEGER NOT NULL,
  from_location_id    UUID REFERENCES public.locations(id) ON DELETE SET NULL,
  to_location_id      UUID REFERENCES public.locations(id) ON DELETE SET NULL,
  responsible_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  employee_id         UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  related_document_id TEXT,
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_movements_log_company ON public.movements_log(company_id);
CREATE INDEX IF NOT EXISTS idx_movements_log_item ON public.movements_log(item_id);
CREATE INDEX IF NOT EXISTS idx_movements_log_created ON public.movements_log(created_at DESC);

-- ====================================================================
-- SEED / MIGRATION: Ensure Default Central Location & Migrate EPP items
-- ====================================================================

-- 1. Create Default Central Location for all existing companies
INSERT INTO public.locations (company_id, name, code, type, is_default, status)
SELECT c.id, 'Sede Central / Depósito Principal', 'DEP-01', 'central', true, 'activo'
FROM public.companies c
WHERE NOT EXISTS (
  SELECT 1 FROM public.locations l WHERE l.company_id = c.id
);

-- 2. Migrate existing epp_items to inventory_items
INSERT INTO public.inventory_items (id, company_id, name, description, type, category, unit, min_global_stock, status, created_at, updated_at)
SELECT 
  e.id,
  e.company_id,
  e.name,
  e.description,
  'epp' AS type,
  COALESCE(e.category, 'otro') AS category,
  'unidad' AS unit,
  5 AS min_global_stock,
  'activo' AS status,
  e.created_at,
  e.updated_at
FROM public.epp_items e
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- 3. Populate default location_stock for migrated items
INSERT INTO public.location_stock (company_id, location_id, item_id, quantity, min_stock)
SELECT 
  e.company_id,
  l.id AS location_id,
  e.id AS item_id,
  COALESCE(e.stock, 0) AS quantity,
  5 AS min_stock
FROM public.epp_items e
JOIN public.locations l ON l.company_id = e.company_id AND l.is_default = true
ON CONFLICT (location_id, item_id) DO NOTHING;

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfer_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfer_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movements_log ENABLE ROW LEVEL SECURITY;

-- Locations RLS
CREATE POLICY "Users can view company locations" ON public.locations FOR SELECT TO authenticated
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert company locations" ON public.locations FOR INSERT TO authenticated
  WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update company locations" ON public.locations FOR UPDATE TO authenticated
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete company locations" ON public.locations FOR DELETE TO authenticated
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- Inventory Items RLS
CREATE POLICY "Users can view company inventory items" ON public.inventory_items FOR SELECT TO authenticated
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert company inventory items" ON public.inventory_items FOR INSERT TO authenticated
  WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update company inventory items" ON public.inventory_items FOR UPDATE TO authenticated
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete company inventory items" ON public.inventory_items FOR DELETE TO authenticated
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- Location Stock RLS
CREATE POLICY "Users can view company location stock" ON public.location_stock FOR SELECT TO authenticated
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert company location stock" ON public.location_stock FOR INSERT TO authenticated
  WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update company location stock" ON public.location_stock FOR UPDATE TO authenticated
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete company location stock" ON public.location_stock FOR DELETE TO authenticated
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- Transfers RLS
CREATE POLICY "Users can view company transfers" ON public.transfers FOR SELECT TO authenticated
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Public/Anon can view transfer by tracking code" ON public.transfers FOR SELECT TO anon
  USING (true);

CREATE POLICY "Users can insert company transfers" ON public.transfers FOR INSERT TO authenticated
  WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update company transfers" ON public.transfers FOR UPDATE TO authenticated
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- Transfer Items RLS
CREATE POLICY "Users can view transfer items" ON public.transfer_items FOR SELECT TO authenticated
  USING (transfer_id IN (SELECT id FROM public.transfers WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())));

CREATE POLICY "Public/Anon can view transfer items" ON public.transfer_items FOR SELECT TO anon
  USING (true);

CREATE POLICY "Users can insert transfer items" ON public.transfer_items FOR INSERT TO authenticated
  WITH CHECK (transfer_id IN (SELECT id FROM public.transfers WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())));

CREATE POLICY "Users can update transfer items" ON public.transfer_items FOR UPDATE TO authenticated
  USING (transfer_id IN (SELECT id FROM public.transfers WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())));

-- Transfer Exceptions RLS
CREATE POLICY "Users can view transfer exceptions" ON public.transfer_exceptions FOR SELECT TO authenticated
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert transfer exceptions" ON public.transfer_exceptions FOR INSERT TO authenticated
  WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update transfer exceptions" ON public.transfer_exceptions FOR UPDATE TO authenticated
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- Movements Log RLS
CREATE POLICY "Users can view company movements log" ON public.movements_log FOR SELECT TO authenticated
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert company movements log" ON public.movements_log FOR INSERT TO authenticated
  WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

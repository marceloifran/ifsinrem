-- ==============================================================================
-- SENTINEL ALERTS / EPP - PERFORMANCE DATABASE INDEXES (VERIFICADO)
-- Execute this SQL script in your Supabase SQL Editor to optimize query speed.
-- ==============================================================================

-- 1. EPP Deliveries (Planilla de Entregas y Firmas)
CREATE INDEX IF NOT EXISTS idx_epp_deliveries_company 
  ON epp_deliveries(company_id);

CREATE INDEX IF NOT EXISTS idx_epp_deliveries_employee_status 
  ON epp_deliveries(employee_id, status);

CREATE INDEX IF NOT EXISTS idx_epp_deliveries_item 
  ON epp_deliveries(epp_item_id);

CREATE INDEX IF NOT EXISTS idx_epp_deliveries_date_desc 
  ON epp_deliveries(delivery_date DESC);

CREATE INDEX IF NOT EXISTS idx_epp_deliveries_created_desc 
  ON epp_deliveries(created_at DESC);


-- 2. Employees / Operarios Directory
CREATE INDEX IF NOT EXISTS idx_employees_company 
  ON employees(company_id);

CREATE INDEX IF NOT EXISTS idx_employees_company_dni 
  ON employees(company_id, dni_cuil);

CREATE INDEX IF NOT EXISTS idx_employees_name 
  ON employees(name);


-- 3. EPP Items & Stock (Catálogo de Elementos)
CREATE INDEX IF NOT EXISTS idx_epp_items_company_stock 
  ON epp_items(company_id, stock ASC);

CREATE INDEX IF NOT EXISTS idx_epp_items_category 
  ON epp_items(company_id, category);


-- 4. User Profiles & Roles (Gestión de Usuarios y Permisos)
CREATE INDEX IF NOT EXISTS idx_profiles_company 
  ON profiles(company_id);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_role 
  ON user_roles(user_id, role);


-- Verify Index Creation Status
SELECT 
    tablename, 
    indexname, 
    indexdef 
FROM 
    pg_indexes 
WHERE 
    schemaname = 'public' 
    AND tablename IN ('epp_deliveries', 'employees', 'epp_items', 'profiles', 'user_roles')
ORDER BY 
    tablename, indexname;

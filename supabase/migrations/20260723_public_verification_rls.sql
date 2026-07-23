-- Migration: Enable Public Read Access for EPP Verification (/verificar-constancia/:id)
-- Description: Idempotent script using DROP POLICY IF EXISTS before CREATE POLICY.

-- 1. Allow public SELECT on epp_deliveries for verification
DROP POLICY IF EXISTS "Allow public select on epp_deliveries" ON public.epp_deliveries;
CREATE POLICY "Allow public select on epp_deliveries"
  ON public.epp_deliveries FOR SELECT
  TO anon, authenticated
  USING (true);

-- 2. Allow public SELECT on employees for verification
DROP POLICY IF EXISTS "Allow public select on employees" ON public.employees;
CREATE POLICY "Allow public select on employees"
  ON public.employees FOR SELECT
  TO anon, authenticated
  USING (true);

-- 3. Allow public SELECT on epp_items for verification
DROP POLICY IF EXISTS "Allow public select on epp_items" ON public.epp_items;
CREATE POLICY "Allow public select on epp_items"
  ON public.epp_items FOR SELECT
  TO anon, authenticated
  USING (true);

-- 4. Allow public SELECT on companies for verification
DROP POLICY IF EXISTS "Allow public select on companies" ON public.companies;
CREATE POLICY "Allow public select on companies"
  ON public.companies FOR SELECT
  TO anon, authenticated
  USING (true);

-- 5. Storage Policies for Signatures Bucket (Public Read)
UPDATE storage.buckets SET public = true WHERE id = 'signatures';

DROP POLICY IF EXISTS "Allow public view of signatures" ON storage.objects;
CREATE POLICY "Allow public view of signatures"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'signatures');

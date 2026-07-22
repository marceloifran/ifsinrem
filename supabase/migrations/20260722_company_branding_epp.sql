-- Migration: Add logo_url to companies and set up company-logos storage bucket
-- Description: Enables per-company custom logo and extended company branding for multi-tenant EPP documents.

-- 1. Add logo_url column to companies table
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- 2. Create storage bucket for company logos if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-logos', 'company-logos', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Enable Storage RLS Policies for company-logos bucket
DROP POLICY IF EXISTS "Authenticated users can upload company logos" ON storage.objects;
CREATE POLICY "Authenticated users can upload company logos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'company-logos');

DROP POLICY IF EXISTS "Authenticated users can update company logos" ON storage.objects;
CREATE POLICY "Authenticated users can update company logos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'company-logos');

DROP POLICY IF EXISTS "Authenticated users can delete company logos" ON storage.objects;
CREATE POLICY "Authenticated users can delete company logos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'company-logos');

DROP POLICY IF EXISTS "Anyone can view company logos" ON storage.objects;
CREATE POLICY "Anyone can view company logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'company-logos');

-- Migration for 100% Legal Compliance & Audit Trail (Res. SRT 299/11)

-- 1. Add audit trail & security hash columns to epp_deliveries
ALTER TABLE public.epp_deliveries
ADD COLUMN IF NOT EXISTS ip_address TEXT,
ADD COLUMN IF NOT EXISTS geolocation TEXT,
ADD COLUMN IF NOT EXISTS device_info TEXT,
ADD COLUMN IF NOT EXISTS hash_sha256 TEXT,
ADD COLUMN IF NOT EXISTS supervisor_id UUID REFERENCES auth.users(id);

-- 2. Add certification columns to epp_items
ALTER TABLE public.epp_items
ADD COLUMN IF NOT EXISTS certification_body TEXT DEFAULT 'IRAM / IQC / UL',
ADD COLUMN IF NOT EXISTS certification_number TEXT;

-- 3. Comments for documentation
COMMENT ON COLUMN public.epp_deliveries.ip_address IS 'Public IP of the device during tactile signature';
COMMENT ON COLUMN public.epp_deliveries.geolocation IS 'Latitude/Longitude coordinates captured in field';
COMMENT ON COLUMN public.epp_deliveries.device_info IS 'User-Agent and browser/device metadata';
COMMENT ON COLUMN public.epp_deliveries.hash_sha256 IS 'SHA-256 cryptographic integrity hash for non-repudiation';
COMMENT ON COLUMN public.epp_items.certification_body IS 'Certifying body e.g. IRAM, IQC, UL';
COMMENT ON COLUMN public.epp_items.certification_number IS 'Official certification license/stamp number';

import { supabase } from '@/integrations/supabase/client';

export interface Company {
  id: string;
  name: string;
  cuit: string | null;
  plan: 'starter' | 'professional' | 'enterprise';
  address: string | null;
  city: string | null;
  zip_code: string | null;
  state: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export async function getCompanyDetails(companyId: string): Promise<Company | null> {
  if (!companyId) return null;

  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', companyId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching company details:', error);
    throw error;
  }

  return data as Company | null;
}

export async function updateCompanyDetails(
  companyId: string,
  updates: Partial<Omit<Company, 'id' | 'created_at' | 'updated_at'>>
): Promise<Company> {
  const { data, error } = await supabase
    .from('companies')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', companyId)
    .select('*')
    .single();

  if (error) {
    console.error('Error updating company details:', error);
    throw error;
  }

  return data as Company;
}

export async function uploadCompanyLogo(
  companyId: string,
  file: File
): Promise<string> {
  if (!companyId) throw new Error('Company ID is required to upload logo');

  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'png';
  const filePath = `${companyId}/logo_${Date.now()}.${fileExt}`;

  // 1. Upload file to 'company-logos' bucket
  const { error: uploadError } = await supabase.storage
    .from('company-logos')
    .upload(filePath, file, {
      contentType: file.type || `image/${fileExt}`,
      upsert: true,
    });

  if (uploadError) {
    console.error('Error uploading company logo to storage:', uploadError);
    throw uploadError;
  }

  // 2. Get Public URL
  const { data: publicUrlData } = supabase.storage
    .from('company-logos')
    .getPublicUrl(filePath);

  const logoUrl = publicUrlData.publicUrl;

  // 3. Update companies record with logo_url
  await updateCompanyDetails(companyId, { logo_url: logoUrl });

  return logoUrl;
}

export async function removeCompanyLogo(companyId: string): Promise<void> {
  if (!companyId) return;

  await updateCompanyDetails(companyId, { logo_url: null });
}

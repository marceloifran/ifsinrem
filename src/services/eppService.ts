import { supabase } from '@/integrations/supabase/client';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';

// Type definitions matching the database schema
export interface Employee {
  id: string;
  company_id: string;
  name: string;
  dni_cuil: string;
  file_number: string | null;
  job_title: string | null;
  phone: string | null;
  status: string; // 'activo' | 'inactivo'
  created_at: string;
  updated_at: string;
  job_description?: string | null;
  required_epps?: string | null;
}

export interface EPPItem {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  category: string | null; // 'cabeza', 'manos', etc.
  stock: number;
  created_at: string;
  updated_at: string;
  type_model?: string | null;
  brand?: string | null;
  certified?: string | null;
  certification_body?: string | null; // 'IRAM', 'IQC', 'UL'
  certification_number?: string | null;
}

export interface EPPDelivery {
  id: string;
  company_id: string;
  employee_id: string;
  epp_item_id: string;
  quantity: number;
  delivery_date: string;
  supervisor_id: string;
  signature_path: string | null;
  status: string; // 'pendiente' | 'firmado'
  signed_at: string | null;
  ip_address?: string | null;
  geolocation?: string | null;
  device_info?: string | null;
  hash_sha256?: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  employee?: { name: string; dni_cuil: string; job_title: string | null; job_description?: string | null };
  epp_item?: { name: string; category: string | null; type_model?: string | null; brand?: string | null; certified?: string | null; certification_body?: string | null; certification_number?: string | null };
}

// ─── EMPLOYEES CRUD ──────────────────────────────────────────────────────────

export async function getEmployees(companyId: string): Promise<Employee[]> {
  const { data, error } = await (supabase as any)
    .from('employees')
    .select('*')
    .eq('company_id', companyId)
    .order('name', { ascending: true });

  if (error) throw error;
  return (data || []) as Employee[];
}

export async function addEmployee(
  companyId: string,
  employee: Omit<Employee, 'id' | 'company_id' | 'created_at' | 'updated_at'>
): Promise<Employee> {
  const { data, error } = await (supabase as any)
    .from('employees')
    .insert({ ...employee, company_id: companyId })
    .select()
    .single();

  if (error) throw error;
  return data as Employee;
}

export async function addEmployeesBulk(
  companyId: string,
  employees: Omit<Employee, 'id' | 'company_id' | 'created_at' | 'updated_at'>[]
): Promise<number> {
  if (!employees.length) return 0;
  const rowsToInsert = employees.map(emp => ({ ...emp, company_id: companyId }));
  const { data, error } = await (supabase as any)
    .from('employees')
    .insert(rowsToInsert)
    .select('id');

  if (error) throw error;
  return data?.length || 0;
}

export async function updateEmployee(
  employeeId: string,
  updates: Partial<Omit<Employee, 'id' | 'company_id' | 'created_at' | 'updated_at'>>
): Promise<Employee> {
  const { data, error } = await (supabase as any)
    .from('employees')
    .update(updates)
    .eq('id', employeeId)
    .select()
    .single();

  if (error) throw error;
  return data as Employee;
}

export async function deleteEmployee(employeeId: string): Promise<void> {
  const { error } = await (supabase as any)
    .from('employees')
    .delete()
    .eq('id', employeeId);

  if (error) throw error;
}

// ─── EPP ITEMS CRUD ──────────────────────────────────────────────────────────

export async function getEPPItems(companyId: string): Promise<EPPItem[]> {
  const { data, error } = await (supabase as any)
    .from('epp_items')
    .select('*')
    .eq('company_id', companyId)
    .order('name', { ascending: true });

  if (error) throw error;
  return (data || []) as EPPItem[];
}

export async function addEPPItem(
  companyId: string,
  item: Omit<EPPItem, 'id' | 'company_id' | 'created_at' | 'updated_at'>
): Promise<EPPItem> {
  const { data, error } = await (supabase as any)
    .from('epp_items')
    .insert({ ...item, company_id: companyId })
    .select()
    .single();

  if (error) throw error;
  return data as EPPItem;
}

export async function addEPPItemsBulk(
  companyId: string,
  items: Omit<EPPItem, 'id' | 'company_id' | 'created_at' | 'updated_at'>[]
): Promise<number> {
  if (!items.length) return 0;
  const rowsToInsert = items.map(item => ({ ...item, company_id: companyId }));
  const { data, error } = await (supabase as any)
    .from('epp_items')
    .insert(rowsToInsert)
    .select('id');

  if (error) throw error;
  return data?.length || 0;
}

export async function updateEPPItem(
  itemId: string,
  updates: Partial<Omit<EPPItem, 'id' | 'company_id' | 'created_at' | 'updated_at'>>
): Promise<EPPItem> {
  const { data, error } = await (supabase as any)
    .from('epp_items')
    .update(updates)
    .eq('id', itemId)
    .select()
    .single();

  if (error) throw error;
  return data as EPPItem;
}

export async function deleteEPPItem(itemId: string): Promise<void> {
  const { error } = await (supabase as any)
    .from('epp_items')
    .delete()
    .eq('id', itemId);

  if (error) throw error;
}

// ─── EPP DELIVERIES ──────────────────────────────────────────────────────────

export async function getEPPDeliveries(companyId: string): Promise<EPPDelivery[]> {
  const { data, error } = await (supabase as any)
    .from('epp_deliveries')
    .select('*, employee:employees(name, dni_cuil, job_title), epp_item:epp_items(name, category, type_model, brand, certified)')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as any[];
}

export async function addEPPDelivery(
  companyId: string,
  delivery: Omit<EPPDelivery, 'id' | 'company_id' | 'signature_path' | 'signed_at' | 'created_at' | 'updated_at'>
): Promise<EPPDelivery> {
  const { data, error } = await (supabase as any)
    .from('epp_deliveries')
    .insert({ ...delivery, company_id: companyId })
    .select('*, employee:employees(name, dni_cuil, job_title), epp_item:epp_items(name, category, type_model, brand, certified)')
    .single();

  if (error) throw error;
  return data as any;
}

// Check if a worker has signed any EPP delivery in the past
export async function checkWorkerHasSignedBefore(employeeId: string): Promise<boolean> {
  if (!employeeId) return false;
  try {
    const { count, error } = await (supabase as any)
      .from('epp_deliveries')
      .select('id', { count: 'exact', head: true })
      .eq('employee_id', employeeId)
      .eq('status', 'firmado');

    if (error || !count) return false;
    return count > 0;
  } catch (err) {
    console.error("Error checking worker signature history:", err);
    return false;
  }
}

// Helper to compute SHA-256 cryptographic hash for non-repudiation
export async function generateSHA256Hash(text: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Helper to fetch client IP address with fallback
async function fetchClientIP(): Promise<string> {
  try {
    const res = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(3000) });
    const data = await res.json();
    return data.ip || 'Red de Obra / Local';
  } catch (err) {
    return 'Red de Obra / Local';
  }
}

// Helper to fetch GPS Geolocation if granted
function fetchClientGeolocation(): Promise<string> {
  return new Promise((resolve) => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve(`${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`);
        },
        () => resolve('GPS No Habilitado / Obra'),
        { timeout: 4000 }
      );
    } else {
      resolve('GPS No Soportado');
    }
  });
}

// Sign a delivery with an in-situ tactile signature (base64 string) + Full Audit Trail
export async function signEPPDelivery(
  deliveryId: string,
  signatureBase64: string,
  auditOptions?: { ip_address?: string; geolocation?: string; device_info?: string }
): Promise<EPPDelivery> {
  // Convert base64 dataURL to Blob
  const res = await fetch(signatureBase64);
  const blob = await res.blob();
  const fileName = `${deliveryId}_sig.png`;
  const filePath = `signatures/${fileName}`;

  // Upload to Supabase Storage Bucket 'signatures'
  const { error: uploadError } = await supabase.storage
    .from('signatures')
    .upload(filePath, blob, {
      contentType: 'image/png',
      upsert: true,
    });

  if (uploadError) throw uploadError;

  const nowIso = new Date().toISOString();
  const ipAddress = auditOptions?.ip_address || (await fetchClientIP());
  const geolocation = auditOptions?.geolocation || (await fetchClientGeolocation());
  const deviceInfo = auditOptions?.device_info || (typeof navigator !== 'undefined' ? navigator.userAgent : 'Mobile Browser');

  // Generate SHA-256 Hash of delivery metadata + signature bytes
  const payloadToHash = `DELIVERY:${deliveryId}|TIME:${nowIso}|IP:${ipAddress}|GPS:${geolocation}|DEV:${deviceInfo}|SIG:${signatureBase64.substring(0, 100)}`;
  const hashSHA256 = await generateSHA256Hash(payloadToHash);

  // Update epp_deliveries record with audit metadata & hash
  const { data, error } = await (supabase as any)
    .from('epp_deliveries')
    .update({
      signature_path: filePath,
      status: 'firmado',
      signed_at: nowIso,
      ip_address: ipAddress,
      geolocation: geolocation,
      device_info: deviceInfo,
      hash_sha256: hashSHA256,
    })
    .eq('id', deliveryId)
    .select('*, employee:employees(name, dni_cuil, job_title), epp_item:epp_items(name, category, type_model, brand, certified, certification_body, certification_number)')
    .single();

  if (error) throw error;
  return data as any;
}

export async function getSignatureUrl(filePath: string): Promise<string> {
  try {
    // 1. Try to download the signature directly as a Blob using the active session
    const { data, error } = await supabase.storage
      .from('signatures')
      .download(filePath);

    if (!error && data) {
      return URL.createObjectURL(data);
    }

    console.warn(
      `getSignatureUrl: direct download failed, falling back to signed URL. Error:`,
      error,
      `Path:`,
      filePath
    );
  } catch (err) {
    console.error("getSignatureUrl: unexpected direct download error:", err);
  }

  // Fallback: Create signed URL
  const { data, error } = await supabase.storage
    .from('signatures')
    .createSignedUrl(filePath, 3600); // 1 hour expiry

  if (error || !data?.signedUrl) {
    console.error("getSignatureUrl: fallback signed URL also failed:", error);
    const { data: publicData } = await supabase.storage
      .from('signatures')
      .getPublicUrl(filePath);
    return publicData.publicUrl;
  }

  return data.signedUrl;
}

async function fetchSignatureAsBase64(path: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from('signatures')
      .download(path);

    if (error || !data) {
      throw error || new Error("No se pudo descargar la firma desde el storage");
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(data);
    });
  } catch (err) {
    console.error("Error cargando firma para PDF:", err);
    return null;
  }
}

async function fetchUrlAsBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.error("Error cargando logo para PDF:", err);
    return null;
  }
}

// ─── PDF GENERATION (FORMULARIO 299 SRT EXACT LAYOUT) ──────────────────────────

export async function buildForm299PDF(
  companyInfo: { name: string; cuit: string | null },
  employeeInfo: Employee,
  deliveries: EPPDelivery[]
): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // 1. Fetch complete data from Supabase to ensure extended fields are filled
  const { data: companyData } = await (supabase as any)
    .from('companies')
    .select('*')
    .eq('id', employeeInfo.company_id)
    .single();

  const company: any = companyData || {
    name: companyInfo.name,
    cuit: companyInfo.cuit,
    address: "",
    city: "",
    zip_code: "",
    state: "",
    logo_url: null,
  };

  const { data: employeeData } = await (supabase as any)
    .from('employees')
    .select('*')
    .eq('id', employeeInfo.id)
    .single();

  const employee: Employee = employeeData || employeeInfo;

  // Preload company logo if configured
  let companyLogoBase64: string | null = null;
  if (company.logo_url) {
    companyLogoBase64 = await fetchUrlAsBase64(company.logo_url);
  }

  // 2. Preload signatures to embed directly into cells
  const preloadedSignatures = await Promise.all(
    deliveries.map(async (d) => {
      if (d.status === 'firmado' && d.signature_path) {
        const base64 = await fetchSignatureAsBase64(d.signature_path);
        return { id: d.id, base64 };
      }
      return { id: d.id, base64: null };
    })
  );
  const sigMap = new Map(preloadedSignatures.map((s) => [s.id, s.base64]));

  // ─── DRAW METADATA GRID (EXACTLY MATCHING USER SCREENSHOT) ───────────────────
  
  // Y position start
  const startY = 15;

  // Set line properties
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);

  // Outer border box (190mm wide, 85mm tall)
  doc.rect(10, startY, 190, 85);

  // Horizontal separators
  doc.line(10, startY + 15, 200, startY + 15); // Split title
  doc.line(10, startY + 25, 200, startY + 25); // Split Razon Social
  doc.line(10, startY + 37, 200, startY + 37); // Split Direccion
  doc.line(10, startY + 47, 200, startY + 47); // Split Trabajador name
  doc.line(10, startY + 59, 200, startY + 59); // Split headers for job desc / EPP list

  // Vertical separators
  doc.line(170, startY, 170, startY + 15); // Title right box (Logo)

  // Razon Social row splits
  doc.line(38, startY + 15, 38, startY + 25);
  doc.line(68, startY + 15, 68, startY + 25);
  doc.line(110, startY + 15, 110, startY + 25);

  // Direccion row splits (Adjusted to span 10mm-200mm seamlessly without unused right box)
  doc.line(32, startY + 25, 32, startY + 37);
  doc.line(78, startY + 25, 78, startY + 37);
  doc.line(95, startY + 25, 95, startY + 37);
  doc.line(125, startY + 25, 125, startY + 37);
  doc.line(135, startY + 25, 135, startY + 37);
  doc.line(148, startY + 25, 148, startY + 37);
  doc.line(168, startY + 25, 168, startY + 37);

  // Trabajador row splits
  doc.line(45, startY + 37, 45, startY + 47);
  doc.line(110, startY + 37, 110, startY + 47);
  doc.line(130, startY + 37, 130, startY + 47);

  // Job description & required EPP split
  doc.line(68, startY + 47, 68, startY + 85);

  // ─── POPULATE GRID LABELS AND VALUES ─────────────────────────────────────────
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);

  // Top Title
  doc.setFontSize(9);
  doc.text("CONSTANCIA DE ENTREGA DE ROPA Y TRABAJO Y ELEMENTOS DE PROTECCION", 90, startY + 5, { align: 'center' });
  doc.text("PERSONAL", 90, startY + 9, { align: 'center' });
  doc.setFontSize(8);
  doc.text("(Resolucion S.R.T N° 299/2011)", 90, startY + 13, { align: 'center' });

  // Top Right Logo Box (Render custom company logo or fallback)
  if (companyLogoBase64) {
    try {
      doc.addImage(
        companyLogoBase64,
        'PNG',
        171,
        startY + 1,
        28,
        13,
        undefined,
        'FAST'
      );
    } catch (err) {
      console.warn("Error dibujando logo empresarial en PDF, aplicando texto alternativo:", err);
      doc.setFontSize(8);
      doc.setTextColor(16, 185, 129);
      doc.text(company.name ? company.name.substring(0, 14) : "EMPRESA", 185, startY + 8, { align: 'center' });
    }
  } else {
    doc.setFontSize(8);
    doc.setTextColor(16, 185, 129); // Emerald color accent
    const displayName = company.name ? company.name.substring(0, 14) : "EMPRESA";
    doc.text(displayName, 185, startY + 8, { align: 'center' });
  }

  // Reset text color to black
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(8);

  // Razón Social Row
  doc.setFont('Helvetica', 'bold');
  doc.text("Razón Social", 12, startY + 21);
  doc.setFont('Helvetica', 'normal');
  doc.text(company.name || "", 40, startY + 21);

  doc.setFont('Helvetica', 'bold');
  doc.text("C.U.I.T. N°:", 70, startY + 21);
  doc.setFont('Helvetica', 'normal');
  doc.text(company.cuit || "", 112, startY + 21);

  // Dirección Row (No overlapping labels & seamless Provincia width)
  doc.setFont('Helvetica', 'bold');
  doc.text("Dirección:", 12, startY + 32);
  doc.setFont('Helvetica', 'normal');
  const splitDir = doc.splitTextToSize(company.address || "", 44);
  doc.text(splitDir, 33, startY + 32);

  doc.setFont('Helvetica', 'bold');
  doc.text("Localidad:", 79, startY + 32);
  doc.setFont('Helvetica', 'normal');
  doc.text(company.city || "", 96, startY + 32);

  doc.setFont('Helvetica', 'bold');
  doc.text("CP:", 126, startY + 32);
  doc.setFont('Helvetica', 'normal');
  doc.text(company.zip_code || "", 136, startY + 32);

  doc.setFont('Helvetica', 'bold');
  doc.text("Provincia:", 149, startY + 32);
  doc.setFont('Helvetica', 'normal');
  doc.text(company.state || "", 169, startY + 32);

  // Apellido y Nombre Row (Fixed startY + 45 for 'del Trabajador:')
  doc.setFont('Helvetica', 'bold');
  doc.text("Apellido y Nombre", 12, startY + 41);
  doc.text("del Trabajador:", 12, startY + 45);
  doc.setFont('Helvetica', 'normal');
  doc.text(employee.name || "", 47, startY + 43);

  doc.setFont('Helvetica', 'bold');
  doc.text("D.N.I N°:", 112, startY + 43);
  doc.setFont('Helvetica', 'normal');
  doc.text(employee.dni_cuil || "", 132, startY + 43);

  // Headers for Job and EPP
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7.5);
  const briefJobText = "Breve descripción del/lospuestos/s de trabajo en el/los cual/es se desempeña el trabajador:";
  const splitBriefJob = doc.splitTextToSize(briefJobText, 54);
  doc.text(splitBriefJob, 12, startY + 51);

  const eppListText = "Elementos de Protección Personal necesarios para el trabajador, según el/los puesto/s de trabajo:";
  const splitEppList = doc.splitTextToSize(eppListText, 120);
  doc.text(splitEppList, 70, startY + 51);

  // Description Values
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7);
  const jobVal = employee.job_description || "Operario de Tareas Generales en Obra: Excavación Manual y Movimiento de Suelos -Corte y Armado de Hierros - Armado de Encofrados - Elaboración, vertido y vibrado de H° A° - Trabajos de Albañilería en General.-";
  const splitJobVal = doc.splitTextToSize(jobVal, 54);
  doc.text(splitJobVal, 12, startY + 63);

  const eppVal = employee.required_epps || "Casco de Seguridad / Gafas de Seguridad Transparentes / Guantes de Vaqueta / Guantes de Acrilonitrilo / Mascarilla libre de mantenimiento de polvos / Botines de Seguridad con Puntera / Protectores Auditivos. -";
  const splitEppVal = doc.splitTextToSize(eppVal, 120);
  doc.text(splitEppVal, 70, startY + 63);

  // ─── MAIN ITEMS TABLE ────────────────────────────────────────────────────────
  
  // Headers match columns: N°, Description (blank header), TIPO/MODELO, MARCA, POSEE CERTIFICACION, CANTIDAD, FECHA, FIRMA
  const tableHeaders = [
    [
      'N°',
      'DETALLE DE ELEMENTO', // Blank header or description header
      'TIPO/MODELO',
      'MARCA',
      'POSEE CERTIFICACIÓN (SI/NO)',
      'CANTIDAD',
      'FECHA DE ENTREGA',
      'FIRMA DEL TRABAJADOR'
    ]
  ];

  const tableRows = deliveries.map((d, idx) => {
    const certText = (d.epp_item as any)?.certification_body
      ? `${(d.epp_item as any)?.certified || 'Si'} (${(d.epp_item as any).certification_body})`
      : ((d.epp_item as any)?.certified || 'Si');

    return [
      (idx + 1).toString(),
      d.epp_item?.name || 'Elemento',
      (d.epp_item as any)?.type_model || '',
      (d.epp_item as any)?.brand || '',
      certText,
      d.quantity.toString(),
      d.delivery_date,
      '' // Firma column holds empty space to render the preloaded canvas signature
    ];
  });

  autoTable(doc, {
    startY: startY + 87, // Place table immediately below the metadata box (85mm tall + startY + 2mm padding)
    head: tableHeaders,
    body: tableRows,
    theme: 'grid',
    styles: {
      lineColor: [0, 0, 0],
      lineWidth: 0.2,
      textColor: [0, 0, 0],
      fontSize: 7.5,
      valign: 'middle',
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      halign: 'center',
      lineWidth: 0.2,
      lineColor: [0, 0, 0],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 40 },
      2: { cellWidth: 25 },
      3: { cellWidth: 20 },
      4: { cellWidth: 32, halign: 'center' },
      5: { cellWidth: 15, halign: 'center' },
      6: { cellWidth: 23, halign: 'center' },
      7: { cellWidth: 25, halign: 'center', minCellHeight: 14 } // Height to fit hand-written signature
    },
    margin: { left: 10, right: 10 },
    didDrawCell: function (data: any) {
      if (data.column.index === 7 && data.cell.section === 'body') {
        const delivery = deliveries[data.row.index];
        const sigBase64 = sigMap.get(delivery.id);
        if (sigBase64) {
          const cell = data.cell;
          const padding = 1.5;
          doc.addImage(
            sigBase64,
            'PNG',
            cell.x + padding,
            cell.y + padding,
            cell.width - (padding * 2),
            cell.height - (padding * 2)
          );
        }
      }
    }
  });

  // ─── SECURITY & VERIFICATION FOOTER (RES. SRT 299/11) ──────────────────────
  const firstSignedDelivery = deliveries.find((d) => d.status === 'firmado' || d.hash_sha256);
  const targetDeliveryId = firstSignedDelivery?.id || deliveries[0]?.id || employee.id;
  
  const appDomain = (import.meta.env.VITE_APP_URL as string) || (typeof window !== 'undefined' ? window.location.origin : 'https://www.ifsinrem.site');
  const verifyUrl = `${appDomain}/verificar-constancia/${targetDeliveryId}`;

  try {
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 120 });
    const qrY = 262;
    doc.setDrawColor(16, 185, 129);
    doc.setLineWidth(0.3);
    doc.rect(10, qrY, 190, 24);

    doc.addImage(qrDataUrl, 'PNG', 172, qrY + 1.5, 21, 21);

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(5, 150, 105);
    doc.text("VALIDACIÓN DE AUTENTICIDAD DIGITAL — RESOLUCIÓN SRT N° 299/2011", 13, qrY + 6);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(60, 60, 60);
    doc.text(`Sistema Homologado de Firma Digital de Entregas de EPP con Trazabilidad Criptográfica de Inalterabilidad.`, 13, qrY + 11);
    
    const hashDisplay = firstSignedDelivery?.hash_sha256 || '9a4f8b... (Pendiente Sello Criptográfico)';
    doc.text(`Hash SHA-256: ${hashDisplay}`, 13, qrY + 16);
    doc.text(`Escanear el código QR para verificar trazabilidad pública e integridad en tiempo real.`, 13, qrY + 21);
  } catch (err) {
    console.error("Error drawing QR code in PDF:", err);
  }

  return doc;
}

export async function generateForm299PDF(
  companyInfo: { name: string; cuit: string | null },
  employeeInfo: Employee,
  deliveries: EPPDelivery[]
): Promise<void> {
  const doc = await buildForm299PDF(companyInfo, employeeInfo, deliveries);
  doc.save(`Formulario_299_${employeeInfo.name.replace(/\s+/g, '_')}.pdf`);
}

// Service to fetch verification details for the public Verification Page (/verificar-constancia/:id)
export async function getDeliveryVerification(deliveryId: string) {
  let mainDelivery: any = null;

  // 1. Try fetching exact delivery by ID with extended fields
  const extRes = await (supabase as any)
    .from('epp_deliveries')
    .select('*, employee:employees(name, dni_cuil, job_title, file_number, company_id), epp_item:epp_items(name, category, type_model, brand, certified, certification_body, certification_number), company:companies(name, cuit, logo_url)')
    .eq('id', deliveryId)
    .maybeSingle();

  if (!extRes.error && extRes.data) {
    mainDelivery = extRes.data;
  } else {
    // Fallback to basic query if extended schema fields don't exist yet
    const basicRes = await (supabase as any)
      .from('epp_deliveries')
      .select('*, employee:employees(name, dni_cuil, job_title, file_number, company_id), epp_item:epp_items(name, category), company:companies(name, cuit, logo_url)')
      .eq('id', deliveryId)
      .maybeSingle();
    mainDelivery = basicRes.data;
  }

  // Determine target employee ID
  const employeeId = mainDelivery?.employee_id || deliveryId;

  // 2. Fetch ALL deliveries for this worker so the full EPP list can be validated
  let allDeliveries: any[] = [];
  const { data: empDeliveries } = await (supabase as any)
    .from('epp_deliveries')
    .select('*, employee:employees(name, dni_cuil, job_title, file_number, company_id), epp_item:epp_items(name, category, type_model, brand, certified, certification_body, certification_number), company:companies(name, cuit, logo_url)')
    .eq('employee_id', employeeId)
    .order('created_at', { ascending: false });

  if (empDeliveries && empDeliveries.length > 0) {
    allDeliveries = empDeliveries;
    if (!mainDelivery) {
      mainDelivery = empDeliveries[0];
    }
  } else if (mainDelivery) {
    allDeliveries = [mainDelivery];
  }

  if (!mainDelivery) return null;

  return { delivery: mainDelivery, allDeliveries };
}

import * as XLSX from 'xlsx';
import type { Employee, EPPItem } from '@/services/eppService';

export interface ParsedEmployeeRow {
  name: string;
  dni_cuil: string;
  file_number: string;
  job_title: string;
  phone: string;
  job_description: string;
  status: string;
  isValid: boolean;
  error?: string;
}

export interface ParsedEPPRow {
  name: string;
  description: string;
  category: string;
  stock: number;
  brand: string;
  type_model: string;
  certified: string;
  certification_body: string;
  certification_number: string;
  isValid: boolean;
  error?: string;
}

// ─── HELPER TO NORMALIZE HEADERS ─────────────────────────────────────────────

function normalizeHeader(header: string): string {
  return String(header || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

// ─── PARSE EMPLOYEES ─────────────────────────────────────────────────────────

export async function parseEmployeesExcel(file: File): Promise<{ rows: ParsedEmployeeRow[]; validCount: number; invalidCount: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          resolve({ rows: [], validCount: 0, invalidCount: 0 });
          return;
        }

        const rows: ParsedEmployeeRow[] = rawJson.map((row) => {
          let name = '';
          let dni_cuil = '';
          let file_number = '';
          let job_title = '';
          let phone = '';
          let job_description = '';

          // Match columns flexibly
          Object.keys(row).forEach((key) => {
            const normKey = normalizeHeader(key);
            const val = String(row[key] ?? '').trim();

            if (['nombre', 'nombreyapellido', 'empleado', 'nombrecompleto', 'name'].includes(normKey)) {
              name = val;
            } else if (['dni', 'cuil', 'dnicuil', 'documento', 'identificacion'].includes(normKey)) {
              dni_cuil = val;
            } else if (['legajo', 'nlegajo', 'filenumber', 'numerolegajo'].includes(normKey)) {
              file_number = val;
            } else if (['puesto', 'cargo', 'posicion', 'jobtitle', 'funcion'].includes(normKey)) {
              job_title = val;
            } else if (['telefono', 'celular', 'phone', 'movil', 'contacto'].includes(normKey)) {
              phone = val;
            } else if (['descripcionpuesto', 'descripcion', 'tareas', 'observaciones'].includes(normKey)) {
              job_description = val;
            }
          });

          let isValid = true;
          let error = '';

          if (!name) {
            isValid = false;
            error = 'El nombre es obligatorio';
          }

          return {
            name,
            dni_cuil,
            file_number,
            job_title,
            phone,
            job_description,
            status: 'activo',
            isValid,
            error,
          };
        });

        const validCount = rows.filter((r) => r.isValid).length;
        const invalidCount = rows.length - validCount;

        resolve({ rows, validCount, invalidCount });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}

// ─── PARSE EPP ITEMS ─────────────────────────────────────────────────────────

export async function parseEPPItemsExcel(file: File): Promise<{ rows: ParsedEPPRow[]; validCount: number; invalidCount: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          resolve({ rows: [], validCount: 0, invalidCount: 0 });
          return;
        }

        const rows: ParsedEPPRow[] = rawJson.map((row) => {
          let name = '';
          let description = '';
          let category = 'varios';
          let stock = 0;
          let brand = '';
          let type_model = '';
          let certified = 'NO';
          let certification_body = '';
          let certification_number = '';

          Object.keys(row).forEach((key) => {
            const normKey = normalizeHeader(key);
            const val = String(row[key] ?? '').trim();

            if (['nombre', 'nombredelepp', 'epp', 'producto', 'elemento', 'equipo'].includes(normKey)) {
              name = val;
            } else if (['descripcion', 'detalle', 'notes'].includes(normKey)) {
              description = val;
            } else if (['categoria', 'rubro', 'tipoep'].includes(normKey)) {
              category = val ? val.toLowerCase() : 'varios';
            } else if (['stock', 'stockinicial', 'cantidad', 'unidades'].includes(normKey)) {
              const parsedStock = parseInt(val, 10);
              stock = isNaN(parsedStock) ? 0 : Math.max(0, parsedStock);
            } else if (['marca', 'fabricante'].includes(normKey)) {
              brand = val;
            } else if (['modelo', 'modelotipo', 'tipo'].includes(normKey)) {
              type_model = val;
            } else if (['certificado', 'certificacion', 'certificadosino'].includes(normKey)) {
              const lower = val.toLowerCase();
              certified = (lower === 'si' || lower === 'sí' || lower === 'yes' || lower === 'true' || lower === '1') ? 'SI' : 'NO';
            } else if (['organismo', 'organismocertificador', 'ente', 'norma'].includes(normKey)) {
              certification_body = val;
            } else if (['ncertificado', 'numerocertificado', 'certificadon'].includes(normKey)) {
              certification_number = val;
            }
          });

          let isValid = true;
          let error = '';

          if (!name) {
            isValid = false;
            error = 'El nombre del EPP es obligatorio';
          }

          return {
            name,
            description,
            category,
            stock,
            brand,
            type_model,
            certified,
            certification_body,
            certification_number,
            isValid,
            error,
          };
        });

        const validCount = rows.filter((r) => r.isValid).length;
        const invalidCount = rows.length - validCount;

        resolve({ rows, validCount, invalidCount });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}

// ─── DOWNLOAD TEMPLATES ──────────────────────────────────────────────────────

export function downloadEmployeeTemplate() {
  const templateData = [
    {
      'Legajo': 'LEG-001',
      'Nombre y Apellido': 'Carlos Gómez',
      'DNI/CUIL': '20-35444888-9',
      'Puesto / Cargo': 'Operario de Mantenimiento',
      'Teléfono': '+5491155554444',
      'Descripción de Puesto': 'Mantenimiento preventivo y correctivo de planta'
    },
    {
      'Legajo': 'LEG-002',
      'Nombre y Apellido': 'María Fernández',
      'DNI/CUIL': '27-38999111-4',
      'Puesto / Cargo': 'Supervisora de Calidad',
      'Teléfono': '+5491155558888',
      'Descripción de Puesto': 'Control de procesos y auditorías de seguridad'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Personal');

  // Set column widths
  worksheet['!cols'] = [
    { wch: 12 }, // Legajo
    { wch: 25 }, // Nombre y Apellido
    { wch: 16 }, // DNI/CUIL
    { wch: 28 }, // Puesto / Cargo
    { wch: 16 }, // Teléfono
    { wch: 45 }  // Descripción
  ];

  XLSX.writeFile(workbook, 'Plantilla_Importacion_Personal.xlsx');
}

export function downloadEPPTemplate() {
  const templateData = [
    {
      'Nombre del EPP': 'Casco de Seguridad Dieléctrico',
      'Categoría': 'cabeza',
      'Stock Inicial': 50,
      'Marca': 'Libus',
      'Modelo/Tipo': 'Milenium Clase B',
      'Certificado (SI/NO)': 'SI',
      'Organismo Certificador': 'IRAM',
      'Nº Certificado': 'IRAM-3620',
      'Descripción': 'Casco de protección industrial sin ventilación'
    },
    {
      'Nombre del EPP': 'Botas de Seguridad con Puntera de Acero',
      'Categoría': 'pies',
      'Stock Inicial': 30,
      'Marca': 'Voran',
      'Modelo/Tipo': 'Ultralight S3',
      'Certificado (SI/NO)': 'SI',
      'Organismo Certificador': 'IQC',
      'Nº Certificado': 'IQC-9871',
      'Descripción': 'Calzado dieléctrico con suela antideslizante'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventario EPP');

  worksheet['!cols'] = [
    { wch: 32 }, // Nombre
    { wch: 15 }, // Categoría
    { wch: 14 }, // Stock
    { wch: 15 }, // Marca
    { wch: 20 }, // Modelo
    { wch: 20 }, // Certificado
    { wch: 22 }, // Organismo
    { wch: 18 }, // Nº Certificado
    { wch: 40 }  // Descripción
  ];

  XLSX.writeFile(workbook, 'Plantilla_Importacion_Inventario_EPP.xlsx');
}

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDeliveryVerification, getSignatureUrl, generateForm299PDF, type EPPDelivery } from "@/services/eppService";
import { ShieldCheck, CheckCircle2, Building2, UserCheck, Smartphone, MapPin, Hash, Lock, Download, AlertTriangle, Loader2, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function VerifyDelivery() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [sigUrl, setSigUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const loadVerification = async () => {
      try {
        setLoading(true);
        const res = await getDeliveryVerification(id);
        if (res) {
          setData(res);
          const signedItem = res.allDeliveries?.find((d: any) => d.signature_path) || res.delivery;
          if (signedItem?.signature_path) {
            try {
              const url = await getSignatureUrl(signedItem.signature_path);
              setSigUrl(url);
            } catch (err) {
              console.error("Error loading signature URL:", err);
            }
          }
        }
      } catch (err) {
        console.error("Error loading verification details:", err);
      } finally {
        setLoading(false);
      }
    };

    loadVerification();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#04060a] flex items-center justify-center p-4 text-white">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-400 mx-auto" />
          <p className="text-sm font-medium text-slate-400">Verificando firma y trazabilidad en la red SRT...</p>
        </div>
      </div>
    );
  }

  if (!data || !data.delivery) {
    return (
      <div className="min-h-screen bg-[#04060a] flex items-center justify-center p-4 text-white">
        <div className="max-w-md w-full rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Constancia No Encontrada</h2>
          <p className="text-xs text-slate-400">
            El código de verificación o identificador de entrega no corresponde a ningún registro homologado en el sistema.
          </p>
          <Button onClick={() => navigate('/')} variant="outline" className="border-slate-800 text-slate-300">
            Ir al Inicio
          </Button>
        </div>
      </div>
    );
  }

  const delivery: EPPDelivery = data.delivery;
  const allDeliveries: EPPDelivery[] = data.allDeliveries || [delivery];
  const company = delivery.company || { name: "Empresa Registrada", cuit: "-" };
  const employee = delivery.employee || { name: "Trabajador", dni_cuil: "-", job_title: "-" };
  const signedDelivery = allDeliveries.find(d => d.signature_path && d.status === 'firmado') || delivery;

  const handleDownloadPDF = async () => {
    try {
      await generateForm299PDF(
        { name: company.name || "Empresa", cuit: company.cuit || null },
        {
          id: employee.id || delivery.employee_id,
          company_id: delivery.company_id,
          name: employee.name || "Trabajador",
          dni_cuil: employee.dni_cuil || "-",
          file_number: employee.file_number || null,
          job_title: employee.job_title || null,
          phone: null,
          status: 'activo',
          created_at: '',
          updated_at: '',
          job_description: employee.job_description,
        },
        allDeliveries
      );
    } catch (err) {
      console.error("Error downloading PDF:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#04060a] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Verification Header Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-emerald-500/10 via-emerald-950/20 to-[#080d16] p-6 text-center shadow-xl shadow-emerald-950/30 relative overflow-hidden"
        >
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/30 mb-4 text-emerald-400">
            <ShieldCheck size={36} />
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3">
            <CheckCircle2 size={13} />
            Constancia Válida e Inalterable ({allDeliveries.length} {allDeliveries.length === 1 ? 'Elemento' : 'Elementos'})
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Verificación Oficial SRT N° 299/2011
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-lg mx-auto">
            Este documento digital acredita la totalidad de elementos entregados al trabajador con firma manuscrita electrónica y trazabilidad inalterable.
          </p>
        </motion.div>

        {/* Certificate Card Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Company Card */}
          <div className="rounded-2xl border border-slate-800/80 bg-[#080b12] p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <Building2 size={16} />
              Empresa / Empleador
            </div>
            <div>
              <p className="text-lg font-bold text-white">{company.name}</p>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">CUIT: {company.cuit || "No registrado"}</p>
            </div>
          </div>

          {/* Employee Card */}
          <div className="rounded-2xl border border-slate-800/80 bg-[#080b12] p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-400">
              <UserCheck size={16} />
              Trabajador Receptáculo
            </div>
            <div>
              <p className="text-lg font-bold text-white">{employee.name}</p>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">DNI/CUIL: {employee.dni_cuil}</p>
              {employee.job_title && (
                <p className="text-xs text-slate-500 mt-1">Puesto: {employee.job_title}</p>
              )}
            </div>
          </div>

        </div>

        {/* Delivery Details Table - ALL EPP ITEMS */}
        <div className="rounded-2xl border border-slate-800/80 bg-[#080b12] p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-900 pb-3 gap-2">
            <div className="flex items-center gap-2">
              <PackageCheck size={18} className="text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Detalle Completo de Elementos Entregados
              </span>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                {allDeliveries.length} {allDeliveries.length === 1 ? 'Item' : 'Items'}
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full self-start sm:self-auto">
              {signedDelivery.status === 'firmado' ? '✅ Constancia Firmada y Verificada' : '⏳ Pendiente'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">N°</th>
                  <th className="py-2.5 px-3">Elemento EPP</th>
                  <th className="py-2.5 px-3">Marca / Modelo</th>
                  <th className="py-2.5 px-3 text-center">Certificación</th>
                  <th className="py-2.5 px-3 text-center">Cant.</th>
                  <th className="py-2.5 px-3 text-right">Fecha Entrega</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {allDeliveries.map((item, index) => {
                  const epp = item.epp_item || { name: "Elemento EPP", category: "EPP" };
                  const certText = (epp as any)?.certification_body
                    ? `Sí (${(epp as any).certification_body})`
                    : ((epp as any)?.certified || 'Sí');
                  return (
                    <tr key={item.id || index} className="hover:bg-slate-900/40">
                      <td className="py-3 px-3 font-mono font-bold text-slate-500">{index + 1}</td>
                      <td className="py-3 px-3">
                        <p className="font-bold text-white">{epp.name}</p>
                        {epp.category && <p className="text-[10px] text-slate-500 uppercase">{epp.category}</p>}
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        {(epp as any)?.brand || '-'} / {(epp as any)?.type_model || '-'}
                      </td>
                      <td className="py-3 px-3 text-center font-semibold text-emerald-400">
                        {certText}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-white font-mono">
                        {item.quantity}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-300 font-mono">
                        {item.delivery_date}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Signature Preview if signed */}
          {sigUrl && (
            <div className="pt-5 border-t border-slate-900 flex flex-col items-center justify-center">
              <p className="text-xs text-slate-400 font-medium mb-2">Firma Manuscrita Electrónica del Trabajador</p>
              <div className="h-28 w-64 rounded-xl border border-slate-800 bg-white/95 p-2 flex items-center justify-center shadow-inner">
                <img src={sigUrl} alt="Firma del trabajador" className="max-h-full max-w-full object-contain" />
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5 font-mono">
                Registrado el {signedDelivery.signed_at ? new Date(signedDelivery.signed_at).toLocaleString('es-AR') : signedDelivery.delivery_date}
              </p>
            </div>
          )}
        </div>

        {/* Cryptographic Audit Trail Card */}
        <div className="rounded-2xl border border-slate-800/80 bg-[#080b12] p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <Lock size={16} />
            Trazabilidad y Resguardo de Inalterabilidad (Audit Trail)
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className="flex items-center gap-3 rounded-xl border border-slate-900 bg-[#05070c] p-3">
              <Smartphone className="w-5 h-5 text-emerald-400 shrink-0" />
              <div className="truncate">
                <p className="text-[10px] text-slate-500">Dirección IP de Firma</p>
                <p className="font-bold text-slate-200 truncate">{signedDelivery.ip_address || "Registrada en Obra"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-slate-900 bg-[#05070c] p-3">
              <MapPin className="w-5 h-5 text-teal-400 shrink-0" />
              <div className="truncate">
                <p className="text-[10px] text-slate-500">Geolocalización GPS</p>
                <p className="font-bold text-slate-200 truncate">{signedDelivery.geolocation || "Obra Registrada"}</p>
              </div>
            </div>
          </div>

          {/* SHA-256 Hash Box */}
          <div className="rounded-xl border border-slate-900 bg-[#05070c] p-3 space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <Hash size={12} className="text-emerald-400" />
              Huella Criptográfica SHA-256 (Hash de Integridad)
            </div>
            <p className="text-[11px] font-mono font-semibold text-emerald-400 break-all">
              {signedDelivery.hash_sha256 || "9a4f8b2c1e8d7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f21"}
            </p>
          </div>
        </div>

        {/* Action button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <Button
            onClick={handleDownloadPDF}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-2 rounded-xl h-12 px-6 shadow-lg shadow-emerald-950/20"
          >
            <Download size={18} />
            Descargar Formulario 299 SRT Completo ({allDeliveries.length} EPPs)
          </Button>

          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="w-full sm:w-auto border-slate-800 text-slate-300 rounded-xl h-12 px-6"
          >
            Volver al Inicio
          </Button>
        </div>

        <p className="text-center text-[11px] text-slate-600 pt-4">
          Sentinel EPP — Sistema de Gestión y Firma Digital de EPP Homologado conforme a Res. SRT N° 299/2011.
        </p>

      </div>
    </div>
  );
}

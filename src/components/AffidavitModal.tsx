import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Scale, CheckCircle2, AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface AffidavitModalProps {
  open: boolean;
  employeeName: string;
  onAccept: () => void;
  onCancel: () => void;
}

export function AffidavitModal({
  open,
  employeeName,
  onAccept,
  onCancel,
}: AffidavitModalProps) {
  const { language } = useLanguage();
  const [isChecked, setIsChecked] = useState(false);

  const handleAccept = () => {
    setIsChecked(false);
    onAccept();
  };

  const handleCancel = () => {
    setIsChecked(false);
    onCancel();
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleCancel()}>
      <DialogContent className="sm:max-w-lg rounded-2xl bg-white dark:bg-[#0c101d] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>
            {language === "en" ? "Sworn Statement & Legal Validity" : "Declaración Jurada y Validez Legal"}
          </DialogTitle>
          <DialogDescription>
            {language === "en" ? "First signature legal notification for worker" : "Notificación de validez jurídica para primera firma de operario"}
          </DialogDescription>
        </DialogHeader>

        {/* Top Banner Accent */}
        <div className="bg-amber-500/10 dark:bg-amber-500/15 border-b border-amber-500/20 px-6 py-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest block">
              {language === "en" ? "First Signature Notice" : "Notificación de Primera Firma"}
            </span>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
              {language === "en"
                ? "Sworn Statement & Legal Validity"
                : "Declaración Jurada y Validez Legal"}
            </h3>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-900">
            <AlertCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {language === "en" ? (
                <>
                  This is the <span className="text-emerald-600 dark:text-emerald-400 font-bold">first time</span> worker{" "}
                  <strong className="text-slate-900 dark:text-white font-bold">{employeeName}</strong> will render a signature in the system.
                </>
              ) : (
                <>
                  Esta es la <span className="text-emerald-600 dark:text-emerald-400 font-bold">primera vez</span> que el operario{" "}
                  <strong className="text-slate-900 dark:text-white font-bold">{employeeName}</strong> registrará su firma digital.
                </>
              )}
            </p>
          </div>

          <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
            <p>
              {language === "en"
                ? "Please be informed that the touch signature captured on this device constitutes a formal Sworn Affidavit of Personal Protective Equipment (PPE) receipt."
                : "Se le notifica formalmente que la firma táctil a realizar a continuación constituye una Declaración Jurada formal de Recepción de Equipos de Protección Personal (EPP)."}
            </p>

            <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-900/30 text-amber-900 dark:text-amber-300 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400 text-xs">
                <ShieldAlert className="w-4 h-4" />
                <span>{language === "en" ? "Legal Binding & Audit Trail" : "Trazabilidad Jurídica en Auditorías y Siniestros"}</span>
              </div>
              <p className="text-[11px] text-amber-800 dark:text-slate-300">
                {language === "en"
                  ? "Pursuant to SRT Resolution No. 299/2011 and the Civil and Commercial Code, this signature has full evidentiary validity and will be submitted during Labor Ministry inspections, ART insurance audits, and workplace accident files."
                  : "Conforme a la Resolución SRT N° 299/2011 y al Código Civil y Comercial de la Nación, este registro posee plena validez probatoria y será presentado ante inspecciones del Ministerio de Trabajo, auditorías de ART y en expedientes por accidentes laborales."}
              </p>
            </div>
          </div>

          {/* Explicit Confirmation Checkbox */}
          <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070b14] cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug">
              {language === "en"
                ? "I have notified the worker that this signature has legal validity and constitutes a Sworn Affidavit."
                : "Confirmo que he notificado al trabajador que esta firma tiene validez legal y carácter de Declaración Jurada."}
            </span>
          </label>
        </div>

        <DialogFooter className="px-6 py-4 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-900 gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="rounded-xl border-slate-200 dark:border-slate-800 dark:text-slate-300"
          >
            {language === "en" ? "Cancel" : "Cancelar"}
          </Button>
          <Button
            type="button"
            disabled={!isChecked}
            onClick={handleAccept}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl border-0 font-bold gap-1.5 shadow-sm"
          >
            <CheckCircle2 size={16} />
            {language === "en" ? "Understand & Proceed to Sign" : "Entendido y Continuar a la Firma"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

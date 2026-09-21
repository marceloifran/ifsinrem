import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Transfer, TransferStatus } from "@/types/inventory";
import { 
  TRANSFER_STATUS_CONFIG, 
  generateTransferQR 
} from "@/services/transferService";
import { 
  Truck, 
  MapPin, 
  QrCode, 
  Boxes, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Share2, 
  ExternalLink, 
  ArrowRight,
  UserCheck,
  Calendar
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface TransferDetailDialogProps {
  transfer: Transfer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh?: () => void;
}

export function TransferDetailDialog({
  transfer,
  open,
  onOpenChange,
}: TransferDetailDialogProps) {
  const navigate = useNavigate();
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    if (transfer?.tracking_code) {
      generateTransferQR(transfer.tracking_code).then(setQrDataUrl);
    }
  }, [transfer?.tracking_code]);

  if (!transfer) return null;

  const statusCfg = TRANSFER_STATUS_CONFIG[transfer.status] || TRANSFER_STATUS_CONFIG.borrador;
  const receptionUrl = `${window.location.origin}/recepcion/${transfer.tracking_code}`;

  const handleCopyReceptionLink = () => {
    navigator.clipboard.writeText(receptionUrl);
    toast.success("Enlace de recepción copiado al portapapeles.");
  };

  const handleShareWhatsApp = () => {
    const text = encodeURI(
      `📦 *Transferencia IfsinRem:* ${transfer.tracking_code}\n` +
      `De: ${transfer.origin_location_name}\n` +
      `Hacia: ${transfer.destination_location_name}\n` +
      `Estado: ${statusCfg.label}\n\n` +
      `👉 Abrir remito y recibir mercadería desde el móvil:\n${receptionUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-3 pr-6">
            <div>
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider block">
                Comprobante de Movimiento
              </span>
              <DialogTitle className="text-xl font-bold flex items-center gap-2 mt-0.5">
                <Truck className="w-5 h-5 text-purple-400" />
                {transfer.tracking_code}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Detalle completo, remito y código QR de seguimiento de la transferencia.
              </DialogDescription>
            </div>

            <span className={`text-xs px-3 py-1 rounded-full font-semibold border ${statusCfg.badgeColor}`}>
              {statusCfg.label}
            </span>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Timeline Visual */}
          <div className="bg-background/60 border border-border p-4 rounded-xl">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-3 font-medium">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-400" /> Creada
              </span>
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-purple-400" /> En Tránsito
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Recibida
              </span>
            </div>

            {/* Stepper Line */}
            <div className="relative flex items-center justify-between">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-border rounded-full" />
              <div
                className={`absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 rounded-full transition-all duration-500`}
                style={{
                  width:
                    transfer.status === "borrador"
                      ? "0%"
                      : transfer.status === "preparada"
                      ? "25%"
                      : transfer.status === "en_transito" || transfer.status === "despachada"
                      ? "65%"
                      : "100%",
                }}
              />

              {/* Step 1 */}
              <div className="relative z-10 w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-md">
                1
              </div>

              {/* Step 2 */}
              <div
                className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-md transition-colors ${
                  transfer.status === "en_transito" || transfer.status === "despachada" || transfer.status.startsWith("recibida")
                    ? "bg-purple-600 text-white"
                    : "bg-muted text-muted-foreground border border-border"
                }`}
              >
                2
              </div>

              {/* Step 3 */}
              <div
                className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-md transition-colors ${
                  transfer.status.startsWith("recibida")
                    ? transfer.status === "recibida_con_diferencias"
                      ? "bg-rose-600 text-white"
                      : "bg-emerald-600 text-white"
                    : "bg-muted text-muted-foreground border border-border"
                }`}
              >
                3
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-2">
              <span>{new Date(transfer.created_at).toLocaleDateString()}</span>
              <span>{transfer.dispatched_at ? new Date(transfer.dispatched_at).toLocaleDateString() : "Pendiente"}</span>
              <span>{transfer.received_at ? new Date(transfer.received_at).toLocaleDateString() : "En espera"}</span>
            </div>
          </div>

          {/* Route Overview: Origin -> Destination */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-card border border-border p-3.5 rounded-xl">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                Origen (Despacho)
              </span>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span className="font-semibold text-foreground text-sm">{transfer.origin_location_name}</span>
              </div>
              {transfer.sender_user_name && (
                <span className="text-xs text-muted-foreground block mt-1">
                  Despachado por: <strong>{transfer.sender_user_name}</strong>
                </span>
              )}
            </div>

            <div className="bg-card border border-border p-3.5 rounded-xl">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                Destino (Recepción)
              </span>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="font-semibold text-foreground text-sm">{transfer.destination_location_name}</span>
              </div>
              {transfer.receiver_user_name ? (
                <span className="text-xs text-muted-foreground block mt-1">
                  Recibido por: <strong>{transfer.receiver_user_name}</strong>
                </span>
              ) : (
                <span className="text-xs text-amber-400/90 block mt-1 italic">
                  Pendiente de recepción física en destino
                </span>
              )}
            </div>
          </div>

          {/* Transport & Notes */}
          {(transfer.transport_carrier || transfer.transport_vehicle_plate || transfer.remito_number || transfer.notes) && (
            <div className="bg-background/40 border border-border/80 p-3 rounded-xl text-xs space-y-1 text-muted-foreground">
              {transfer.remito_number && (
                <div>Remito Físico: <strong className="text-foreground">{transfer.remito_number}</strong></div>
              )}
              {transfer.transport_carrier && (
                <div>Transportista: <strong className="text-foreground">{transfer.transport_carrier}</strong> {transfer.transport_vehicle_plate ? `(${transfer.transport_vehicle_plate})` : ''}</div>
              )}
              {transfer.notes && (
                <div className="italic text-foreground/80 mt-1">"{transfer.notes}"</div>
              )}
            </div>
          )}

          {/* Items Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Boxes className="w-4 h-4 text-emerald-400" />
              Detalle de Ítems ({transfer.items?.length || 0})
            </h4>

            <div className="border border-border rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 text-muted-foreground border-b border-border">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Producto / Material</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Despachado</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Recibido</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {transfer.items?.map((item) => {
                    const isMismatch = item.received_qty !== undefined && item.received_qty !== null && item.received_qty !== item.dispatched_qty;
                    return (
                      <tr key={item.id} className="hover:bg-accent/30">
                        <td className="py-2.5 px-3">
                          <div className="font-medium text-foreground">{item.item_name}</div>
                          <div className="text-[10px] text-muted-foreground uppercase">{item.item_type} · {item.unit}</div>
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-foreground">
                          {item.dispatched_qty}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold">
                          {item.received_qty !== null && item.received_qty !== undefined ? (
                            <span className={isMismatch ? "text-rose-400" : "text-emerald-400"}>
                              {item.received_qty}
                            </span>
                          ) : (
                            <span className="text-muted-foreground italic">-</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {item.status === "ok" ? (
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">
                              Conforme
                            </span>
                          ) : item.status === "faltante" ? (
                            <span className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full font-semibold">
                              Faltante
                            </span>
                          ) : (
                            <span className="text-[10px] bg-slate-500/10 text-slate-400 px-2 py-0.5 rounded-full">
                              En Tránsito
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Exceptions Alert / Details */}
          {transfer.exceptions && transfer.exceptions.length > 0 && (
            <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
                <AlertTriangle className="w-4 h-4" />
                Incidencias / Discrepancias Declaradas en Recepción
              </div>
              <div className="space-y-2">
                {transfer.exceptions.map((ex) => (
                  <div key={ex.id} className="bg-background/80 p-2.5 rounded-lg border border-rose-500/20 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground uppercase">{ex.exception_type}</span>
                      <span className="text-rose-400 font-bold">
                        Esperado: {ex.declared_qty} | Físico: {ex.actual_qty} ({ex.difference > 0 ? `+${ex.difference}` : ex.difference})
                      </span>
                    </div>
                    {ex.notes && <p className="text-muted-foreground mt-1">{ex.notes}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* QR Code & Mobile Reception Direct Trigger */}
          <div className="bg-card border border-border p-4 rounded-xl flex flex-col sm:flex-row items-center gap-4">
            {qrDataUrl && (
              <div className="bg-white p-2 rounded-xl shadow-md border flex-shrink-0">
                <img src={qrDataUrl} alt="QR Recepción" className="w-24 h-24" />
              </div>
            )}
            <div className="flex-1 text-center sm:text-left space-y-1">
              <h5 className="font-semibold text-sm text-foreground flex items-center justify-center sm:justify-start gap-1.5">
                <QrCode className="w-4 h-4 text-emerald-400" />
                Escaneo y Recepción Mobile-First
              </h5>
              <p className="text-xs text-muted-foreground">
                Escanea este código desde cualquier celular o comparte el enlace para recibir y registrar discrepancias sin usar PC.
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyReceptionLink}
                  className="h-8 text-xs gap-1 border-border"
                >
                  <Share2 className="w-3.5 h-3.5" /> Copiar Enlace
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleShareWhatsApp}
                  className="h-8 text-xs gap-1 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                >
                  WhatsApp
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    onOpenChange(false);
                    navigate(`/recepcion/${transfer.tracking_code}`);
                  }}
                  className="h-8 text-xs gap-1 bg-purple-600 hover:bg-purple-500 text-white font-medium"
                >
                  Abrir Recepción <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

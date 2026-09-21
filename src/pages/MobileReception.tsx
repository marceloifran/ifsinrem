import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Transfer, 
  TransferItem, 
  ExceptionType, 
  TransferStatus 
} from "@/types/inventory";
import { 
  getTransferByTrackingCode, 
  processTransferReception, 
  TRANSFER_STATUS_CONFIG,
  getTransfers
} from "@/services/transferService";
import { QRCameraScanner } from "@/components/QRCameraScanner";
import { 
  Truck, 
  QrCode, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowLeft, 
  MapPin, 
  Boxes, 
  Camera, 
  Check, 
  Minus, 
  Plus, 
  Search, 
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

export default function MobileReception() {
  const { trackingCode: paramCode } = useParams<{ trackingCode?: string }>();
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const companyId = profile?.company_id;

  const [inputCode, setInputCode] = useState(paramCode || "");
  const [transfer, setTransfer] = useState<Transfer | null>(null);
  const [pendingTransfers, setPendingTransfers] = useState<Transfer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Reception state
  const [receivedQuantities, setReceivedQuantities] = useState<Record<string, number>>({});
  const [exceptions, setExceptions] = useState<
    Array<{
      itemId: string;
      exceptionType: ExceptionType;
      declaredQty: number;
      actualQty: number;
      photoUrl?: string;
      notes?: string;
    }>
  >([]);

  // Incident Modal
  const [selectedIncidentItem, setSelectedIncidentItem] = useState<TransferItem | null>(null);
  const [incidentType, setIncidentType] = useState<ExceptionType>("faltante");
  const [incidentActualQty, setIncidentActualQty] = useState<number>(0);
  const [incidentNotes, setIncidentNotes] = useState("");
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receptionComplete, setReceptionComplete] = useState(false);

  // Load transfer by code
  const searchTransfer = async (codeToSearch: string) => {
    if (!codeToSearch.trim()) {
      toast.error("Ingresa un código de transferencia.");
      return;
    }

    setIsSearching(true);
    try {
      const data = await getTransferByTrackingCode(codeToSearch.trim());
      if (!data) {
        toast.error(`No se encontró la transferencia "${codeToSearch}".`);
        setTransfer(null);
      } else {
        setTransfer(data);
        // Inicializar cantidades recibidas con las despachadas por defecto
        const initialQty: Record<string, number> = {};
        data.items?.forEach((it) => {
          initialQty[it.item_id] = it.dispatched_qty;
        });
        setReceivedQuantities(initialQty);
        setExceptions([]);
        setReceptionComplete(data.status === "recibida" || data.status === "recibida_con_diferencias");
      }
    } catch (err: any) {
      console.error("Error al buscar transferencia:", err);
      toast.error("Error al buscar la transferencia.");
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (paramCode) {
      searchTransfer(paramCode);
    } else if (companyId) {
      // Cargar lista de transferencias pendientes de recibir
      getTransfers(companyId, "en_transito").then(setPendingTransfers);
    }
  }, [paramCode, companyId]);

  const handleQtyChange = (itemId: string, delta: number, maxQty: number) => {
    setReceivedQuantities((prev) => {
      const current = prev[itemId] ?? maxQty;
      const next = Math.max(0, current + delta);
      return { ...prev, [itemId]: next };
    });
  };

  const handleSetAllConform = () => {
    if (!transfer?.items) return;
    const allOk: Record<string, number> = {};
    transfer.items.forEach((it) => {
      allOk[it.item_id] = it.dispatched_qty;
    });
    setReceivedQuantities(allOk);
    setExceptions([]);
    toast.success("Todas las cantidades ajustadas al 100% de lo despachado.");
  };

  const openIncidentModal = (item: TransferItem) => {
    setSelectedIncidentItem(item);
    setIncidentActualQty(receivedQuantities[item.item_id] ?? item.dispatched_qty);
    setIncidentType(
      (receivedQuantities[item.item_id] ?? item.dispatched_qty) < item.dispatched_qty
        ? "faltante"
        : (receivedQuantities[item.item_id] ?? item.dispatched_qty) > item.dispatched_qty
        ? "sobrante"
        : "dano"
    );
    setIncidentNotes("");
    setIsIncidentModalOpen(true);
  };

  const handleSaveIncident = () => {
    if (!selectedIncidentItem) return;

    // Actualizar cantidad en estado principal
    setReceivedQuantities((prev) => ({
      ...prev,
      [selectedIncidentItem.item_id]: incidentActualQty,
    }));

    // Agregar o actualizar en la lista de excepciones
    setExceptions((prev) => {
      const filtered = prev.filter((e) => e.itemId !== selectedIncidentItem.item_id);
      return [
        ...filtered,
        {
          itemId: selectedIncidentItem.item_id,
          exceptionType: incidentType,
          declaredQty: selectedIncidentItem.dispatched_qty,
          actualQty: incidentActualQty,
          notes: incidentNotes.trim() || undefined,
        },
      ];
    });

    toast.info(`Incidencia registrada para "${selectedIncidentItem.item_name}".`);
    setIsIncidentModalOpen(false);
  };

  const handleConfirmReception = async () => {
    if (!transfer) return;

    const receivedItemsPayload = (transfer.items || []).map((it) => {
      const recQty = receivedQuantities[it.item_id] ?? it.dispatched_qty;
      return {
        itemId: it.item_id,
        dispatchedQty: it.dispatched_qty,
        receivedQty: recQty,
        differenceNotes: recQty !== it.dispatched_qty ? `Declarado en mano: ${recQty} de ${it.dispatched_qty}` : undefined,
      };
    });

    // Detectar automáticamente diferencias si el usuario modificó cantidades sin abrir el modal de incidencias
    const autoExceptions = [...exceptions];
    receivedItemsPayload.forEach((it) => {
      if (it.receivedQty !== it.dispatchedQty && !autoExceptions.some((e) => e.itemId === it.itemId)) {
        autoExceptions.push({
          itemId: it.itemId,
          exceptionType: it.receivedQty < it.dispatchedQty ? "faltante" : "sobrante",
          declaredQty: it.dispatchedQty,
          actualQty: it.receivedQty,
          notes: "Discrepancia detectada en conteo rápido de recepción.",
        });
      }
    });

    setIsSubmitting(true);
    try {
      const result = await processTransferReception({
        transferId: transfer.id,
        trackingCode: transfer.tracking_code,
        companyId: transfer.company_id,
        destinationLocationId: transfer.destination_location_id,
        receiverUserId: user?.id,
        receivedItems: receivedItemsPayload,
        exceptions: autoExceptions,
      });

      setReceptionComplete(true);
      if (result.hasExceptions) {
        toast.warning("Transferencia recibida CON DIFERENCIAS. Se notificó al supervisor.");
      } else {
        toast.success("¡Recepción confirmada al 100%! El stock físico ha sido acreditado.");
      }
    } catch (err: any) {
      console.error("Error al procesar recepción:", err);
      toast.error(err.message || "Error al registrar la recepción.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* Mobile Top App Bar */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/transferencias")}
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <QrCode className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <span className="font-bold text-sm tracking-tight">Recepción Mobile</span>
          </div>
        </div>

        <span className="text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
          Campo & Pañol
        </span>
      </header>

      <main className="container max-w-xl mx-auto px-4 pt-4 space-y-4">
        {/* Search / Scan Box */}
        <div className="bg-card border border-border p-4 rounded-2xl shadow-sm space-y-3">
          <Button
            type="button"
            onClick={() => setIsScannerOpen(true)}
            className="w-full h-12 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01]"
          >
            <Camera className="w-5 h-5 animate-pulse" />
            Escanear Remito con Cámara QR
          </Button>

          <div className="relative flex items-center justify-center pt-1">
            <div className="w-full border-t border-border" />
            <span className="absolute bg-card px-2.5 text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
              O ingresar código manual
            </span>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              searchTransfer(inputCode);
            }}
            className="flex items-center gap-2 pt-1"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Ej: TRF-20260921-1234..."
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                className="pl-9 font-mono uppercase bg-background text-xs sm:text-sm h-10 rounded-xl"
              />
            </div>
            <Button
              type="submit"
              disabled={isSearching}
              className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-4 h-10 rounded-xl"
            >
              {isSearching ? "Buscando..." : "Buscar"}
            </Button>
          </form>
        </div>

        {/* Transfer Header Card (If Loaded) */}
        {transfer ? (
          <div className="space-y-4">
            {/* Route & Status Banner */}
            <div className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono text-muted-foreground">Transferencia</span>
                  <h2 className="text-base font-bold font-mono text-foreground flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-purple-400" /> {transfer.tracking_code}
                  </h2>
                </div>

                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                    receptionComplete
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-purple-500/10 text-purple-400 border-purple-500/20"
                  }`}
                >
                  {receptionComplete ? "Recibida" : "En Tránsito"}
                </span>
              </div>

              {/* Route */}
              <div className="bg-background/60 p-3 rounded-xl border border-border/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block">Desde</span>
                  <div className="font-semibold text-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-purple-400" /> {transfer.origin_location_name}
                  </div>
                </div>
                <div className="h-6 w-px bg-border mx-2" />
                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground uppercase block">Hacia (Tu Sede)</span>
                  <div className="font-semibold text-emerald-400 flex items-center justify-end gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" /> {transfer.destination_location_name}
                  </div>
                </div>
              </div>

              {transfer.transport_carrier && (
                <div className="text-xs text-muted-foreground flex items-center justify-between">
                  <span>Transportista: <strong>{transfer.transport_carrier}</strong></span>
                  {transfer.transport_vehicle_plate && <span>Patente: <strong>{transfer.transport_vehicle_plate}</strong></span>}
                </div>
              )}
            </div>

            {/* Completion Success View */}
            {receptionComplete ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-foreground">
                  Recepción Registrada Exitosamente
                </h3>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  El stock físico ha sido acreditado en <strong>{transfer.destination_location_name}</strong> y se actualizó la trazabilidad inmutable.
                </p>
                <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setTransfer(null);
                      setInputCode("");
                      setReceptionComplete(false);
                    }}
                    className="text-xs border-border"
                  >
                    Recibir Otra Transferencia
                  </Button>
                  <Button
                    onClick={() => navigate("/transferencias")}
                    className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white"
                  >
                    Ver en Panel de Transferencias
                  </Button>
                </div>
              </div>
            ) : (
              /* Active Reception Checklist */
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Boxes className="w-4 h-4 text-emerald-400" /> Conteo Físico ({transfer.items?.length || 0} ítems)
                  </span>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleSetAllConform}
                    className="h-7 text-xs text-emerald-400 hover:text-emerald-300 gap-1 px-2"
                  >
                    <Check className="w-3.5 h-3.5" /> Recibir Todo OK
                  </Button>
                </div>

                {/* Items List for Mobile Counting */}
                <div className="space-y-2.5">
                  {transfer.items?.map((item) => {
                    const currentReceived = receivedQuantities[item.item_id] ?? item.dispatched_qty;
                    const isMismatch = currentReceived !== item.dispatched_qty;
                    const hasExceptionLogged = exceptions.some((e) => e.itemId === item.item_id);

                    return (
                      <div
                        key={item.id}
                        className={`bg-card border rounded-2xl p-4 shadow-sm transition-all ${
                          isMismatch ? "border-rose-500/40 bg-rose-500/5" : "border-border"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div>
                            <h4 className="font-semibold text-sm text-foreground">{item.item_name}</h4>
                            <span className="text-[11px] text-muted-foreground uppercase">
                              Tipo: {item.item_type} · Unidad: {item.unit}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] text-muted-foreground uppercase block">Despachado</span>
                            <span className="text-sm font-bold font-mono text-purple-400">
                              {item.dispatched_qty} {item.unit}
                            </span>
                          </div>
                        </div>

                        {/* Physical Counter Bar */}
                        <div className="flex items-center justify-between pt-2 border-t border-border/80">
                          <div className="flex items-center gap-1.5">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => handleQtyChange(item.item_id, -1, item.dispatched_qty)}
                              className="h-8 w-8 rounded-xl bg-background"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </Button>

                            <Input
                              type="number"
                              min="0"
                              value={currentReceived}
                              onChange={(e) => {
                                const val = Math.max(0, parseInt(e.target.value) || 0);
                                setReceivedQuantities((prev) => ({ ...prev, [item.item_id]: val }));
                              }}
                              className="w-16 h-8 text-center font-bold text-sm bg-background"
                            />

                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => handleQtyChange(item.item_id, 1, item.dispatched_qty)}
                              className="h-8 w-8 rounded-xl bg-background"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </Button>
                          </div>

                          <Button
                            type="button"
                            variant={isMismatch ? "destructive" : "ghost"}
                            size="sm"
                            onClick={() => openIncidentModal(item)}
                            className={`h-8 text-xs gap-1 ${
                              !isMismatch ? "text-muted-foreground hover:text-rose-400" : ""
                            }`}
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {hasExceptionLogged ? "Editar Discrepancia" : isMismatch ? "Reportar Diferencia" : "Incidencia"}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Confirm Reception CTA */}
                <div className="pt-4">
                  <Button
                    onClick={handleConfirmReception}
                    disabled={isSubmitting}
                    className="w-full h-12 text-base font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg rounded-xl gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    {isSubmitting
                      ? "Procesando recepción..."
                      : exceptions.length > 0 || Object.values(receivedQuantities).some((qty, idx) => qty !== transfer.items?.[idx]?.dispatched_qty)
                      ? "Confirmar Recepción con Diferencias"
                      : "Confirmar Recepción Conforme (100% OK)"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Empty Search State / Pending Transfers List */
          <div className="space-y-4 pt-2">
            <div className="bg-card border border-border rounded-2xl p-6 text-center space-y-2">
              <QrCode className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="font-bold text-base">Escanear o Ingresar Remito</h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Apunta con la cámara de tu teléfono al código QR del remito físico o ingresa el código TRF arriba.
              </p>
            </div>

            {pendingTransfers.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1 block">
                  Transferencias en Tránsito Pendientes ({pendingTransfers.length})
                </span>

                <div className="space-y-2">
                  {pendingTransfers.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => {
                        setInputCode(t.tracking_code);
                        searchTransfer(t.tracking_code);
                      }}
                      className="bg-card border border-border rounded-xl p-3.5 shadow-sm hover:border-emerald-500/40 cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <span className="font-mono font-bold text-xs text-foreground block">{t.tracking_code}</span>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          {t.origin_location_name} $\rightarrow$ <strong className="text-emerald-400">{t.destination_location_name}</strong>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" className="text-xs text-emerald-400">
                        Recibir $\rightarrow$
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Incident / Discrepancy Modal */}
      <Dialog open={isIncidentModalOpen} onOpenChange={setIsIncidentModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
              Reportar Discrepancia o Daño
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Indica las novedades u observaciones detectadas durante la recepción en campo.
            </DialogDescription>
          </DialogHeader>

          {selectedIncidentItem && (
            <div className="space-y-4 py-2">
              <div className="bg-background/80 p-3 rounded-xl border border-border text-xs">
                <span className="text-muted-foreground block">Producto:</span>
                <strong className="text-foreground text-sm">{selectedIncidentItem.item_name}</strong>
                <div className="mt-1 text-muted-foreground">
                  Cantidad declarada en remito: <strong>{selectedIncidentItem.dispatched_qty} {selectedIncidentItem.unit}</strong>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="inc-type" className="text-xs font-semibold">Tipo de Incidencia *</Label>
                <Select value={incidentType} onValueChange={(v: ExceptionType) => setIncidentType(v)}>
                  <SelectTrigger id="inc-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="faltante">Faltante de mercadería (Llegó menos)</SelectItem>
                    <SelectItem value="sobrante">Sobrante de mercadería (Llegó de más)</SelectItem>
                    <SelectItem value="dano">Material dañado / roto durante el transporte</SelectItem>
                    <SelectItem value="producto_incorrecto">Producto incorrecto / no corresponde al remito</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="inc-qty" className="text-xs font-semibold">Cantidad Real Recibida en Mano *</Label>
                <Input
                  id="inc-qty"
                  type="number"
                  min="0"
                  value={incidentActualQty}
                  onChange={(e) => setIncidentActualQty(Math.max(0, parseInt(e.target.value) || 0))}
                  className="font-bold text-center"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="inc-notes" className="text-xs font-semibold">Observación / Detalle de la Discrepancia</Label>
                <Textarea
                  id="inc-notes"
                  placeholder="Ej: La caja vino abierta y faltan 2 pares de botas..."
                  value={incidentNotes}
                  onChange={(e) => setIncidentNotes(e.target.value)}
                  rows={3}
                  className="text-xs"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsIncidentModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={handleSaveIncident}
                  className="bg-rose-600 hover:bg-rose-500 text-white font-semibold"
                >
                  Guardar Incidencia
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Real-time Camera QR Scanner Dialog */}
      <QRCameraScanner
        open={isScannerOpen}
        onOpenChange={setIsScannerOpen}
        onScanSuccess={(scannedCode) => {
          setInputCode(scannedCode);
          toast.success(`Código escaneado: ${scannedCode}`);
          searchTransfer(scannedCode);
        }}
      />
    </div>
  );
}

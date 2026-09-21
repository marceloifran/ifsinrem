import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Users,
  Boxes,
  Truck,
  Building2,
  AlertTriangle,
  Plus,
  QrCode,
  FileSignature,
  CheckCircle2,
  TrendingUp,
  Eye,
  Loader2,
  Calendar,
  ArrowRight,
  MapPin,
  History,
  ShieldCheck,
  PackageCheck,
  SlidersHorizontal,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQueryClient } from "@tanstack/react-query";
import { useEmployees, useEPPItems, useEPPDeliveries, eppKeys } from "@/hooks/useEPPData";
import {
  addEPPDelivery,
  signEPPDelivery,
  getSignatureUrl,
  checkWorkerHasSignedBefore,
  type Employee,
  type EPPItem,
  type EPPDelivery,
} from "@/services/eppService";
import { getLocations } from "@/services/locationService";
import { getLocationStock, getMovementsLog } from "@/services/inventoryService";
import { getTransfers, getActiveExceptions } from "@/services/transferService";
import { 
  Location, 
  LocationStock, 
  Transfer, 
  TransferException, 
  MovementLog 
} from "@/types/inventory";
import { NewTransferDialog } from "@/components/transfers/NewTransferDialog";
import { TransferDetailDialog } from "@/components/transfers/TransferDetailDialog";
import { SignaturePad } from "@/components/SignaturePad";
import { AffidavitModal } from "@/components/AffidavitModal";
import { AIAssistantButton } from "@/components/ai/AIAssistantButton";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, profile, isAdmin, signOut, isLoading: authLoading } = useAuth();
  const { t, language } = useLanguage();
  const companyId = profile?.company_id;

  // React Query queries (EPP Module)
  const { data: employees = [], isLoading: loadingEmployees } = useEmployees(companyId);
  const { data: eppItems = [], isLoading: loadingItems } = useEPPItems(companyId);
  const { data: deliveries = [], isLoading: loadingDeliveries } = useEPPDeliveries(companyId);

  // Operational State (Multi-location, Transfers, Movements)
  const [locations, setLocations] = useState<Location[]>([]);
  const [locationStock, setLocationStock] = useState<LocationStock[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [exceptions, setExceptions] = useState<TransferException[]>([]);
  const [movements, setMovements] = useState<MovementLog[]>([]);
  const [isLoadingOperational, setIsLoadingOperational] = useState(false);

  // Transfer Modals
  const [isNewTransferOpen, setIsNewTransferOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // EPP Delivery Dialog states
  const [showDeliveryDialog, setShowDeliveryDialog] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [selectedEppId, setSelectedEppId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  // Signature states
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [deliveryToSign, setDeliveryToSign] = useState<EPPDelivery | null>(null);
  const [showAffidavitDialog, setShowAffidavitDialog] = useState(false);
  const [pendingDeliveryToSign, setPendingDeliveryToSign] = useState<EPPDelivery | null>(null);
  const [savingDelivery, setSavingDelivery] = useState(false);

  // Signature preview
  const [viewSignatureUrl, setViewSignatureUrl] = useState<string | null>(null);
  const [loadingSigId, setLoadingSigId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const loadOperationalData = async () => {
    if (!companyId) return;
    setIsLoadingOperational(true);
    try {
      const [locs, stockList, trfs, exList, movs] = await Promise.all([
        getLocations(companyId),
        getLocationStock(companyId),
        getTransfers(companyId),
        getActiveExceptions(companyId),
        getMovementsLog(companyId, 6),
      ]);
      setLocations(locs);
      setLocationStock(stockList);
      setTransfers(trfs);
      setExceptions(exList);
      setMovements(movs);
    } catch (err) {
      console.error("Error al cargar datos operacionales:", err);
    } finally {
      setIsLoadingOperational(false);
    }
  };

  useEffect(() => {
    loadOperationalData();
  }, [companyId]);

  const handleViewSignature = async (del: EPPDelivery) => {
    if (!del.signature_path) return;
    try {
      setLoadingSigId(del.id);
      const url = await getSignatureUrl(del.signature_path);
      setViewSignatureUrl(url);
    } catch (err) {
      toast.error("Error al cargar la firma");
    } finally {
      setLoadingSigId(null);
    }
  };

  // EPP Delivery Creation
  const handleCreateDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || !selectedEmployeeId || !selectedEppId) {
      toast.error("Selecciona un operario y un ítem de EPP.");
      return;
    }

    setSavingDelivery(true);
    try {
      await addEPPDelivery(companyId, {
        employee_id: selectedEmployeeId,
        epp_item_id: selectedEppId,
        delivery_date: new Date().toISOString().split("T")[0],
        quantity,
        supervisor_id: user?.id,
        notes: notes.trim() || undefined,
        status: "pendiente",
      });
      toast.success("Entrega de EPP registrada. Requiere firma del operario.");
      setShowDeliveryDialog(false);
      setSelectedEmployeeId("");
      setSelectedEppId("");
      setQuantity(1);
      setNotes("");
      await queryClient.invalidateQueries({ queryKey: eppKeys.all });
      loadOperationalData();
    } catch (err: any) {
      console.error("Error al registrar entrega EPP:", err);
      toast.error(err.message || "Error al crear la entrega.");
    } finally {
      setSavingDelivery(false);
    }
  };

  const handleSignClick = async (del: EPPDelivery) => {
    const hasSignedBefore = await checkWorkerHasSignedBefore(del.employee_id);
    if (!hasSignedBefore) {
      setPendingDeliveryToSign(del);
      setShowAffidavitDialog(true);
    } else {
      setDeliveryToSign(del);
      setShowSignatureDialog(true);
    }
  };

  const handleAffidavitAccepted = () => {
    setShowAffidavitDialog(false);
    if (pendingDeliveryToSign) {
      setDeliveryToSign(pendingDeliveryToSign);
      setShowSignatureDialog(true);
      setPendingDeliveryToSign(null);
    }
  };

  const handleSaveSignature = async (signatureDataUrl: string) => {
    if (!deliveryToSign) return;
    try {
      await signEPPDelivery(deliveryToSign.id, signatureDataUrl);
      toast.success("Firma legal capturada y certificada con Hash SHA-256.");
      setShowSignatureDialog(false);
      setDeliveryToSign(null);
      await queryClient.invalidateQueries({ queryKey: eppKeys.all });
      loadOperationalData();
    } catch (err: any) {
      console.error("Error al guardar firma:", err);
      toast.error("Error al procesar la firma.");
    }
  };

  // Operational KPIs Calculation
  const kpis = useMemo(() => {
    const inTransitTransfers = transfers.filter((t) => t.status === "en_transito" || t.status === "despachada");
    const activeLocationsCount = locations.length;
    const totalPhysicalUnits = locationStock.reduce((acc, s) => acc + (s.quantity || 0), 0) || eppItems.reduce((acc, i) => acc + (i.stock || 0), 0);
    const activeExceptionsCount = exceptions.length + transfers.filter((t) => t.status === "recibida_con_diferencias").length;

    // EPP Legal compliance
    const totalDeliveries = deliveries.length;
    const signedDeliveries = deliveries.filter((d) => d.status === "firmado").length;
    const pendingSignatures = deliveries.filter((d) => d.status === "pendiente").length;
    const complianceRate = totalDeliveries > 0 ? Math.round((signedDeliveries / totalDeliveries) * 100) : 100;

    return {
      activeLocationsCount,
      totalPhysicalUnits,
      inTransitTransfersCount: inTransitTransfers.length,
      inTransitList: inTransitTransfers,
      activeExceptionsCount,
      complianceRate,
      signedDeliveries,
      pendingSignatures,
      totalDeliveries,
    };
  }, [locations, locationStock, eppItems, transfers, exceptions, deliveries]);

  // Critical stock alerts (<= 5 units)
  const stockAlerts = useMemo(() => {
    return eppItems.filter((item) => item.stock <= 5);
  }, [eppItems]);

  return (
    <AppLayout>
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Header & Operational Welcome Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-border/60">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Plataforma Operacional Activa
              </span>
              <span className="text-xs text-muted-foreground">
                {profile?.company_name ? `· ${profile.company_name}` : ""}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Centro de Mando Operacional
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Monitoreo en tiempo real de sedes físicas, movimientos de stock, transferencias y cumplimiento legal.
            </p>
          </div>

          {/* Quick Action Shortcuts */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              onClick={() => setIsNewTransferOpen(true)}
              className="gap-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs sm:text-sm h-10 px-4 rounded-xl shadow-sm"
            >
              <Truck className="w-4 h-4" />
              Nuevo Despacho
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate("/recepcion")}
              className="gap-2 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 font-semibold text-xs sm:text-sm h-10 px-3.5 rounded-xl"
            >
              <QrCode className="w-4 h-4" />
              Recepción QR
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowDeliveryDialog(true)}
              className="gap-2 border-border font-medium text-xs sm:text-sm h-10 px-3.5 rounded-xl hover:bg-accent"
            >
              <FileSignature className="w-4 h-4 text-emerald-500" />
              Entregar EPP (F. 299)
            </Button>
          </div>
        </div>

        {/* Priority Exceptions Alert (If Any) */}
        {kpis.activeExceptionsCount > 0 && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-rose-400 text-sm">
                  {kpis.activeExceptionsCount} {kpis.activeExceptionsCount === 1 ? "Discrepancia operativa detectada" : "Discrepancias operativas detectadas"}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Hay recepciones físicas con faltantes, sobrantes o daños que requieren atención de supervisión.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => navigate("/transferencias")}
              className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl"
            >
              Revisar Incidencias
            </Button>
          </div>
        )}

        {/* 5 Operational KPIs Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* KPI 1: Sedes Físicas */}
          <div
            onClick={() => navigate("/ubicaciones")}
            className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-sm hover:border-purple-500/40 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Sedes & Obras
              </span>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              {isLoadingOperational ? (
                <div className="h-8 w-12 bg-muted/60 animate-pulse rounded-lg" />
              ) : (
                <span className="text-2xl sm:text-3xl font-extrabold text-foreground">{kpis.activeLocationsCount}</span>
              )}
              <span className="text-xs text-muted-foreground">puntos en red</span>
            </div>
            <div className="mt-2 text-[11px] text-purple-400 font-medium flex items-center gap-1">
              Ver red de sedes <ChevronRight className="w-3 h-3" />
            </div>
          </div>

          {/* KPI 2: Stock Distribuido */}
          <div
            onClick={() => navigate("/inventario")}
            className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-sm hover:border-emerald-500/40 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Stock Distribuido
              </span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                <Boxes className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              {isLoadingOperational || loadingItems ? (
                <div className="h-8 w-16 bg-muted/60 animate-pulse rounded-lg" />
              ) : (
                <span className="text-2xl sm:text-3xl font-extrabold text-foreground">{kpis.totalPhysicalUnits}</span>
              )}
              <span className="text-xs text-muted-foreground">unidades totales</span>
            </div>
            <div className="mt-2 text-[11px] text-emerald-400 font-medium flex items-center gap-1">
              Ver inventario por sede <ChevronRight className="w-3 h-3" />
            </div>
          </div>

          {/* KPI 3: En Tránsito */}
          <div
            onClick={() => navigate("/transferencias")}
            className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-sm hover:border-purple-500/40 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                En Tránsito
              </span>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
                <Truck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              {isLoadingOperational ? (
                <div className="h-8 w-12 bg-muted/60 animate-pulse rounded-lg" />
              ) : (
                <span className="text-2xl sm:text-3xl font-extrabold text-foreground">{kpis.inTransitTransfersCount}</span>
              )}
              <span className="text-xs text-muted-foreground">viajando en ruta</span>
            </div>
            <div className="mt-2 text-[11px] text-purple-400 font-medium flex items-center gap-1">
              Monitorear despachos <ChevronRight className="w-3 h-3" />
            </div>
          </div>

          {/* KPI 4: Incidencias / Excepciones */}
          <div
            onClick={() => navigate("/transferencias")}
            className={`bg-card border rounded-2xl p-4 sm:p-5 shadow-sm transition-all cursor-pointer group ${
              kpis.activeExceptionsCount > 0 ? "border-rose-500/40 hover:border-rose-500" : "border-border hover:border-emerald-500/40"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Discrepancias
              </span>
              <div className={`p-2 rounded-xl group-hover:scale-110 transition-transform ${
                kpis.activeExceptionsCount > 0 ? "bg-rose-500/10 text-rose-400" : "bg-emerald-500/10 text-emerald-400"
              }`}>
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              {isLoadingOperational ? (
                <div className="h-8 w-12 bg-muted/60 animate-pulse rounded-lg" />
              ) : (
                <span className={`text-2xl sm:text-3xl font-extrabold ${kpis.activeExceptionsCount > 0 ? "text-rose-400" : "text-foreground"}`}>
                  {kpis.activeExceptionsCount}
                </span>
              )}
              <span className="text-xs text-muted-foreground">incidencias</span>
            </div>
            <div className={`mt-2 text-[11px] font-medium flex items-center gap-1 ${
              kpis.activeExceptionsCount > 0 ? "text-rose-400" : "text-emerald-400"
            }`}>
              {kpis.activeExceptionsCount > 0 ? "Atender excepciones" : "Todo conforme"} <ChevronRight className="w-3 h-3" />
            </div>
          </div>

          {/* KPI 5: Cumplimiento Legal SRT 299 */}
          <div
            onClick={() => navigate("/operarios")}
            className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-sm hover:border-emerald-500/40 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Legal SRT 299
              </span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                <FileSignature className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              {loadingDeliveries ? (
                <div className="h-8 w-16 bg-muted/60 animate-pulse rounded-lg" />
              ) : (
                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-500">{kpis.complianceRate}%</span>
              )}
              <span className="text-xs text-muted-foreground">firmado</span>
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground font-medium flex items-center gap-1">
              <span>{kpis.pendingSignatures} firmas pend.</span> <ChevronRight className="w-3 h-3" />
            </div>
          </div>
        </div>

        {/* Main Dashboard Layout: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Left Column (2/3) */}
          <div className="lg:col-span-2 space-y-8">
            {/* 1. Active In-Transit Monitor */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                    <Truck className="w-5 h-5 text-purple-400" />
                    Despachos en Ruta y Transferencias Activas
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Materiales en tránsito físico entre sedes y obras pendientes de recepción.
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/transferencias")}
                  className="text-xs gap-1 text-purple-400 hover:text-purple-300"
                >
                  Ver Todas <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>

              {kpis.inTransitList.length === 0 ? (
                <div className="bg-background/40 border border-dashed border-border rounded-xl p-6 text-center">
                  <CheckCircle2 className="w-7 h-7 text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-foreground">No hay mercadería en tránsito en este momento</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Todos los despachos han sido recibidos en sus sedes de destino.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {kpis.inTransitList.slice(0, 3).map((trf) => (
                    <div
                      key={trf.id}
                      className="bg-background border border-border rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-purple-500/40 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-purple-400">{trf.tracking_code}</span>
                          <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full font-semibold">
                            En Tránsito
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-foreground font-medium">
                          <span>{trf.origin_location_name}</span>
                          <ArrowRight className="w-3 h-3 text-muted-foreground" />
                          <span className="text-emerald-400">{trf.destination_location_name}</span>
                        </div>
                        <span className="text-[11px] text-muted-foreground block">
                          {trf.items?.length || 0} ítems ({trf.total_units_dispatched || 0} unidades) {trf.transport_carrier ? `· ${trf.transport_carrier}` : ""}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedTransfer(trf);
                            setIsDetailOpen(true);
                          }}
                          className="text-xs h-8 px-2.5 border-border"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" /> QR
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => navigate(`/recepcion/${trf.tracking_code}`)}
                          className="text-xs h-8 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex-1 sm:flex-initial"
                        >
                          <QrCode className="w-3.5 h-3.5 mr-1" /> Recibir
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Recent EPP Deliveries (Preserved & Enhanced) */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                    <FileSignature className="w-5 h-5 text-emerald-400" />
                    Planilla de Entregas de EPP & Constancias SRT 299
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Registro de entrega de elementos de protección a operarios con firma táctil digitalizada.
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/operarios")}
                  className="text-xs gap-1 text-emerald-400 hover:text-emerald-300"
                >
                  Ver Operarios <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>

              {deliveries.length === 0 ? (
                <div className="bg-background/40 border border-dashed border-border rounded-xl p-6 text-center">
                  <FileSignature className="w-7 h-7 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-foreground">No hay entregas registradas aún</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Usa el botón "Entregar EPP" para generar la primera constancia 299.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {deliveries.slice(0, 4).map((del) => {
                    const emp = employees.find((e) => e.id === del.employee_id);
                    const item = eppItems.find((i) => i.id === del.epp_item_id);
                    const isSigned = del.status === "firmado";

                    return (
                      <div
                        key={del.id}
                        className="bg-background border border-border rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-emerald-500/30 transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs sm:text-sm text-foreground">{emp?.name || "Operario"}</span>
                            {emp?.dni_cuil && (
                              <span className="text-[11px] font-mono text-muted-foreground">
                                DNI: {emp.dni_cuil}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-foreground/80 mt-0.5">
                            {del.quantity} u. de <strong>{item?.name || "EPP"}</strong>
                          </p>
                          <span className="text-[10px] text-muted-foreground block mt-0.5">
                            {del.delivery_date} {del.notes ? `· "${del.notes}"` : ""}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          {isSigned ? (
                            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Firmado
                            </span>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleSignClick(del)}
                              className="h-8 text-xs bg-amber-600 hover:bg-amber-500 text-white font-semibold gap-1"
                            >
                              <FileSignature className="w-3.5 h-3.5" /> Firmar en Obra
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column (1/3): Stock Alarms & Activity Feed */}
          <div className="space-y-6">
            {/* 1. Critical Stock Alert */}
            {stockAlerts.length > 0 && (
              <div className="bg-card border border-amber-500/30 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  Alerta de Stock Mínimo
                </div>
                <p className="text-xs text-muted-foreground">
                  Los siguientes elementos tienen 5 o menos unidades en inventario:
                </p>
                <div className="space-y-1.5">
                  {stockAlerts.slice(0, 4).map((item) => (
                    <div
                      key={item.id}
                      className="bg-background/80 p-2.5 rounded-xl border border-border flex items-center justify-between text-xs"
                    >
                      <span className="font-semibold text-foreground truncate">{item.name}</span>
                      <span className="font-mono font-bold text-amber-400 shrink-0 ml-2">
                        {item.stock} u.
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Red de Sedes Físicas Resumen */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-purple-400" />
                  Red de Sedes & Depósitos
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/ubicaciones")}
                  className="h-7 text-xs text-purple-400 hover:text-purple-300 p-0"
                >
                  Gestionar
                </Button>
              </div>

              <div className="space-y-2">
                {locations.slice(0, 4).map((loc) => (
                  <div
                    key={loc.id}
                    onClick={() => navigate(`/inventario?location=${loc.id}`)}
                    className="bg-background/80 p-2.5 rounded-xl border border-border flex items-center justify-between text-xs hover:border-emerald-500/30 cursor-pointer transition-colors"
                  >
                    <div>
                      <span className="font-semibold text-foreground block">{loc.name}</span>
                      <span className="text-[10px] text-muted-foreground uppercase">{loc.type}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Live Operational Timeline */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                  <History className="w-4 h-4 text-amber-400" />
                  Actividad Reciente
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/inventario")}
                  className="h-7 text-xs text-muted-foreground p-0"
                >
                  Ver Log
                </Button>
              </div>

              <div className="space-y-2.5">
                {movements.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-2 italic">Sin movimientos registrados recientemente.</p>
                ) : (
                  movements.slice(0, 4).map((m) => (
                    <div key={m.id} className="text-xs space-y-0.5 border-b border-border/50 pb-2 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground text-[11px] uppercase">
                          {m.movement_type.replace(/_/g, " ")}
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {new Date(m.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-[11px]">
                        <strong>{m.quantity} {m.unit}</strong> de {m.item_name}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* AI Assistant Callout */}
            <div className="bg-gradient-to-br from-emerald-500/10 to-purple-500/10 border border-emerald-500/30 rounded-2xl p-4 space-y-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                Asistente Normativo IA
              </span>
              <p className="text-xs text-muted-foreground">
                Consulta resoluciones SRT 299/11, requisitos de EPP por puesto o normativas laborales directamente.
              </p>
              <AIAssistantButton />
            </div>
          </div>
        </div>
      </div>

      {/* New EPP Delivery Dialog */}
      <Dialog open={showDeliveryDialog} onOpenChange={setShowDeliveryDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSignature className="w-5 h-5 text-emerald-400" />
              Nueva Entrega de EPP (Formulario SRT 299)
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Selecciona el trabajador y el elemento a entregar para emitir el comprobante.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateDelivery} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Operario Receptor *</label>
              <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId} required>
                <SelectTrigger className="w-full h-11 bg-background border-border">
                  <SelectValue placeholder="Selecciona un trabajador..." />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name} (DNI: {emp.dni_cuil || "S/D"}) - {emp.job_title || "Operario"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Elemento de Protección (EPP) *</label>
              <Select value={selectedEppId} onValueChange={setSelectedEppId} required>
                <SelectTrigger className="w-full h-11 bg-background border-border">
                  <SelectValue placeholder="Selecciona el EPP..." />
                </SelectTrigger>
                <SelectContent>
                  {eppItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} ({item.stock} u. disponibles) {item.brand ? `· ${item.brand}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Cantidad *</label>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="font-bold text-center"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Observaciones / Frente de Obra</label>
              <Input
                placeholder="Ej: Entrega de recambio por desgaste en obra..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setShowDeliveryDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={savingDelivery} className="bg-emerald-600 hover:bg-emerald-500 text-white">
                {savingDelivery ? "Registrando..." : "Registrar Entrega"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Signature Pad Modal */}
      <SignaturePad
        open={showSignatureDialog}
        onOpenChange={setShowSignatureDialog}
        employeeName={employees.find((e) => e.id === deliveryToSign?.employee_id)?.name || "Operario"}
        onSave={handleSaveSignature}
      />

      {/* Affidavit First-Time Signing Modal */}
      <AffidavitModal
        open={showAffidavitDialog}
        onCancel={() => setShowAffidavitDialog(false)}
        employeeName={employees.find((e) => e.id === pendingDeliveryToSign?.employee_id)?.name || "Operario"}
        onAccept={handleAffidavitAccepted}
      />

      {/* New Transfer Modal */}
      <NewTransferDialog
        open={isNewTransferOpen}
        onOpenChange={setIsNewTransferOpen}
        companyId={companyId || ""}
        userId={user?.id}
        onTransferCreated={() => {
          loadOperationalData();
        }}
      />

      {/* Transfer Detail & QR Modal */}
      <TransferDetailDialog
        transfer={selectedTransfer}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onRefresh={loadOperationalData}
      />
    </AppLayout>
  );
}

import { useState, useEffect, useMemo } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Transfer, 
  TransferStatus, 
  TransferException 
} from "@/types/inventory";
import { 
  getTransfers, 
  getActiveExceptions, 
  TRANSFER_STATUS_CONFIG 
} from "@/services/transferService";
import { checkRolePermission } from "@/services/permissionService";
import { NewTransferDialog } from "@/components/transfers/NewTransferDialog";
import { TransferDetailDialog } from "@/components/transfers/TransferDetailDialog";
import { 
  Truck, 
  Plus, 
  Search, 
  QrCode, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Eye, 
  MapPin, 
  Boxes,
  FileSpreadsheet,
  Building2,
  Share2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Transfers() {
  const navigate = useNavigate();
  const { profile, isAdmin, user } = useAuth();
  const { t } = useLanguage();
  const companyId = profile?.company_id;

  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [exceptions, setExceptions] = useState<TransferException[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusTab, setStatusTab] = useState<string>("all");

  // Dialog States
  const [isNewTransferOpen, setIsNewTransferOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const effectiveRole = profile?.role || (isAdmin ? "admin" : "supervisor");
  const canManageTransfers = isAdmin || profile?.role === "owner" || profile?.role === "admin" || checkRolePermission(effectiveRole, "manage_transfers", companyId);

  const loadData = async () => {
    if (!companyId) return;
    setIsLoading(true);
    try {
      const [transfersList, exceptionsList] = await Promise.all([
        getTransfers(companyId),
        getActiveExceptions(companyId),
      ]);
      setTransfers(transfersList);
      setExceptions(exceptionsList);
    } catch (err) {
      console.error("Error al cargar transferencias:", err);
      toast.error("No se pudieron cargar las transferencias.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [companyId]);

  const filteredTransfers = useMemo(() => {
    return transfers.filter((trf) => {
      const matchesSearch =
        trf.tracking_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (trf.origin_location_name && trf.origin_location_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (trf.destination_location_name && trf.destination_location_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (trf.remito_number && trf.remito_number.toLowerCase().includes(searchQuery.toLowerCase()));

      if (statusTab === "all") return matchesSearch;
      if (statusTab === "en_transito") return matchesSearch && (trf.status === "en_transito" || trf.status === "despachada");
      if (statusTab === "recibida") return matchesSearch && trf.status === "recibida";
      if (statusTab === "diferencias") return matchesSearch && (trf.status === "recibida_con_diferencias" || trf.has_exceptions);
      if (statusTab === "borrador") return matchesSearch && trf.status === "borrador";

      return matchesSearch;
    });
  }, [transfers, searchQuery, statusTab]);

  const stats = useMemo(() => {
    const inTransit = transfers.filter((t) => t.status === "en_transito" || t.status === "despachada").length;
    const completed = transfers.filter((t) => t.status === "recibida").length;
    const withDiff = transfers.filter((t) => t.status === "recibida_con_diferencias" || t.has_exceptions).length;
    const totalItemsMoved = transfers.reduce((acc, t) => acc + (t.total_units_dispatched || 0), 0);

    return { inTransit, completed, withDiff, totalItemsMoved };
  }, [transfers]);

  const handleOpenDetail = (trf: Transfer) => {
    setSelectedTransfer(trf);
    setIsDetailOpen(true);
  };

  return (
    <AppLayout>
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                <Truck className="w-3 h-3" /> Cadena de Custodia y Movimientos
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Transferencias y Despachos
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Controla el flujo de materiales entre sedes, emite remitos con código QR y registra recepciones móviles con excepciones en tiempo real.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => navigate("/recepcion")}
              className="gap-2 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
            >
              <QrCode className="w-4 h-4" />
              Recepción Móvil QR
            </Button>
            {canManageTransfers && (
              <Button
                onClick={() => setIsNewTransferOpen(true)}
                className="gap-2 bg-purple-600 hover:bg-purple-500 text-white font-medium shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Nuevo Despacho
              </Button>
            )}
          </div>
        </div>

        {/* Exceptions Priority Banner */}
        {stats.withDiff > 0 && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-rose-300 text-sm">
                  {stats.withDiff} {stats.withDiff === 1 ? "Transferencia con discrepancias detectadas" : "Transferencias con discrepancias detectadas"}
                </h4>
                <p className="text-xs text-rose-200/80">
                  Hay recepciones en campo con faltantes, sobrantes o daños que requieren revisión de supervisión.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStatusTab("diferencias")}
              className="text-xs bg-rose-500/20 border-rose-500/40 text-rose-200 hover:bg-rose-500/30 w-full sm:w-auto"
            >
              Ver Incidencias
            </Button>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">En Tránsito</span>
              <Truck className="w-5 h-5 text-purple-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold">{stats.inTransit}</span>
              <span className="text-xs text-muted-foreground">viajando en ruta</span>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Completadas</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold">{stats.completed}</span>
              <span className="text-xs text-muted-foreground">recibidas 100% OK</span>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Con Diferencias</span>
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold">{stats.withDiff}</span>
              <span className="text-xs text-muted-foreground">incidencias reportadas</span>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Unidades Movidas</span>
              <Boxes className="w-5 h-5 text-blue-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold">{stats.totalItemsMoved}</span>
              <span className="text-xs text-muted-foreground">ítems transferidos</span>
            </div>
          </div>
        </div>

        {/* Search & Tabs */}
        <div className="bg-card border border-border rounded-2xl p-4 mb-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por código TRF, remito, sede..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background/50 text-xs sm:text-sm"
            />
          </div>

          <Tabs value={statusTab} onValueChange={setStatusTab} className="w-full md:w-auto">
            <TabsList className="bg-background/80 grid grid-cols-5 w-full md:w-auto">
              <TabsTrigger value="all" className="text-xs">Todas</TabsTrigger>
              <TabsTrigger value="en_transito" className="text-xs">En Tránsito</TabsTrigger>
              <TabsTrigger value="recibida" className="text-xs">Recibidas</TabsTrigger>
              <TabsTrigger value="diferencias" className="text-xs text-rose-400">Diferencias</TabsTrigger>
              <TabsTrigger value="borrador" className="text-xs">Borradores</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Transfers List */}
        {isLoading ? (
          <div className="py-20 text-center text-muted-foreground">
            <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
            Cargando transferencias y cadena de custodia...
          </div>
        ) : filteredTransfers.length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-2xl p-12 text-center">
            <Truck className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <h3 className="text-lg font-semibold">No hay transferencias en este filtro</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
              {searchQuery || statusTab !== "all"
                ? "Prueba cambiando los términos de búsqueda o el filtro de estado."
                : "Crea tu primer despacho para iniciar el movimiento trazable entre sedes."}
            </p>
            {canManageTransfers && (
              <Button
                onClick={() => setIsNewTransferOpen(true)}
                className="mt-4 gap-2 bg-purple-600 hover:bg-purple-500 text-white"
              >
                <Plus className="w-4 h-4" /> Crear Primer Despacho
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransfers.map((trf) => {
              const statusCfg = TRANSFER_STATUS_CONFIG[trf.status] || TRANSFER_STATUS_CONFIG.borrador;
              const hasDiff = trf.status === "recibida_con_diferencias" || trf.has_exceptions;

              return (
                <div
                  key={trf.id}
                  className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-sm hover:border-purple-500/40 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  {/* Left: Code, Route, Status */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-foreground text-sm tracking-tight">
                        {trf.tracking_code}
                      </span>
                      {trf.remito_number && (
                        <span className="text-[11px] bg-background border border-border px-2 py-0.5 rounded text-muted-foreground">
                          Remito: {trf.remito_number}
                        </span>
                      )}
                      <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${statusCfg.badgeColor}`}>
                        {statusCfg.label}
                      </span>
                    </div>

                    {/* Route Visual */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <div className="flex items-center gap-1 font-medium text-foreground">
                        <MapPin className="w-3.5 h-3.5 text-purple-400" />
                        {trf.origin_location_name}
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                      <div className="flex items-center gap-1 font-medium text-foreground">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        {trf.destination_location_name}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>Despachado: <strong>{new Date(trf.created_at).toLocaleDateString()}</strong></span>
                      {trf.transport_carrier && (
                        <span>Transporte: <strong>{trf.transport_carrier}</strong> {trf.transport_vehicle_plate ? `(${trf.transport_vehicle_plate})` : ''}</span>
                      )}
                      {trf.items && (
                        <span>Ítems: <strong>{trf.items.length}</strong> ({trf.total_units_dispatched || 0} unidades)</span>
                      )}
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDetail(trf)}
                      className="text-xs gap-1 border-border"
                    >
                      <Eye className="w-3.5 h-3.5" /> Detalle & QR
                    </Button>

                    {(trf.status === "en_transito" || trf.status === "despachada") && (
                      <Button
                        size="sm"
                        onClick={() => navigate(`/recepcion/${trf.tracking_code}`)}
                        className="text-xs gap-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
                      >
                        <QrCode className="w-3.5 h-3.5" /> Recibir en Campo
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      {/* New Transfer Modal */}
      <NewTransferDialog
        open={isNewTransferOpen}
        onOpenChange={setIsNewTransferOpen}
        companyId={companyId || ""}
        userId={user?.id}
        onTransferCreated={(newTrf) => {
          loadData();
          setSelectedTransfer(newTrf);
          setIsDetailOpen(true);
        }}
      />

      {/* Detail & QR Modal */}
      <TransferDetailDialog
        transfer={selectedTransfer}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onRefresh={loadData}
      />
      </div>
    </AppLayout>
  );
}

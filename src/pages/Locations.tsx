import { useState, useEffect, useMemo } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Location, 
  LocationType 
} from "@/types/inventory";
import { 
  getLocations, 
  createLocation, 
  updateLocation, 
  deleteLocation, 
  LOCATION_TYPE_LABELS 
} from "@/services/locationService";
import { getLocationStock } from "@/services/inventoryService";
import { checkRolePermission } from "@/services/permissionService";
import { 
  Building2, 
  Plus, 
  Search, 
  MapPin, 
  Boxes, 
  Truck, 
  Edit2, 
  Trash2, 
  ShieldCheck,
  Warehouse,
  Factory,
  HardHat,
  Wrench,
  Store,
  Layers,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function Locations() {
  const navigate = useNavigate();
  const { profile, isAdmin } = useAuth();
  const { t } = useLanguage();
  const companyId = profile?.company_id;

  const [locations, setLocations] = useState<Location[]>([]);
  const [stockCounts, setStockCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [deleteConfirmLocation, setDeleteConfirmLocation] = useState<Location | null>(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formType, setFormType] = useState<LocationType>("deposito");
  const [formAddress, setFormAddress] = useState("");
  const [formCity, setFormCity] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const effectiveRole = profile?.role || (isAdmin ? "admin" : "supervisor");
  const canManageLocations = isAdmin || profile?.role === "owner" || profile?.role === "admin" || checkRolePermission(effectiveRole, "manage_locations", companyId);

  const fetchLocationsData = async () => {
    if (!companyId) return;
    setIsLoading(true);
    try {
      const locs = await getLocations(companyId);
      setLocations(locs);

      // Cargar conteo de stock por ubicación
      const allStock = await getLocationStock(companyId);
      const counts: Record<string, number> = {};
      for (const s of allStock) {
        counts[s.location_id] = (counts[s.location_id] || 0) + (s.quantity || 0);
      }
      setStockCounts(counts);
    } catch (err: any) {
      console.error("Error al cargar ubicaciones:", err);
      toast.error("No se pudieron cargar las ubicaciones.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLocationsData();
  }, [companyId]);

  const openCreateModal = () => {
    setEditingLocation(null);
    setFormName("");
    setFormCode(`UB-${Math.floor(10 + Math.random() * 90)}`);
    setFormType("deposito");
    setFormAddress("");
    setFormCity("");
    setFormNotes("");
    setIsModalOpen(true);
  };

  const openEditModal = (loc: Location) => {
    setEditingLocation(loc);
    setFormName(loc.name);
    setFormCode(loc.code || "");
    setFormType(loc.type);
    setFormAddress(loc.address || "");
    setFormCity(loc.city || "");
    setFormNotes(loc.notes || "");
    setIsModalOpen(true);
  };

  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return;
    if (!formName.trim()) {
      toast.error("El nombre de la ubicación es obligatorio.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingLocation) {
        await updateLocation(editingLocation.id, {
          name: formName.trim(),
          code: formCode.trim() || undefined,
          type: formType,
          address: formAddress.trim() || undefined,
          city: formCity.trim() || undefined,
          notes: formNotes.trim() || undefined,
        });
        toast.success("Ubicación actualizada correctamente.");
      } else {
        await createLocation({
          company_id: companyId,
          name: formName.trim(),
          code: formCode.trim() || undefined,
          type: formType,
          address: formAddress.trim() || undefined,
          city: formCity.trim() || undefined,
          notes: formNotes.trim() || undefined,
          status: "activo",
          is_default: locations.length === 0,
        });
        toast.success("Nueva ubicación creada exitosamente.");
      }

      setIsModalOpen(false);
      fetchLocationsData();
    } catch (err: any) {
      console.error("Error al guardar ubicación:", err);
      toast.error(err.message || "Error al guardar ubicación.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLocation = async () => {
    if (!deleteConfirmLocation) return;
    try {
      await deleteLocation(deleteConfirmLocation.id);
      toast.success("Ubicación eliminada.");
      setDeleteConfirmLocation(null);
      fetchLocationsData();
    } catch (err: any) {
      console.error("Error al eliminar ubicación:", err);
      toast.error(err.message || "No se pudo eliminar la ubicación.");
    }
  };

  const filteredLocations = useMemo(() => {
    return locations.filter((loc) => {
      const matchesSearch = 
        loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (loc.code && loc.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (loc.address && loc.address.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesType = typeFilter === "all" || loc.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [locations, searchQuery, typeFilter]);

  const getLocationIcon = (type: LocationType) => {
    switch (type) {
      case "central":
        return <Building2 className="w-5 h-5 text-purple-400" />;
      case "deposito":
        return <Warehouse className="w-5 h-5 text-blue-400" />;
      case "planta":
        return <Factory className="w-5 h-5 text-amber-400" />;
      case "obra":
        return <HardHat className="w-5 h-5 text-orange-400" />;
      case "panol":
        return <Wrench className="w-5 h-5 text-emerald-400" />;
      case "sucursal":
        return <Store className="w-5 h-5 text-cyan-400" />;
      default:
        return <Layers className="w-5 h-5 text-slate-400" />;
    }
  };

  const totalStockAllLocations = useMemo(() => {
    return Object.values(stockCounts).reduce((acc, qty) => acc + qty, 0);
  }, [stockCounts]);

  return (
    <AppLayout>
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Red Operativa Distribuida
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Ubicaciones y Sedes Físicas
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Gestiona depósitos centrales, plantas, pañoles y frentes de obra para el control de inventario y transferencias.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => navigate("/transferencias")}
              className="gap-2 border-border hover:bg-accent"
            >
              <Truck className="w-4 h-4 text-purple-400" />
              Transferencias
            </Button>
            {canManageLocations && (
              <Button
                onClick={openCreateModal}
                className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Nueva Ubicación
              </Button>
            )}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Sedes</span>
              <Building2 className="w-5 h-5 text-purple-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              {isLoading ? (
                <div className="h-7 w-12 bg-muted/60 animate-pulse rounded-lg" />
              ) : (
                <span className="text-2xl font-bold">{locations.length}</span>
              )}
              <span className="text-xs text-muted-foreground">puntos operativos</span>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Stock Total Distribuido</span>
              <Boxes className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              {isLoading ? (
                <div className="h-7 w-16 bg-muted/60 animate-pulse rounded-lg" />
              ) : (
                <span className="text-2xl font-bold">{totalStockAllLocations}</span>
              )}
              <span className="text-xs text-muted-foreground">unidades en red</span>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Obras y Pañoles</span>
              <HardHat className="w-5 h-5 text-orange-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              {isLoading ? (
                <div className="h-7 w-12 bg-muted/60 animate-pulse rounded-lg" />
              ) : (
                <span className="text-2xl font-bold">
                  {locations.filter((l) => l.type === "obra" || l.type === "panol").length}
                </span>
              )}
              <span className="text-xs text-muted-foreground">frentes de campo</span>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Depósitos y Plantas</span>
              <Warehouse className="w-5 h-5 text-blue-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              {isLoading ? (
                <div className="h-7 w-12 bg-muted/60 animate-pulse rounded-lg" />
              ) : (
                <span className="text-2xl font-bold">
                  {locations.filter((l) => l.type === "central" || l.type === "deposito" || l.type === "planta").length}
                </span>
              )}
              <span className="text-xs text-muted-foreground">centros de despacho</span>
            </div>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-card border border-border rounded-xl p-4 mb-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, código o ciudad..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background/50"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48 bg-background/50">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="central">Sede Central</SelectItem>
                <SelectItem value="deposito">Depósitos</SelectItem>
                <SelectItem value="planta">Plantas</SelectItem>
                <SelectItem value="obra">Obras</SelectItem>
                <SelectItem value="panol">Pañoles</SelectItem>
                <SelectItem value="sucursal">Sucursales</SelectItem>
                <SelectItem value="sector">Sectores</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Locations Grid */}
        {isLoading ? (
          <div className="py-20 text-center text-muted-foreground">
            <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4" />
            Cargando red de ubicaciones...
          </div>
        ) : filteredLocations.length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-2xl p-12 text-center">
            <Building2 className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <h3 className="text-lg font-semibold">No se encontraron ubicaciones</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
              {searchQuery || typeFilter !== "all"
                ? "Prueba cambiando los filtros de búsqueda."
                : "Comienza creando la primera sede, depósito u obra de tu empresa."}
            </p>
            {canManageLocations && (
              <Button onClick={openCreateModal} className="mt-4 gap-2 bg-emerald-600 hover:bg-emerald-500">
                <Plus className="w-4 h-4" /> Crear Primera Ubicación
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredLocations.map((loc) => {
              const typeCfg = LOCATION_TYPE_LABELS[loc.type] || LOCATION_TYPE_LABELS.deposito;
              const unitsInLocation = stockCounts[loc.id] || 0;

              return (
                <div
                  key={loc.id}
                  className="group bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-emerald-500/40 transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Icon, Title & Badge */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-background border border-border flex items-center justify-center shadow-inner">
                          {getLocationIcon(loc.type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="font-semibold text-foreground text-base tracking-tight group-hover:text-emerald-400 transition-colors">
                              {loc.name}
                            </h3>
                            {loc.is_default && (
                              <span title="Sede Principal" className="inline-flex">
                                <ShieldCheck className="w-4 h-4 text-purple-400" />
                              </span>
                            )}
                          </div>
                          {loc.code && (
                            <span className="text-xs font-mono text-muted-foreground">
                              {loc.code}
                            </span>
                          )}
                        </div>
                      </div>

                      <span
                        className={`text-[11px] px-3 py-1 rounded-full font-semibold border whitespace-nowrap shrink-0 ${typeCfg.badgeColor}`}
                      >
                        {typeCfg.label}
                      </span>
                    </div>

                    {/* Address / Location Details */}
                    <div className="space-y-1.5 text-xs text-muted-foreground mt-4">
                      {loc.address ? (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{loc.address} {loc.city ? `(${loc.city})` : ''}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-muted-foreground/60 italic">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>Sin dirección física declarada</span>
                        </div>
                      )}

                      {loc.notes && (
                        <p className="text-xs text-muted-foreground/80 line-clamp-2 mt-2 bg-background/50 p-2 rounded-lg border border-border/50">
                          {loc.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bottom Stats & Actions */}
                  <div className="mt-6 pt-4 border-t border-border/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Boxes className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-medium">
                        <strong className="text-sm font-bold text-foreground">{unitsInLocation}</strong> unidades en stock
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/inventario?location=${loc.id}`)}
                        className="h-8 px-2.5 text-xs gap-1 text-muted-foreground hover:text-foreground"
                      >
                        Ver Stock <ArrowRight className="w-3 h-3" />
                      </Button>

                      {canManageLocations && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditModal(loc)}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            title="Editar Ubicación"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>

                          {!loc.is_default && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteConfirmLocation(loc)}
                              className="h-8 w-8 text-muted-foreground hover:text-red-400"
                              title="Eliminar Ubicación"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      {/* Create / Edit Location Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-400" />
              {editingLocation ? "Editar Ubicación" : "Nueva Ubicación Operativa"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Define los datos principales de la sede, depósito, obra o pañol físico.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveLocation} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="loc-name">Nombre de la Ubicación / Sede *</Label>
              <Input
                id="loc-name"
                placeholder="Ej: Depósito Central, Obra Torre Norte, Pañol Mina..."
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="loc-code">Código Identificador</Label>
                <Input
                  id="loc-code"
                  placeholder="Ej: DEP-01, OBR-24"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="loc-type">Tipo de Sede</Label>
                <Select value={formType} onValueChange={(v: LocationType) => setFormType(v)}>
                  <SelectTrigger id="loc-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="central">Sede Central</SelectItem>
                    <SelectItem value="deposito">Depósito General</SelectItem>
                    <SelectItem value="planta">Planta / Fábrica</SelectItem>
                    <SelectItem value="obra">Obra en Construcción</SelectItem>
                    <SelectItem value="panol">Pañol de Herramientas</SelectItem>
                    <SelectItem value="sucursal">Sucursal Comercial</SelectItem>
                    <SelectItem value="sector">Sector Interno</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="loc-address">Dirección / Ruta</Label>
                <Input
                  id="loc-address"
                  placeholder="Ej: Av. Industrial 450"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="loc-city">Ciudad / Zona</Label>
                <Input
                  id="loc-city"
                  placeholder="Ej: Neuquén, Zárate..."
                  value={formCity}
                  onChange={(e) => setFormCity(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="loc-notes">Observaciones / Instrucciones de Acceso</Label>
              <Textarea
                id="loc-notes"
                placeholder="Ej: Acceso por portón 2 con remito físico y EPP obligatorio..."
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                rows={3}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                {isSubmitting ? "Guardando..." : editingLocation ? "Actualizar" : "Crear Ubicación"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={Boolean(deleteConfirmLocation)}
        onOpenChange={(open) => !open && setDeleteConfirmLocation(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar ubicación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará la ubicación <strong>{deleteConfirmLocation?.name}</strong> de tu red. Las transferencias históricas conservarán su registro inmutable.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteLocation}
              className="bg-red-600 hover:bg-red-500 text-white"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </AppLayout>
  );
}

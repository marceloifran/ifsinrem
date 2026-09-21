import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { checkRolePermission } from "@/services/permissionService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  addEPPItem,
  updateEPPItem,
  deleteEPPItem,
  type EPPItem,
} from "@/services/eppService";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEPPItems, eppKeys } from "@/hooks/useEPPData";
import { useQueryClient } from "@tanstack/react-query";
import { ExcelImportModal } from "@/components/ExcelImportModal";
import { 
  getLocations 
} from "@/services/locationService";
import { 
  getLocationStock, 
  adjustLocationStock, 
  getMovementsLog 
} from "@/services/inventoryService";
import { 
  getTransfers 
} from "@/services/transferService";
import { 
  Location, 
  LocationStock, 
  MovementLog, 
  Transfer 
} from "@/types/inventory";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Boxes,
  PackageCheck,
  FileSpreadsheet,
  Building2,
  Truck,
  History,
  MapPin,
  SlidersHorizontal,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";

const CATEGORIES_ES = [
  { value: "cabeza", label: "Protección Craneana (Cascos)" },
  { value: "manos", label: "Protección de Manos (Guantes)" },
  { value: "pies", label: "Protección de Pies (Calzado)" },
  { value: "ocular", label: "Protección Ocular (Anteojos)" },
  { value: "auditivo", label: "Protección Auditiva (Tapones/Copas)" },
  { value: "respiratorio", label: "Protección Respiratoria (Semimáscaras)" },
  { value: "altura", label: "Trabajo en Altura (Arneses)" },
  { value: "cuerpo", label: "Ropa de Trabajo / Cuerpo" },
  { value: "otro", label: "Otros Elementos / Herramientas / Insumos" },
];

const CATEGORIES_EN = [
  { value: "cabeza", label: "Head Protection (Helmets)" },
  { value: "manos", label: "Hand Protection (Gloves)" },
  { value: "pies", label: "Foot Protection (Footwear)" },
  { value: "ocular", label: "Eye Protection (Glasses)" },
  { value: "auditivo", label: "Hearing Protection (Earplugs/Muffs)" },
  { value: "respiratorio", label: "Respiratory Protection (Masks)" },
  { value: "altura", label: "Height Work (Harnesses)" },
  { value: "cuerpo", label: "Workwear / Body Protection" },
  { value: "otro", label: "Other Items / Tools / Consumables" },
];

export default function EPPInventory() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { user, profile, isAdmin, signOut, isLoading: authLoading } = useAuth();
  const { t, language } = useLanguage();
  const companyId = profile?.company_id;
  const CATEGORIES = language === "en" ? CATEGORIES_EN : CATEGORIES_ES;

  const [activeTab, setActiveTab] = useState<string>("catalog");

  // Locations & Location Stock State
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string>("all");
  const [locationStockData, setLocationStockData] = useState<LocationStock[]>([]);
  const [inTransitTransfers, setInTransitTransfers] = useState<Transfer[]>([]);
  const [movements, setMovements] = useState<MovementLog[]>([]);
  const [isLoadingOperational, setIsLoadingOperational] = useState(false);

  // Stock Adjustment Modal
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [stockToAdjust, setStockToAdjust] = useState<LocationStock | null>(null);
  const [adjustNewQty, setAdjustNewQty] = useState(0);
  const [adjustReason, setAdjustReason] = useState("");
  const [isAdjusting, setIsAdjusting] = useState(false);

  // Catalog State
  const [permissionsVer, setPermissionsVer] = useState(0);

  useEffect(() => {
    const handlePermissionsUpdated = () => {
      setPermissionsVer((v) => v + 1);
    };
    window.addEventListener("permissions-updated", handlePermissionsUpdated);
    return () => {
      window.removeEventListener("permissions-updated", handlePermissionsUpdated);
    };
  }, []);

  const canManageInventario = useMemo(() => {
    return checkRolePermission(
      profile?.role || (isAdmin ? "admin" : "operativo"),
      "manage_inventario",
      profile?.company_id
    );
  }, [profile?.role, isAdmin, profile?.company_id, permissionsVer]);

  const [isOpenExcelModal, setIsOpenExcelModal] = useState(false);
  const { data: items = [], isLoading: loadingItems } = useEPPItems(companyId);
  const loading = authLoading || !companyId || loadingItems;
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Dialog states for EPP Add/Edit
  const [isOpenAdd, setIsOpenAdd] = useState(false);
  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const [activeItem, setActiveItem] = useState<EPPItem | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("cabeza");
  const [stock, setStock] = useState(0);
  const [typeModel, setTypeModel] = useState("");
  const [brand, setBrand] = useState("");
  const [certified, setCertified] = useState("Si");
  const [certificationBody, setCertificationBody] = useState("IRAM 3620");
  const [certificationNumber, setCertificationNumber] = useState("");

  // Load Operational Data (Locations, Stock, Movements)
  const loadOperationalData = async () => {
    if (!companyId) return;
    setIsLoadingOperational(true);
    try {
      const [locs, stockList, transfersList, movs] = await Promise.all([
        getLocations(companyId),
        getLocationStock(companyId),
        getTransfers(companyId, "en_transito"),
        getMovementsLog(companyId, 50),
      ]);
      setLocations(locs);
      setLocationStockData(stockList);
      setInTransitTransfers(transfersList);
      setMovements(movs);

      // Check query param for location
      const queryLoc = searchParams.get("location");
      if (queryLoc) {
        setSelectedLocationId(queryLoc);
        setActiveTab("locations");
      }
    } catch (err) {
      console.error("Error al cargar datos operacionales:", err);
    } finally {
      setIsLoadingOperational(false);
    }
  };

  useEffect(() => {
    loadOperationalData();
  }, [companyId, searchParams]);

  const loadItems = async () => {
    await queryClient.invalidateQueries({ queryKey: eppKeys.all });
    loadOperationalData();
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const handleOpenAdd = () => {
    if (!canManageInventario) {
      toast.error("No tenés permisos para catalogar ítems");
      return;
    }
    setName("");
    setDescription("");
    setCategory("cabeza");
    setStock(0);
    setTypeModel("");
    setBrand("");
    setCertified("Si");
    setCertificationBody("IRAM 3620");
    setCertificationNumber("");
    setIsOpenAdd(true);
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageInventario) {
      toast.error("No tenés permisos para catalogar ítems");
      return;
    }
    if (!name) {
      toast.warning("El nombre es obligatorio");
      return;
    }
    try {
      await addEPPItem(companyId!, {
        name,
        description: description || null,
        category,
        stock,
        type_model: typeModel || null,
        brand: brand || null,
        certified,
        certification_body: certificationBody || null,
        certification_number: certificationNumber || null,
      });
      toast.success("Elemento catalogado con éxito");
      setIsOpenAdd(false);
      loadItems();
    } catch (err: any) {
      toast.error("Error al catalogar: " + err.message);
    }
  };

  const handleOpenEdit = (item: EPPItem) => {
    if (!canManageInventario) {
      toast.error("No tenés permisos para modificar ítems");
      return;
    }
    setActiveItem(item);
    setName(item.name);
    setDescription(item.description || "");
    setCategory(item.category || "cabeza");
    setStock(item.stock);
    setTypeModel(item.type_model || "");
    setBrand(item.brand || "");
    setCertified(item.certified || "Si");
    setCertificationBody(item.certification_body || "IRAM 3620");
    setCertificationNumber(item.certification_number || "");
    setIsOpenEdit(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageInventario) {
      toast.error("No tenés permisos para modificar ítems");
      return;
    }
    if (!activeItem) return;
    if (!name) {
      toast.warning("El nombre es obligatorio");
      return;
    }
    try {
      await updateEPPItem(activeItem.id, {
        name,
        description: description || null,
        category,
        stock,
        type_model: typeModel || null,
        brand: brand || null,
        certified,
        certification_body: certificationBody || null,
        certification_number: certificationNumber || null,
      });
      toast.success("Elemento actualizado con éxito");
      setIsOpenEdit(false);
      loadItems();
    } catch (err: any) {
      toast.error("Error al editar: " + err.message);
    }
  };

  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);

  const handleDelete = (id: string, name: string) => {
    if (!canManageInventario) {
      toast.error("No tenés permisos para eliminar ítems");
      return;
    }
    setItemToDelete({ id, name });
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteEPPItem(itemToDelete.id);
      toast.success("Elemento eliminado con éxito");
      loadItems();
    } catch (err: any) {
      toast.error("Error al eliminar: " + err.message);
    } finally {
      setItemToDelete(null);
    }
  };

  // Open Adjustment Modal
  const openAdjustModal = (stockRow: LocationStock) => {
    setStockToAdjust(stockRow);
    setAdjustNewQty(stockRow.quantity);
    setAdjustReason("Recuento físico periódico en pañol");
    setAdjustModalOpen(true);
  };

  const handleSaveAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || !stockToAdjust) return;

    setIsAdjusting(true);
    try {
      await adjustLocationStock({
        companyId,
        locationId: stockToAdjust.location_id,
        itemId: stockToAdjust.item_id,
        newQuantity: adjustNewQty,
        reason: adjustReason.trim() || "Ajuste manual",
        userId: user?.id,
      });
      toast.success("Stock ajustado y registrado en la cadena de auditoría.");
      setAdjustModalOpen(false);
      loadOperationalData();
    } catch (err: any) {
      console.error("Error al ajustar stock:", err);
      toast.error(err.message || "Error al ajustar inventario.");
    } finally {
      setIsAdjusting(false);
    }
  };

  // Filters
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.brand && item.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.type_model && item.type_model.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [items, searchQuery, categoryFilter]);

  const filteredLocationStock = useMemo(() => {
    return locationStockData.filter((row) => {
      const matchesLoc = selectedLocationId === "all" || row.location_id === selectedLocationId;
      const matchesSearch =
        !searchQuery ||
        row.item_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.location_name?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesLoc && matchesSearch;
    });
  }, [locationStockData, selectedLocationId, searchQuery]);

  const inTransitCount = useMemo(() => {
    return inTransitTransfers.reduce((acc, t) => acc + (t.total_units_dispatched || 0), 0);
  }, [inTransitTransfers]);

  return (
    <AppLayout>
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                <Boxes className="w-3 h-3" /> Control de Stock & Materiales
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Hub de Inventario y Movimientos
            </h1>
            <p className="text-sm text-slate-400 dark:text-slate-500">
              Controla el catálogo, existencias por sede física, mercadería en tránsito y trazabilidad.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={() => navigate("/transferencias")}
              className="gap-2 rounded-xl h-10 px-3.5 border-border font-medium text-xs sm:text-sm"
            >
              <Truck className="w-4 h-4 text-purple-400" />
              Transferencias
            </Button>
            {canManageInventario && (
              <>
                <Button
                  onClick={() => setIsOpenExcelModal(true)}
                  variant="outline"
                  className="gap-2 rounded-xl h-10 px-3.5 border-border text-slate-700 dark:text-slate-300 font-medium text-xs sm:text-sm"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  {t("employees.importExcel")}
                </Button>
                <Button
                  onClick={handleOpenAdd}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2 rounded-xl h-10 px-4 font-semibold text-xs sm:text-sm shadow-sm"
                >
                  <Plus size={16} /> Catalogar Ítem
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-card border border-border p-1 rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-1 h-auto">
            <TabsTrigger value="catalog" className="text-xs sm:text-sm py-2.5 rounded-xl gap-2 font-medium">
              <Boxes className="w-4 h-4 text-emerald-400" />
              Catálogo General {loading ? "" : `(${items.length})`}
            </TabsTrigger>
            <TabsTrigger value="locations" className="text-xs sm:text-sm py-2.5 rounded-xl gap-2 font-medium">
              <Building2 className="w-4 h-4 text-blue-400" />
              Stock por Sede {isLoadingOperational ? "" : `(${locations.length})`}
            </TabsTrigger>
            <TabsTrigger value="in_transit" className="text-xs sm:text-sm py-2.5 rounded-xl gap-2 font-medium">
              <Truck className="w-4 h-4 text-purple-400" />
              En Tránsito {isLoadingOperational ? "" : `(${inTransitCount})`}
            </TabsTrigger>
            <TabsTrigger value="movements" className="text-xs sm:text-sm py-2.5 rounded-xl gap-2 font-medium">
              <History className="w-4 h-4 text-amber-400" />
              Trazabilidad Log {isLoadingOperational ? "" : `(${movements.length})`}
            </TabsTrigger>
          </TabsList>

          {/* ========================================================================= */}
          {/* TAB 1: CATÁLOGO GENERAL & EPP */}
          {/* ========================================================================= */}
          <TabsContent value="catalog" className="space-y-4">
            {/* Filter and search */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative sm:col-span-2">
                <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, modelo, marca o categoría..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 bg-card border-border rounded-xl text-sm"
                />
              </div>
              <div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full h-11 px-3 rounded-xl border border-border bg-card text-xs sm:text-sm text-foreground">
                    <SelectValue placeholder="Todas las categorías" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Catalog Content (Skeleton / Empty / Desktop Table / Mobile Cards) */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              {loading ? (
                <div className="p-6 space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-muted/20 rounded-xl animate-pulse">
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-muted/60 rounded w-1/3" />
                        <div className="h-3 bg-muted/40 rounded w-1/4" />
                      </div>
                      <div className="h-6 bg-muted/60 rounded w-16" />
                    </div>
                  ))}
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center">
                  <Boxes size={40} className="text-muted-foreground/40 mb-3" />
                  <p className="font-semibold text-foreground text-base mb-1">No se encontraron artículos</p>
                  <p className="text-xs text-muted-foreground mb-4">Cargá artículos a tu inventario para poder asignarlos o transferirlos.</p>
                  {canManageInventario && (
                    <Button onClick={handleOpenAdd} variant="outline" className="rounded-xl border-border">
                      Catalogar Ítem
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-muted/40 border-b border-border">
                        <TableRow>
                          <TableHead className="font-bold">Ítem / Descripción</TableHead>
                          <TableHead className="font-bold">Marca / Modelo</TableHead>
                          <TableHead className="font-bold">Tipo / Certificación</TableHead>
                          <TableHead className="font-bold text-center">Stock Global</TableHead>
                          <TableHead className="text-right font-bold">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredItems.map((item) => {
                          const catLabel = CATEGORIES.find((c) => c.value === item.category)?.label || "Otro";
                          return (
                            <TableRow key={item.id} className="hover:bg-muted/20 border-b border-border/60">
                              <TableCell>
                                <div>
                                  <p className="font-semibold text-foreground">{item.name}</p>
                                  <span className="inline-flex items-center gap-1 text-muted-foreground text-[10px] mt-0.5">
                                    {catLabel}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="text-xs font-medium text-foreground/80">
                                  {item.brand || "-"} {item.type_model ? `/ ${item.type_model}` : ""}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 whitespace-nowrap shrink-0">
                                  {item.certified === "Si" ? "Homologado (IRAM/SRT)" : "Estándar"}
                                </span>
                              </TableCell>
                              <TableCell className="text-center">
                                <span
                                  className={`font-mono font-bold text-sm ${
                                    item.stock <= 5 ? "text-amber-400 font-extrabold" : "text-foreground"
                                  }`}
                                >
                                  {item.stock} u.
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                {canManageInventario ? (
                                  <div className="flex items-center justify-end gap-1.5">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleOpenEdit(item)}
                                      title="Editar"
                                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                    >
                                      <Edit2 size={13} />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleDelete(item.id, item.name)}
                                      title="Eliminar"
                                      className="h-8 w-8 text-muted-foreground hover:text-red-400"
                                    >
                                      <Trash2 size={13} />
                                    </Button>
                                  </div>
                                ) : (
                                  <span className="text-xs text-muted-foreground">Solo lectura</span>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Card Grid */}
                  <div className="block md:hidden divide-y divide-border">
                    {filteredItems.map((item) => {
                      const catLabel = CATEGORIES.find((c) => c.value === item.category)?.label || "Otro";
                      return (
                        <div key={item.id} className="p-4 space-y-3 bg-card">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <h3 className="font-bold text-sm text-foreground leading-snug">{item.name}</h3>
                              <p className="text-[11px] text-muted-foreground mt-0.5">{catLabel}</p>
                              {(item.brand || item.type_model) && (
                                <p className="text-xs text-foreground/80 mt-1 font-medium">
                                  {item.brand} {item.type_model ? `· ${item.type_model}` : ""}
                                </p>
                              )}
                            </div>
                            <div className="text-right shrink-0">
                              <span
                                className={`inline-block font-mono font-bold text-sm px-2.5 py-1 rounded-xl border ${
                                  item.stock <= 5
                                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                }`}
                              >
                                {item.stock} u.
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-border/50">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 whitespace-nowrap">
                              {item.certified === "Si" ? "Homologado (IRAM/SRT)" : "Estándar"}
                            </span>

                            {canManageInventario ? (
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleOpenEdit(item)}
                                  className="h-8 text-xs gap-1 rounded-xl text-muted-foreground hover:text-foreground"
                                >
                                  <Edit2 size={12} /> Editar
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(item.id, item.name)}
                                  className="h-8 text-xs gap-1 rounded-xl text-red-400 hover:bg-red-500/10"
                                >
                                  <Trash2 size={12} />
                                </Button>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">Solo lectura</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          {/* ========================================================================= */}
          {/* TAB 2: STOCK POR SEDE / DEPÓSITO */}
          {/* ========================================================================= */}
          <TabsContent value="locations" className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-4 rounded-2xl border border-border">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Filtrar por Sede Física:
                </span>
              </div>

              <Select value={selectedLocationId} onValueChange={setSelectedLocationId}>
                <SelectTrigger className="w-full sm:w-72 bg-background">
                  <SelectValue placeholder="Selecciona una sede..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las Sedes {isLoadingOperational ? "" : `(${locations.length})`}</SelectItem>
                  {locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      {loc.name} {loc.code ? `(${loc.code})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              {isLoadingOperational ? (
                <div className="p-6 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-muted/20 rounded-xl animate-pulse">
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-muted/60 rounded w-1/3" />
                        <div className="h-3 bg-muted/40 rounded w-1/4" />
                      </div>
                      <div className="h-6 bg-muted/60 rounded w-16" />
                    </div>
                  ))}
                </div>
              ) : filteredLocationStock.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <Building2 className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="font-semibold text-foreground">No hay stock registrado en esta sede</p>
                  <p className="text-xs mt-1">Realiza una transferencia hacia esta ubicación para registrar existencias.</p>
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-muted/40 border-b border-border">
                        <TableRow>
                          <TableHead className="font-bold">Sede / Ubicación</TableHead>
                          <TableHead className="font-bold">Producto</TableHead>
                          <TableHead className="font-bold">Tipo</TableHead>
                          <TableHead className="font-bold text-center">Stock Físico</TableHead>
                          <TableHead className="text-right font-bold">Ajuste de Pañol</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredLocationStock.map((row) => (
                          <TableRow key={row.id} className="hover:bg-muted/20 border-b border-border/60">
                            <TableCell>
                              <div className="flex items-center gap-1.5 font-semibold text-foreground text-xs sm:text-sm">
                                <MapPin className="w-3.5 h-3.5 text-purple-400" />
                                {row.location_name}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="font-medium text-foreground">{row.item_name}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                                {row.item_type}
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="font-mono font-bold text-sm text-emerald-400">
                                {row.quantity} {row.item_unit}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              {canManageInventario && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openAdjustModal(row)}
                                  className="h-8 text-xs gap-1 border-border"
                                >
                                  <SlidersHorizontal className="w-3 h-3" /> Ajustar Conteo
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Card Grid */}
                  <div className="block md:hidden divide-y divide-border">
                    {filteredLocationStock.map((row) => (
                      <div key={row.id} className="p-4 space-y-3 bg-card">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5 text-xs text-purple-400 font-bold">
                              <MapPin className="w-3.5 h-3.5" />
                              {row.location_name}
                            </div>
                            <h3 className="font-bold text-sm text-foreground mt-1">{row.item_name}</h3>
                            <span className="inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border mt-1">
                              {row.item_type}
                            </span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="inline-block font-mono font-bold text-sm px-2.5 py-1 rounded-xl border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                              {row.quantity} {row.item_unit}
                            </span>
                          </div>
                        </div>

                        {canManageInventario && (
                          <div className="pt-2 border-t border-border/50">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openAdjustModal(row)}
                              className="w-full h-8 text-xs gap-1.5 border-border rounded-xl"
                            >
                              <SlidersHorizontal className="w-3 h-3 text-emerald-400" /> Ajustar Conteo Físico
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          {/* ========================================================================= */}
          {/* TAB 3: STOCK EN TRÁNSITO */}
          {/* ========================================================================= */}
          <TabsContent value="in_transit" className="space-y-4">
            <div className="bg-card rounded-2xl border border-border shadow-sm p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                    <Truck className="w-5 h-5 text-purple-400" />
                    Mercadería Viajando en Ruta
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Materiales que salieron de un depósito origen y están pendientes de confirmación en destino.
                  </p>
                </div>

                <Button
                  size="sm"
                  onClick={() => navigate("/transferencias")}
                  className="bg-purple-600 hover:bg-purple-500 text-white text-xs gap-1 rounded-xl h-9"
                >
                  Ver Transferencias <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>

              {isLoadingOperational ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="bg-muted/20 border border-border rounded-xl p-4 animate-pulse space-y-2">
                      <div className="h-4 bg-muted/60 rounded w-1/4" />
                      <div className="h-3 bg-muted/40 rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : inTransitTransfers.length === 0 ? (
                <div className="bg-background/40 border border-dashed border-border rounded-xl p-8 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-foreground">No hay transferencias en tránsito actualmente</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Toda la mercadería despachada ha sido recibida en destino.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {inTransitTransfers.map((t) => (
                    <div
                      key={t.id}
                      className="bg-background border border-border rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div>
                        <span className="font-mono font-bold text-xs text-purple-400 block">{t.tracking_code}</span>
                        <div className="flex items-center gap-2 text-xs text-foreground font-medium mt-1">
                          <span>{t.origin_location_name}</span>
                          <ArrowRight className="w-3 h-3 text-muted-foreground" />
                          <span className="text-emerald-400 font-bold">{t.destination_location_name}</span>
                        </div>
                        <span className="text-[11px] text-muted-foreground mt-0.5 block">
                          Despachado: {new Date(t.created_at).toLocaleDateString()} · {t.items?.length || 0} ítems ({t.total_units_dispatched || 0} unidades)
                        </span>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => navigate(`/recepcion/${t.tracking_code}`)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1 w-full sm:w-auto rounded-xl h-9 font-semibold"
                      >
                        Recibir en Campo <ArrowRight className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ========================================================================= */}
          {/* TAB 4: HISTORIAL & TRAZABILIDAD */}
          {/* ========================================================================= */}
          <TabsContent value="movements" className="space-y-4">
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="p-4 bg-muted/40 border-b border-border">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                  <History className="w-4 h-4 text-amber-400" />
                  Cadena de Custodia y Auditoría Inmutable de Movimientos
                </h3>
              </div>

              {isLoadingOperational ? (
                <div className="p-6 space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-muted/20 rounded-xl animate-pulse">
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-muted/60 rounded w-1/3" />
                        <div className="h-3 bg-muted/40 rounded w-1/4" />
                      </div>
                      <div className="h-5 bg-muted/60 rounded w-12" />
                    </div>
                  ))}
                </div>
              ) : movements.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <History className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm font-semibold">Sin registros de auditoría aún</p>
                  <p className="text-xs mt-0.5">Los despachos, recepciones y entregas de EPP se registrarán automáticamente aquí.</p>
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-muted/20 border-b border-border">
                        <TableRow>
                          <TableHead className="font-bold">Fecha / Hora</TableHead>
                          <TableHead className="font-bold">Tipo de Movimiento</TableHead>
                          <TableHead className="font-bold">Producto / Material</TableHead>
                          <TableHead className="font-bold text-center">Cantidad</TableHead>
                          <TableHead className="font-bold">Origen &rarr; Destino</TableHead>
                          <TableHead className="font-bold">Responsable</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {movements.map((m) => (
                          <TableRow key={m.id} className="hover:bg-muted/20 border-b border-border/50 text-xs">
                            <TableCell className="font-mono text-muted-foreground">
                              {new Date(m.created_at).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <span className="font-semibold text-foreground uppercase text-[10px] px-2 py-0.5 rounded bg-background border border-border">
                                {m.movement_type.replace(/_/g, " ")}
                              </span>
                            </TableCell>
                            <TableCell className="font-medium text-foreground">
                              {m.item_name}
                            </TableCell>
                            <TableCell className="text-center font-bold font-mono text-emerald-400">
                              {m.quantity} {m.unit}
                            </TableCell>
                            <TableCell>
                              {m.from_location_name || m.to_location_name ? (
                                <div className="flex items-center gap-1">
                                  <span>{m.from_location_name || "Ext."}</span>
                                  <ArrowRight className="w-3 h-3 text-muted-foreground" />
                                  <span className="font-semibold text-foreground">{m.to_location_name || "Ext."}</span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground italic">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {m.responsible_name || m.employee_name || "Sistema"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Card Grid */}
                  <div className="block md:hidden divide-y divide-border">
                    {movements.map((m) => (
                      <div key={m.id} className="p-4 space-y-2 bg-card text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-foreground uppercase text-[10px] px-2 py-0.5 rounded bg-background border border-border">
                            {m.movement_type.replace(/_/g, " ")}
                          </span>
                          <span className="font-mono text-muted-foreground text-[11px]">
                            {new Date(m.created_at).toLocaleDateString()} {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="font-bold text-sm text-foreground">{m.item_name}</span>
                          <span className="font-mono font-bold text-emerald-400 text-sm">
                            {m.quantity} {m.unit}
                          </span>
                        </div>

                        {(m.from_location_name || m.to_location_name) && (
                          <div className="flex items-center gap-1 text-muted-foreground text-[11px]">
                            <span>{m.from_location_name || "Ext."}</span>
                            <ArrowRight className="w-3 h-3" />
                            <span className="text-foreground font-semibold">{m.to_location_name || "Ext."}</span>
                          </div>
                        )}

                        <div className="text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                          Responsable: <strong className="text-foreground">{m.responsible_name || m.employee_name || "Sistema"}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Manual Stock Adjustment Dialog */}
      <Dialog open={adjustModalOpen} onOpenChange={setAdjustModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-emerald-400" />
              Ajuste de Conteo Físico en Pañol
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Ingresa la cantidad física real observada en el depósito para registrar la auditoría.
            </DialogDescription>
          </DialogHeader>

          {stockToAdjust && (
            <form onSubmit={handleSaveAdjustment} className="space-y-4 py-2">
              <div className="bg-background/80 p-3 rounded-xl border border-border text-xs space-y-1">
                <div>Sede: <strong className="text-foreground">{stockToAdjust.location_name}</strong></div>
                <div>Producto: <strong className="text-foreground">{stockToAdjust.item_name}</strong></div>
                <div>Stock registrado actual: <strong className="text-emerald-400">{stockToAdjust.quantity} {stockToAdjust.item_unit}</strong></div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="adj-qty">Nueva Cantidad Real en Mano *</Label>
                <Input
                  id="adj-qty"
                  type="number"
                  min="0"
                  value={adjustNewQty}
                  onChange={(e) => setAdjustNewQty(Math.max(0, parseInt(e.target.value) || 0))}
                  required
                  className="font-bold text-center text-lg"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="adj-reason">Motivo del Ajuste *</Label>
                <Input
                  id="adj-reason"
                  placeholder="Ej: Recuento físico, rotura accidental, donación..."
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  required
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setAdjustModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isAdjusting} className="bg-emerald-600 hover:bg-emerald-500 text-white">
                  {isAdjusting ? "Guardando..." : "Guardar Ajuste"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Add EPP Modal (Preserved) */}
      <Dialog open={isOpenAdd} onOpenChange={setIsOpenAdd}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("inventory.catalogItem")}</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Completa los datos técnicos y de homologación del material o EPP.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveAdd} className="space-y-4">
            <div>
              <Label>{t("inventory.colItem")} *</Label>
              <Input
                placeholder="Ej. Casco de Seguridad Minero"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label>{t("inventory.category")}</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona categoría..." />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>{t("inventory.brand")}</Label>
                <Input
                  placeholder="Ej. 3M, Libus"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                />
              </div>
              <div>
                <Label>{t("inventory.colTypeModel")}</Label>
                <Input
                  placeholder="Ej. H-700"
                  value={typeModel}
                  onChange={(e) => setTypeModel(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Stock Inicial Global</Label>
                <Input
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label>{t("inventory.colCert")}</Label>
                <Select value={certified} onValueChange={setCertified}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Si">Homologado (Sí)</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpenAdd(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit EPP Modal (Preserved) */}
      <Dialog open={isOpenEdit} onOpenChange={setIsOpenEdit}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("inventory.editItem")}</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Actualiza la información técnica, certificación o stock base del ítem.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div>
              <Label>{t("inventory.colItem")} *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label>{t("inventory.category")}</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona categoría..." />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>{t("inventory.brand")}</Label>
                <Input
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                />
              </div>
              <div>
                <Label>{t("inventory.colTypeModel")}</Label>
                <Input
                  value={typeModel}
                  onChange={(e) => setTypeModel(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpenEdit(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Guardar Cambios
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Item Confirmation (Preserved) */}
      <AlertDialog open={Boolean(itemToDelete)} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar elemento?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Seguro que deseas eliminar <strong>{itemToDelete?.name}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Excel Import Modal (Preserved) */}
      <ExcelImportModal
        open={isOpenExcelModal}
        onOpenChange={setIsOpenExcelModal}
        type="epp"
        companyId={companyId || ""}
        onSuccess={loadItems}
      />
      </div>
    </AppLayout>
  );
}

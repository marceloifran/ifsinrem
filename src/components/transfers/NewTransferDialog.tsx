import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Location, InventoryItem, LocationStock } from "@/types/inventory";
import { getLocations } from "@/services/locationService";
import { getInventoryItems, getLocationStock } from "@/services/inventoryService";
import { createAndDispatchTransfer } from "@/services/transferService";
import { 
  Truck, 
  Plus, 
  Trash2, 
  AlertCircle, 
  QrCode, 
  ArrowRight,
  PackageCheck,
  CheckCircle2,
  Boxes
} from "lucide-react";
import { toast } from "sonner";

interface NewTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  userId?: string;
  onTransferCreated: (transfer: any) => void;
}

interface TransferItemRow {
  itemId: string;
  quantity: number;
}

export function NewTransferDialog({
  open,
  onOpenChange,
  companyId,
  userId,
  onTransferCreated,
}: NewTransferDialogProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [originStock, setOriginStock] = useState<LocationStock[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Form Fields
  const [originLocationId, setOriginLocationId] = useState<string>("");
  const [destinationLocationId, setDestinationLocationId] = useState<string>("");
  const [carrier, setCarrier] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [driverName, setDriverName] = useState("");
  const [remitoNumber, setRemitoNumber] = useState("");
  const [notes, setNotes] = useState("");

  const [items, setItems] = useState<TransferItemRow[]>([
    { itemId: "", quantity: 1 },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load locations and catalog on open
  useEffect(() => {
    if (!open || !companyId) return;

    const loadFormData = async () => {
      setIsLoadingData(true);
      try {
        const [locs, cat] = await Promise.all([
          getLocations(companyId),
          getInventoryItems(companyId),
        ]);
        setLocations(locs);
        setInventoryItems(cat);

        if (locs.length > 0) {
          const defaultOrigin = locs.find((l) => l.is_default) || locs[0];
          setOriginLocationId(defaultOrigin.id);
          if (locs.length > 1) {
            const defaultDest = locs.find((l) => l.id !== defaultOrigin.id);
            if (defaultDest) setDestinationLocationId(defaultDest.id);
          }
        }
      } catch (err) {
        console.error("Error al cargar datos del formulario de transferencia:", err);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadFormData();
  }, [open, companyId]);

  // Load stock for selected origin location
  useEffect(() => {
    if (!companyId || !originLocationId) return;

    const loadStock = async () => {
      try {
        const stock = await getLocationStock(companyId, originLocationId);
        setOriginStock(stock);
      } catch (err) {
        console.error("Error al cargar stock de origen:", err);
      }
    };

    loadStock();
  }, [companyId, originLocationId]);

  const getAvailableStock = (itemId: string): number => {
    if (!itemId) return 0;
    const stockRow = originStock.find((s) => s.item_id === itemId);
    return stockRow?.quantity || 0;
  };

  const handleAddItemRow = () => {
    setItems((prev) => [...prev, { itemId: "", quantity: 1 }]);
  };

  const handleRemoveItemRow = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof TransferItemRow, value: any) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSubmit = async (dispatchImmediately: boolean) => {
    if (!originLocationId || !destinationLocationId) {
      toast.error("Debes seleccionar una ubicación de origen y otra de destino.");
      return;
    }

    if (originLocationId === destinationLocationId) {
      toast.error("El origen y el destino no pueden ser la misma sede.");
      return;
    }

    const validItems = items.filter((i) => i.itemId && i.quantity > 0);
    if (validItems.length === 0) {
      toast.error("Agrega al menos un ítem con cantidad válida.");
      return;
    }

    // Check if origin has enough stock if dispatching immediately
    if (dispatchImmediately) {
      for (const item of validItems) {
        const available = getAvailableStock(item.itemId);
        const itemObj = inventoryItems.find((i) => i.id === item.itemId);
        if (item.quantity > available && available > 0) {
          toast.warning(
            `Atención: La cantidad (${item.quantity}) de "${itemObj?.name}" supera el stock registrado en origen (${available}). Se registrará el despacho de todos modos.`
          );
        }
      }
    }

    setIsSubmitting(true);
    try {
      const createdTransfer = await createAndDispatchTransfer({
        companyId,
        originLocationId,
        destinationLocationId,
        senderUserId: userId,
        transportCarrier: carrier.trim() || undefined,
        transportVehiclePlate: vehiclePlate.trim().toUpperCase() || undefined,
        transportDriverName: driverName.trim() || undefined,
        remitoNumber: remitoNumber.trim() || undefined,
        notes: notes.trim() || undefined,
        items: validItems,
        dispatchImmediately,
      });

      toast.success(
        dispatchImmediately
          ? `Transferencia ${createdTransfer.tracking_code} despachada e iniciada en tránsito.`
          : `Borrador de transferencia ${createdTransfer.tracking_code} guardado.`
      );

      onTransferCreated(createdTransfer);
      onOpenChange(false);
    } catch (err: any) {
      console.error("Error al despachar transferencia:", err);
      toast.error(err.message || "Error al crear la transferencia.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Truck className="w-5 h-5 text-purple-400" />
            Nuevo Despacho / Transferencia de Materiales
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Generá el remito electrónico y código de seguimiento para transportar materiales entre sedes.
          </DialogDescription>
        </DialogHeader>

        {isLoadingData ? (
          <div className="py-12 text-center text-muted-foreground">
            <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-2" />
            Cargando sedes y catálogo...
          </div>
        ) : (
          <div className="space-y-5 py-2">
            {/* Origin -> Destination Selector */}
            <div className="bg-background/50 border border-border p-4 rounded-xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Sede / Depósito de Origen *
                  </Label>
                  <Select value={originLocationId} onValueChange={setOriginLocationId}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Selecciona origen..." />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((loc) => (
                        <SelectItem key={loc.id} value={loc.id}>
                          {loc.name} {loc.code ? `(${loc.code})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Sede / Obra de Destino *
                  </Label>
                  <Select value={destinationLocationId} onValueChange={setDestinationLocationId}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Selecciona destino..." />
                    </SelectTrigger>
                    <SelectContent>
                      {locations
                        .filter((loc) => loc.id !== originLocationId)
                        .map((loc) => (
                          <SelectItem key={loc.id} value={loc.id}>
                            {loc.name} {loc.code ? `(${loc.code})` : ""}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <Boxes className="w-4 h-4 text-emerald-400" />
                  Materiales y Activos a Despachar
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddItemRow}
                  className="h-8 text-xs gap-1 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                >
                  <Plus className="w-3.5 h-3.5" /> Agregar Ítem
                </Button>
              </div>

              <div className="space-y-2.5">
                {items.map((row, idx) => {
                  const available = getAvailableStock(row.itemId);
                  const selectedItem = inventoryItems.find((i) => i.id === row.itemId);

                  return (
                    <div
                      key={idx}
                      className="bg-card border border-border p-3 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-3"
                    >
                      <div className="flex-1 w-full sm:w-auto">
                        <Select
                          value={row.itemId}
                          onValueChange={(val) => handleItemChange(idx, "itemId", val)}
                        >
                          <SelectTrigger className="w-full bg-background text-xs sm:text-sm">
                            <SelectValue placeholder="Selecciona un producto..." />
                          </SelectTrigger>
                          <SelectContent>
                            {inventoryItems.map((item) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.name} ({item.type.toUpperCase()}) - Unidad: {item.unit}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {row.itemId && (
                          <span className="text-[11px] text-muted-foreground block mt-1">
                            Stock disponible en origen: <strong className="text-emerald-400">{available}</strong> {selectedItem?.unit || 'unidades'}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-44">
                        <div className="w-24">
                          <Input
                            type="number"
                            min="1"
                            value={row.quantity}
                            onChange={(e) =>
                              handleItemChange(idx, "quantity", parseInt(e.target.value) || 1)
                            }
                            placeholder="Cant."
                            className="bg-background text-center font-bold"
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-12 truncate">
                          {selectedItem?.unit || "unid."}
                        </span>

                        {items.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItemRow(idx)}
                            className="h-9 w-9 text-muted-foreground hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Transport & Tracking Info */}
            <div className="bg-card/60 border border-border/80 p-4 rounded-xl space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Información de Transporte y Remito (Opcional)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="remito" className="text-xs">N° de Remito Físico</Label>
                  <Input
                    id="remito"
                    placeholder="Ej: R-0001-00249"
                    value={remitoNumber}
                    onChange={(e) => setRemitoNumber(e.target.value)}
                    className="text-xs bg-background"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="carrier" className="text-xs">Empresa / Transportista</Label>
                  <Input
                    id="carrier"
                    placeholder="Ej: Logística Express"
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    className="text-xs bg-background"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="plate" className="text-xs">Patente / Vehículo</Label>
                  <Input
                    id="plate"
                    placeholder="Ej: AF 123 CD"
                    value={vehiclePlate}
                    onChange={(e) => setVehiclePlate(e.target.value)}
                    className="text-xs bg-background uppercase font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="notes" className="text-xs">Notas de Despacho / Instrucciones</Label>
                <Textarea
                  id="notes"
                  placeholder="Ej: Carga palletizada. Entregar en mano a capataz de obra..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="text-xs bg-background"
                />
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                Guardar Borrador
              </Button>
              <Button
                type="button"
                onClick={() => handleSubmit(true)}
                disabled={isSubmitting}
                className="w-full sm:w-auto gap-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold"
              >
                <Truck className="w-4 h-4" />
                {isSubmitting ? "Despachando..." : "Despachar e Iniciar Tránsito"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

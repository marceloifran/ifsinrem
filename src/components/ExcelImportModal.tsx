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
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  parseEmployeesExcel,
  parseEPPItemsExcel,
  downloadEmployeeTemplate,
  downloadEPPTemplate,
  ParsedEmployeeRow,
  ParsedEPPRow,
} from "@/utils/excelImportService";
import { addEmployeesBulk, addEPPItemsBulk } from "@/services/eppService";
import { toast } from "sonner";
import {
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileCheck,
  X,
} from "lucide-react";

interface ExcelImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "employees" | "epp";
  companyId: string;
  onSuccess: () => void;
}

export function ExcelImportModal({
  open,
  onOpenChange,
  type,
  companyId,
  onSuccess,
}: ExcelImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [employeeRows, setEmployeeRows] = useState<ParsedEmployeeRow[]>([]);
  const [eppRows, setEppRows] = useState<ParsedEPPRow[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [step, setStep] = useState<"upload" | "preview">("upload");

  const resetState = () => {
    setFile(null);
    setEmployeeRows([]);
    setEppRows([]);
    setIsParsing(false);
    setIsImporting(false);
    setStep("upload");
  };

  const handleFileChange = async (selectedFile: File) => {
    if (!selectedFile) return;

    const ext = selectedFile.name.split(".").pop()?.toLowerCase();
    if (!["xlsx", "xls", "csv"].includes(ext || "")) {
      toast.error("Formato no soportado. Sube un archivo .xlsx, .xls o .csv");
      return;
    }

    setFile(selectedFile);
    setIsParsing(true);

    try {
      if (type === "employees") {
        const result = await parseEmployeesExcel(selectedFile);
        setEmployeeRows(result.rows);
        setStep("preview");
      } else {
        const result = await parseEPPItemsExcel(selectedFile);
        setEppRows(result.rows);
        setStep("preview");
      }
    } catch (err: any) {
      console.error("Error leyendo Excel:", err);
      toast.error("Error al procesar el archivo Excel. Verifica el formato.");
    } finally {
      setIsParsing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleDownloadTemplate = () => {
    if (type === "employees") {
      downloadEmployeeTemplate();
      toast.success("Plantilla de Personal descargada");
    } else {
      downloadEPPTemplate();
      toast.success("Plantilla de Inventario EPP descargada");
    }
  };

  const handleConfirmImport = async () => {
    if (!companyId) {
      toast.error("No se detectó el ID de empresa");
      return;
    }

    setIsImporting(true);
    try {
      if (type === "employees") {
        const validRows = employeeRows.filter((r) => r.isValid);
        if (validRows.length === 0) {
          toast.error("No hay filas válidas para importar");
          return;
        }

        const count = await addEmployeesBulk(
          companyId,
          validRows.map((r) => ({
            name: r.name,
            dni_cuil: r.dni_cuil,
            file_number: r.file_number || null,
            job_title: r.job_title || null,
            phone: r.phone || null,
            status: r.status,
            job_description: r.job_description || null,
          }))
        );

        toast.success(`¡Se importaron ${count} empleados exitosamente!`);
      } else {
        const validRows = eppRows.filter((r) => r.isValid);
        if (validRows.length === 0) {
          toast.error("No hay filas válidas para importar");
          return;
        }

        const count = await addEPPItemsBulk(
          companyId,
          validRows.map((r) => ({
            name: r.name,
            description: r.description || null,
            category: r.category || 'varios',
            stock: r.stock,
            brand: r.brand || null,
            type_model: r.type_model || null,
            certified: r.certified,
            certification_body: r.certification_body || null,
            certification_number: r.certification_number || null,
          }))
        );

        toast.success(`¡Se importaron ${count} elementos de EPP exitosamente!`);
      }

      onSuccess();
      onOpenChange(false);
      resetState();
    } catch (err: any) {
      console.error("Error en la importación:", err);
      toast.error(err.message || "Error al realizar la importación masiva");
    } finally {
      setIsImporting(false);
    }
  };

  const validEmployeeCount = employeeRows.filter((r) => r.isValid).length;
  const invalidEmployeeCount = employeeRows.length - validEmployeeCount;

  const validEppCount = eppRows.filter((r) => r.isValid).length;
  const invalidEppCount = eppRows.length - validEppCount;

  const validCount = type === "employees" ? validEmployeeCount : validEppCount;
  const invalidCount = type === "employees" ? invalidEmployeeCount : invalidEppCount;
  const totalCount = type === "employees" ? employeeRows.length : eppRows.length;

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val);
        if (!val) resetState();
      }}
    >
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-6">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
            <DialogTitle className="text-xl">
              Importar {type === "employees" ? "Personal (Operarios)" : "Inventario EPP"} desde Excel
            </DialogTitle>
          </div>
          <DialogDescription>
            Carga múltiples registros de una sola vez subiendo tu archivo Excel (.xlsx, .csv).
          </DialogDescription>
        </DialogHeader>

        {step === "upload" ? (
          <div className="space-y-6 py-4">
            {/* Upload Drag & Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 bg-muted/20 hover:bg-muted/40 rounded-xl p-8 text-center transition-colors cursor-pointer flex flex-col items-center justify-center space-y-3"
            >
              {isParsing ? (
                <>
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  <p className="text-sm text-muted-foreground font-medium">
                    Procesando y analizando archivo Excel...
                  </p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Arrastrá tu archivo Excel aquí o haz clic para examinar
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Archivos soportados: .XLSX, .XLS, .CSV
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    className="hidden"
                    id="excel-file-input"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileChange(e.target.files[0]);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => document.getElementById("excel-file-input")?.click()}
                    className="mt-2"
                  >
                    Seleccionar Archivo
                  </Button>
                </>
              )}
            </div>

            {/* Template Download Card */}
            <div className="flex items-center justify-between bg-muted/40 p-4 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <FileCheck className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-foreground">
                    ¿No tenés el formato adecuado?
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Descargá nuestra plantilla modelo con las columnas requeridas para evitar errores.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDownloadTemplate}
                className="gap-2 shrink-0 border-emerald-600/30 hover:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
              >
                <Download className="w-4 h-4" />
                Descargar Plantilla
              </Button>
            </div>
          </div>
        ) : (
          /* Preview Step */
          <div className="flex-1 overflow-hidden flex flex-col space-y-4 py-2">
            {/* Stats summary banner */}
            <div className="flex items-center justify-between bg-muted/40 p-3 rounded-lg border border-border">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">Resumen de detección:</span>
                <Badge variant="outline" className="gap-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {validCount} válidos
                </Badge>
                {invalidCount > 0 && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {invalidCount} con observaciones
                  </Badge>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setStep("upload")}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Cambiar archivo ({file?.name})
              </Button>
            </div>

            {/* Preview Table */}
            <div className="flex-1 overflow-y-auto border border-border rounded-lg max-h-[40vh]">
              <Table>
                <TableHeader className="bg-muted/50 sticky top-0 z-10">
                  <TableRow>
                    <TableHead className="w-10">Estado</TableHead>
                    {type === "employees" ? (
                      <>
                        <TableHead>Legajo</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead>DNI/CUIL</TableHead>
                        <TableHead>Puesto</TableHead>
                        <TableHead>Teléfono</TableHead>
                      </>
                    ) : (
                      <>
                        <TableHead>Nombre EPP</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Marca</TableHead>
                        <TableHead>Modelo</TableHead>
                        <TableHead>Certificado</TableHead>
                      </>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {type === "employees"
                    ? employeeRows.map((row, idx) => (
                        <TableRow
                          key={idx}
                          className={!row.isValid ? "bg-destructive/10" : undefined}
                        >
                          <TableCell>
                            {row.isValid ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <span title={row.error}>
                                <AlertCircle className="w-4 h-4 text-destructive" />
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-xs">{row.file_number || "-"}</TableCell>
                          <TableCell className="font-semibold">{row.name || <span className="text-destructive text-xs italic">Faltante</span>}</TableCell>
                          <TableCell className="text-xs">{row.dni_cuil || "-"}</TableCell>
                          <TableCell className="text-xs">{row.job_title || "-"}</TableCell>
                          <TableCell className="text-xs">{row.phone || "-"}</TableCell>
                        </TableRow>
                      ))
                    : eppRows.map((row, idx) => (
                        <TableRow
                          key={idx}
                          className={!row.isValid ? "bg-destructive/10" : undefined}
                        >
                          <TableCell>
                            {row.isValid ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <span title={row.error}>
                                <AlertCircle className="w-4 h-4 text-destructive" />
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="font-semibold">{row.name || <span className="text-destructive text-xs italic">Faltante</span>}</TableCell>
                          <TableCell className="text-xs capitalize">{row.category}</TableCell>
                          <TableCell className="font-mono font-bold text-xs">{row.stock}</TableCell>
                          <TableCell className="text-xs">{row.brand || "-"}</TableCell>
                          <TableCell className="text-xs">{row.type_model || "-"}</TableCell>
                          <TableCell className="text-xs font-semibold">{row.certified}</TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0 mt-4 border-t border-border pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              resetState();
            }}
            disabled={isImporting}
          >
            Cancelar
          </Button>

          {step === "preview" && (
            <Button
              type="button"
              onClick={handleConfirmImport}
              disabled={isImporting || validCount === 0}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isImporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Confirmar Importación ({validCount})
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

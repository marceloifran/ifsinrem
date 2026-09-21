import { useRef, useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RotateCcw, Check, FileSignature, ShieldCheck, X } from "lucide-react";

interface SignaturePadProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  employeeName?: string;
  onSave: (signatureDataUrl: string) => void;
  onCancel?: () => void;
  title?: string;
}

export function SignaturePad({
  open,
  onOpenChange,
  employeeName,
  onSave,
  onCancel,
  title = "Firma Digital en Obra (Res. SRT N° 299/2011)",
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Setup canvas resolution and styling
  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      setTimeout(initCanvas, 100);
      return;
    }

    canvas.width = rect.width * (window.devicePixelRatio || 1);
    canvas.height = rect.height * (window.devicePixelRatio || 1);

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
      ctx.lineWidth = 3.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#000000";
    }
  };

  useEffect(() => {
    if (open !== false) {
      const timer = setTimeout(initCanvas, 150);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();

    if ("touches" in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) return;

    const dataUrl = canvas.toDataURL("image/png");
    onSave(dataUrl);
    clearCanvas();
  };

  const handleClose = () => {
    clearCanvas();
    if (onCancel) onCancel();
    if (onOpenChange) onOpenChange(false);
  };

  const padContent = (
    <div className="flex flex-col gap-4 p-6 w-full bg-card text-foreground">
      <DialogHeader className="text-left space-y-1">
        <DialogTitle className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
          <FileSignature className="w-5 h-5 text-emerald-500 shrink-0" />
          {title}
        </DialogTitle>
        <DialogDescription className="text-xs text-muted-foreground">
          {employeeName ? (
            <>Constancia de entrega y recepción legal para <strong className="text-foreground">{employeeName}</strong>.</>
          ) : (
            "Firme con el dedo o puntero táctil dentro del recuadro para certificar la entrega."
          )}
        </DialogDescription>
      </DialogHeader>

      {/* Signature Canvas Area - High Contrast Paper Sheet */}
      <div className="relative border-2 border-emerald-500/40 bg-white rounded-2xl overflow-hidden h-52 shadow-md ring-4 ring-emerald-500/10">
        {/* Guide Line */}
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-end pb-4 select-none">
          <div className="w-[85%] mx-auto border-b-2 border-dashed border-slate-300 h-0 mb-3" />
          <div className="text-[10px] text-slate-500 text-center font-mono tracking-widest uppercase font-bold">
            Espacio para Firma Manuscrita en Obra
          </div>
        </div>

        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="relative w-full h-full cursor-crosshair touch-none z-10 bg-white"
        />
      </div>

      {/* Legal Hash Badge */}
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2 flex items-center justify-between text-[11px] text-emerald-600 dark:text-emerald-400">
        <span className="flex items-center gap-1.5 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
          Sellado criptográfico y Hash SHA-256
        </span>
        <span className="font-mono text-[10px] opacity-75">Res. SRT 299/11</span>
      </div>

      {/* Buttons Toolbar */}
      <div className="flex items-center gap-3 pt-1">
        <Button
          type="button"
          variant="outline"
          onClick={clearCanvas}
          className="flex-1 gap-1.5 border-border text-xs h-10 rounded-xl font-semibold hover:bg-accent"
        >
          <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" /> Limpiar
        </Button>

        <Button
          type="button"
          onClick={handleSave}
          disabled={!hasDrawn}
          className="flex-1 gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-10 rounded-xl font-bold border-0 shadow-sm disabled:opacity-50"
        >
          <Check className="w-4 h-4" /> Confirmar Firma
        </Button>
      </div>

      <button
        type="button"
        onClick={handleClose}
        className="text-xs text-muted-foreground hover:text-foreground text-center font-medium mt-0.5 transition-colors"
      >
        Cancelar
      </button>
    </div>
  );

  // If used as a Dialog Modal
  if (open !== undefined) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl bg-card border-border shadow-2xl">
          {padContent}
        </DialogContent>
      </Dialog>
    );
  }

  // If used standalone inline
  return padContent;
}

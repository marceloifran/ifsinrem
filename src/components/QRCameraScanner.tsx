import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, Flashlight, SwitchCamera, AlertCircle, QrCode } from "lucide-react";

interface QRCameraScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScanSuccess: (decodedText: string) => void;
  title?: string;
  description?: string;
}

export function QRCameraScanner({
  open,
  onOpenChange,
  onScanSuccess,
  title = "Escanear Remito o Transferencia QR",
  description = "Apunta la cámara del dispositivo hacia el código QR impreso en el remito o pantalla.",
}: QRCameraScannerProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [activeCameraIndex, setActiveCameraIndex] = useState(0);
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const readerElementId = "qr-video-reader-container";

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      } catch (err) {
        console.warn("Error stopping QR scanner:", err);
      } finally {
        scannerRef.current = null;
      }
    }
  };

  const startScanner = async (cameraId?: string) => {
    setErrorMessage(null);
    try {
      await stopScanner();

      const elem = document.getElementById(readerElementId);
      if (!elem) {
        setTimeout(() => startScanner(cameraId), 150);
        return;
      }

      const html5QrCode = new Html5Qrcode(readerElementId, {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      });
      scannerRef.current = html5QrCode;

      let devices = cameras;
      if (devices.length === 0) {
        const availableDevices = await Html5Qrcode.getCameras();
        if (availableDevices && availableDevices.length > 0) {
          devices = availableDevices.map((d) => ({
            id: d.id,
            label: d.label || `Cámara ${d.id}`,
          }));
          setCameras(devices);
        }
      }

      const cameraConfig = cameraId
        ? { deviceId: { exact: cameraId } }
        : { facingMode: "environment" };

      await html5QrCode.start(
        cameraConfig,
        {
          fps: 15,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const qrEdge = Math.floor(minEdge * 0.75);
            return { width: qrEdge, height: qrEdge };
          },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          try {
            if (navigator.vibrate) navigator.vibrate(100);
          } catch {}

          let cleanCode = decodedText.trim();
          if (cleanCode.includes("/recepcion/")) {
            const parts = cleanCode.split("/recepcion/");
            cleanCode = parts[parts.length - 1];
          }

          stopScanner();
          onOpenChange(false);
          onScanSuccess(cleanCode);
        },
        () => {}
      );

      try {
        const capabilities = html5QrCode.getRunningTrackCapabilities();
        if ((capabilities as any)?.torch) {
          setHasTorch(true);
        }
      } catch {}
    } catch (err: any) {
      console.error("Error al iniciar cámara QR:", err);
      setErrorMessage(
        err.name === "NotAllowedError" || err.message?.includes("Permission")
          ? "Permiso de cámara denegado. Habilita el acceso a la cámara en los ajustes de tu navegador para escanear."
          : "No se pudo acceder a la cámara del dispositivo."
      );
    }
  };

  const toggleTorch = async () => {
    if (!scannerRef.current || !hasTorch) return;
    try {
      const nextTorch = !torchOn;
      await scannerRef.current.applyVideoConstraints({
        advanced: [{ torch: nextTorch } as any],
      });
      setTorchOn(nextTorch);
    } catch (err) {
      console.warn("Torch toggle failed:", err);
    }
  };

  const switchCamera = async () => {
    if (cameras.length <= 1) return;
    const nextIdx = (activeCameraIndex + 1) % cameras.length;
    setActiveCameraIndex(nextIdx);
    await startScanner(cameras[nextIdx].id);
  };

  useEffect(() => {
    if (open) {
      setErrorMessage(null);
      const timer = setTimeout(() => {
        startScanner();
      }, 200);
      return () => clearTimeout(timer);
    } else {
      stopScanner();
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          stopScanner();
        }
        onOpenChange(isOpen);
      }}
    >
      <DialogContent className="max-w-md p-0 overflow-hidden bg-slate-950 border-slate-800 text-white shadow-2xl rounded-2xl">
        <DialogHeader className="p-4 pb-2 bg-slate-900/80 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <DialogTitle className="text-sm font-bold text-white">{title}</DialogTitle>
                <DialogDescription className="text-[11px] text-slate-400">
                  {description}
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="relative w-full aspect-square bg-black flex items-center justify-center overflow-hidden">
          {errorMessage ? (
            <div className="p-6 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
              <p className="text-xs text-rose-300 font-medium leading-relaxed">{errorMessage}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => startScanner()}
                className="text-xs border-slate-700 hover:bg-slate-800 text-white"
              >
                Reintentar Cámara
              </Button>
            </div>
          ) : (
            <>
              <div id={readerElementId} className="w-full h-full object-cover" />

              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="relative w-3/4 h-3/4 border-2 border-emerald-500/60 rounded-2xl shadow-[0_0_25px_rgba(16,185,129,0.25)]">
                  <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                  <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                  <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />

                  <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-bounce shadow-[0_0_12px_#34d399]" />
                </div>
              </div>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-full border border-slate-700 text-[11px] text-slate-200 font-medium shadow-lg flex items-center gap-1.5 pointer-events-none">
                <QrCode className="w-3.5 h-3.5 text-emerald-400" /> Encuadra el código QR
              </div>
            </>
          )}
        </div>

        <div className="p-3.5 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {hasTorch && (
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTorch}
                className={`h-9 px-3 text-xs gap-1.5 border-slate-700 ${
                  torchOn ? "bg-amber-500 text-black border-amber-400" : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <Flashlight className="w-3.5 h-3.5" /> {torchOn ? "Apagar Luz" : "Linterna"}
              </Button>
            )}

            {cameras.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={switchCamera}
                className="h-9 px-3 text-xs gap-1.5 border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <SwitchCamera className="w-3.5 h-3.5" /> Cambiar Cámara
              </Button>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-9 text-xs text-slate-400 hover:text-white"
          >
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

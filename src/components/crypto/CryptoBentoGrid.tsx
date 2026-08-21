import React, { useRef } from "react";
import {
  FileText,
  Bell,
  Share2,
  Calendar as CalendarIcon,
  ShieldCheck,
  Lock,
  QrCode,
  Cpu,
  FileSignature,
  CheckCircle2,
  Award,
  Database,
  Key,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { Marquee } from "@/components/ui/marquee";
import { AnimatedList } from "@/components/ui/animated-list";
import { AnimatedBeam } from "@/components/ui/animated-beam";
import { useLanguage } from "@/contexts/LanguageContext";

// ─── CARD 1: CRYPTO FILES MARQUEE DATA ─────────────────────────────────────────
const cryptoFiles = [
  {
    name: "constancia_srt_29911.pdf",
    type: "PDF Oficial SRT",
    body: "Formulario N° 299/11 firmado con validez legal inalterable y código QR integrado.",
    badge: "Homologado",
    icon: FileText,
  },
  {
    name: "sha256_payload.hash",
    type: "Hash Criptográfico",
    body: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    badge: "SHA-256",
    icon: Lock,
  },
  {
    name: "qr_public_inspection.seal",
    type: "Verificación QR",
    body: "Inspección libre en campo para auditores SRT/ART sin requerir contraseña.",
    badge: "Público",
    icon: QrCode,
  },
  {
    name: "gps_audit_coords.loc",
    type: "Audit Trail GPS",
    body: "Coordenadas 24.7859° S, 65.4117° W + IP del dispositivo al firmar.",
    badge: "Geolocalizado",
    icon: ShieldCheck,
  },
  {
    name: "canvas_signature.png",
    type: "Firma Táctil",
    body: "Trazo manuscrito en pantalla táctil con timestamp UTC inmutable.",
    badge: "Digitalizada",
    icon: FileSignature,
  },
  {
    name: "cert_iram_48293.cert",
    type: "Normativa IRAM",
    body: "Certificación oficial de cascos, calzado y protección dieléctrica.",
    badge: "Norma IRAM",
    icon: Award,
  },
];

// ─── CARD 2: REAL-TIME CRYPTO AUDIT NOTIFICATIONS ─────────────────────────────
const auditNotifications = [
  {
    name: "Hash SHA-256 Generado",
    description: "Sello e3b0c442...855 inalterable",
    time: "Ahora",
    icon: "🔒",
    color: "from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/30",
  },
  {
    name: "Firma Táctil Capturada",
    description: "Operario Legajo #4820 (GPS OK)",
    time: "Hace 2m",
    icon: "✍️",
    color: "from-teal-500/20 to-teal-500/5 text-teal-300 border-teal-500/30",
  },
  {
    name: "Constancia SRT 299/11 PDF",
    description: "Formulario #EPP-2026-4892 emitido",
    time: "Hace 5m",
    icon: "📄",
    color: "from-cyan-500/20 to-cyan-500/5 text-cyan-300 border-cyan-500/30",
  },
  {
    name: "Inspección QR Aprobada",
    description: "Auditor SRT verificó comprobante",
    time: "Hace 12m",
    icon: "🔍",
    color: "from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/30",
  },
  {
    name: "Aislamiento Multi-Tenant",
    description: "Políticas RLS PostgreSQL activas",
    time: "Hace 20m",
    icon: "🛡️",
    color: "from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/30",
  },
];

// Notification Card Component for AnimatedList
function NotificationItem({ name, description, time, icon, color }: typeof auditNotifications[0]) {
  return (
    <figure
      className={cn(
        "relative mx-auto min-h-[56px] w-full max-w-[360px] cursor-pointer overflow-hidden rounded-xl p-3",
        "bg-gradient-to-r backdrop-blur-md border shadow-lg transition-all duration-200 hover:scale-[1.02]",
        color
      )}
    >
      <div className="flex flex-row items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950/80 text-sm border border-slate-800 shrink-0">
          <span>{icon}</span>
        </div>
        <div className="flex flex-col overflow-hidden text-left">
          <div className="flex flex-row items-center gap-2">
            <span className="text-xs font-heading font-bold text-white tracking-tight">{name}</span>
            <span className="text-[10px] text-slate-500 font-mono">· {time}</span>
          </div>
          <p className="text-[11px] font-mono text-slate-300 truncate mt-0.5">{description}</p>
        </div>
      </div>
    </figure>
  );
}

// ─── CARD 3: ANIMATED BEAM GRAPH COMPONENT ────────────────────────────────────
function AnimatedBeamCryptoFlow() {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef1 = useRef<HTMLDivElement>(null);
  const inputRef2 = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const outputRef1 = useRef<HTMLDivElement>(null);
  const outputRef2 = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="relative flex h-[300px] w-full items-center justify-center overflow-hidden rounded-xl p-6"
    >
      <div className="flex h-full w-full max-w-lg flex-row items-stretch justify-between gap-8 z-10">
        
        {/* Left Inputs: Worker Signature & SHA-256 Engine */}
        <div className="flex flex-col justify-center gap-8">
          <div
            ref={inputRef1}
            className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-500/40 bg-slate-900 shadow-xl text-emerald-400 group hover:scale-110 transition-transform"
            title="Firma Táctil Operario"
          >
            <FileSignature className="h-6 w-6" />
          </div>
          <div
            ref={inputRef2}
            className="flex h-12 w-12 items-center justify-center rounded-xl border border-teal-500/40 bg-slate-900 shadow-xl text-teal-400 group hover:scale-110 transition-transform"
            title="Motor Criptográfico SHA-256"
          >
            <Cpu className="h-6 w-6" />
          </div>
        </div>

        {/* Center Node: IfsinRem Immutable Vault */}
        <div className="flex flex-col justify-center">
          <div
            ref={centerRef}
            className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-emerald-400 bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 shadow-2xl shadow-emerald-500/30 text-emerald-400 group hover:scale-110 transition-transform"
            title="Bóveda Criptográfica Inmutable"
          >
            <ShieldCheck className="h-8 w-8 animate-pulse" />
          </div>
        </div>

        {/* Right Outputs: Public QR Portal & SRT Auditor */}
        <div className="flex flex-col justify-center gap-8">
          <div
            ref={outputRef1}
            className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-500/40 bg-slate-900 shadow-xl text-cyan-400 group hover:scale-110 transition-transform"
            title="Portal QR Público"
          >
            <QrCode className="h-6 w-6" />
          </div>
          <div
            ref={outputRef2}
            className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-500/40 bg-slate-900 shadow-xl text-emerald-400 group hover:scale-110 transition-transform"
            title="Inspector / Auditor SRT & ART"
          >
            <Award className="h-6 w-6" />
          </div>
        </div>

      </div>

      {/* Animated Beams connecting inputs -> center -> outputs */}
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={inputRef1}
        toRef={centerRef}
        gradientStartColor="#10b981"
        gradientStopColor="#14b8a6"
        duration={3}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={inputRef2}
        toRef={centerRef}
        gradientStartColor="#14b8a6"
        gradientStopColor="#06b6d4"
        duration={3.5}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={centerRef}
        toRef={outputRef1}
        gradientStartColor="#10b981"
        gradientStopColor="#06b6d4"
        duration={2.8}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={centerRef}
        toRef={outputRef2}
        gradientStartColor="#06b6d4"
        gradientStopColor="#10b981"
        duration={3.2}
      />
    </div>
  );
}

// ─── MAIN CRYPTO BENTO GRID EXPORT ────────────────────────────────────────────
export function CryptoBentoGrid() {
  const { language } = useLanguage();

  const features = [
    // 1. MARQUEE CARD (col-span-3 lg:col-span-1)
    {
      Icon: Lock,
      name: language === 'en' ? "Cryptographic Hashing & Payload" : "Payloads & Sello SHA-256",
      description: language === 'en'
        ? "Automatic cryptographic fingerprinting for every delivery receipt."
        : "Generación de huellas digitales inmutables por cada constancia de entrega.",
      href: "#seguridad-criptografica",
      cta: language === 'en' ? "Learn more" : "Ver especificación",
      className: "col-span-3 lg:col-span-1",
      background: (
        <Marquee
          pauseOnHover
          className="absolute top-10 [mask-image:linear-gradient(to_top,transparent_30%,#000_100%)] [--duration:22s]"
        >
          {cryptoFiles.map((f, idx) => {
            const ItemIcon = f.icon;
            return (
              <figure
                key={idx}
                className={cn(
                  "relative w-36 cursor-pointer overflow-hidden rounded-xl border p-3 text-left",
                  "border-slate-800/90 bg-slate-900/60 hover:bg-slate-900/90 hover:border-emerald-500/40",
                  "transform-gpu blur-[0.5px] transition-all duration-300 ease-out hover:blur-none hover:scale-105 shadow-md"
                )}
              >
                <div className="flex flex-row items-center gap-2 mb-1.5">
                  <div className="w-6 h-6 rounded-md bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <ItemIcon className="w-3.5 h-3.5" />
                  </div>
                  <figcaption className="text-[11px] font-mono font-bold text-white truncate">
                    {f.name}
                  </figcaption>
                </div>
                <blockquote className="text-[10px] font-sans text-slate-400 line-clamp-2 leading-relaxed">
                  {f.body}
                </blockquote>
                <div className="mt-2 flex items-center justify-between border-t border-slate-800/60 pt-1.5 text-[9px] font-mono">
                  <span className="text-emerald-400 font-semibold">{f.badge}</span>
                  <span className="text-slate-500">✓ Inalterable</span>
                </div>
              </figure>
            );
          })}
        </Marquee>
      ),
    },

    // 2. ANIMATED LIST CARD (col-span-3 lg:col-span-2)
    {
      Icon: Bell,
      name: language === 'en' ? "Real-Time Audit Stream" : "Notificaciones & Audit Trail",
      description: language === 'en'
        ? "Live cryptographic activity log capturing IP, GPS, e-signatures, and QR verification."
        : "Registro en tiempo real de eventos legales, firmas en tablet y validaciones QR.",
      href: "#seguridad-criptografica",
      cta: language === 'en' ? "Audit logs" : "Explorar logs",
      className: "col-span-3 lg:col-span-2",
      background: (
        <div className="absolute top-4 right-2 h-[300px] w-full scale-90 sm:scale-95 border-none [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] transition-all duration-300 ease-out group-hover:scale-100">
          <AnimatedList delay={2400}>
            {auditNotifications.map((item, idx) => (
              <NotificationItem key={idx} {...item} />
            ))}
          </AnimatedList>
        </div>
      ),
    },

    // 3. ANIMATED BEAM CARD (col-span-3 lg:col-span-2)
    {
      Icon: Share2,
      name: language === 'en' ? "Cryptographic Traceability Pipeline" : "Pipeline de Trazabilidad Legal",
      description: language === 'en'
        ? "Seamless encrypted flow from field touch signature to public QR inspector validation."
        : "Flujo cifrado ininterrumpido desde la firma en pantalla hasta el portal QR público.",
      href: "#seguridad-criptografica",
      cta: language === 'en' ? "View architecture" : "Ver arquitectura",
      className: "col-span-3 lg:col-span-2",
      background: (
        <div className="absolute top-2 right-0 left-0 h-[300px] border-none [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] transition-all duration-300 ease-out group-hover:scale-105">
          <AnimatedBeamCryptoFlow />
        </div>
      ),
    },

    // 4. CALENDAR AUDIT CARD (col-span-3 lg:col-span-1)
    {
      Icon: CalendarIcon,
      name: language === 'en' ? "Temporal Audit & Compliance" : "Control Temporal & Inspección",
      description: language === 'en'
        ? "Filter signed receipts and verify expiration validity across time."
        : "Filtrado cronológico de constancias y validación de vencimientos normativos.",
      href: "#seguridad-criptografica",
      cta: language === 'en' ? "Calendar view" : "Ver calendario",
      className: "col-span-3 lg:col-span-1",
      background: (
        <Calendar
          mode="single"
          selected={new Date(2026, 7, 21)}
          className="absolute top-8 right-2 origin-top scale-75 rounded-xl border border-slate-800 bg-slate-900/90 text-white [mask-image:linear-gradient(to_top,transparent_30%,#000_100%)] transition-all duration-300 ease-out group-hover:scale-85 shadow-2xl"
        />
      ),
    },
  ];

  return (
    <BentoGrid className="max-w-6xl mx-auto">
      {features.map((feature, idx) => (
        <BentoCard key={idx} {...feature} />
      ))}
    </BentoGrid>
  );
}

export default CryptoBentoGrid;

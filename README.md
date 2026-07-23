# 🛡️ Sentinel Alerts / IfsinRem — Arquitectura y Documentación Técnica

Bienvenido a la documentación técnica oficial a nivel de código de **Sentinel Alerts / IfsinRem**. Este documento detalla la arquitectura de software, stack tecnológico, estructura del proyecto, esquema de base de datos, flujos criptográficos de verificación y procedimientos de despliegue.

---

## 📐 1. Visión General del Sistema

**Sentinel Alerts / IfsinRem** es un sistema SaaS **Multi-tenant** diseñado para la **Gestión Inteligente de Vencimientos y Alertas** (laborales, fiscales, contractuales y normativas) y el **Control Legal de Entregas de Equipos de Protección Personal (EPP)** con firma digitalizada, certificación criptográfica y verificación pública por código QR.

### Core Business Capabilities:
1. **Gestión de Alertas y Obligaciones**: Monitorización de vencimientos recurrentes con cálculo dinámico de puntuación de cumplimiento (*Compliance Score*).
2. **Control y Emisión de EPP (Formulario 299/11 SRT)**: Registro de entregas de ropa de trabajo y elementos de seguridad laboral a operarios.
3. **Firma Digitalizada & Integridad Criptográfica**: Captura de firmas en pantalla mediante HTML5 Canvas, generación de **Hash SHA-256** derivado de metadata legal (IDs, timestamp, IP, geolocalización) y almacenamiento inmutable.
4. **Verificación Pública de Constancias (QR / URL)**: Portal público protegido por RLS donde auditores externos o inspectores pueden escanear el código QR impreso en la constancia PDF y validar su validez digital en tiempo real.
5. **Notificaciones Omnicanal**: Envío de alertas automatizadas vía **Email** (Resend API) y **WhatsApp** (Twilio API).
6. **Asistente Normativo con IA**: Integración con Deno Edge Functions y LLMs (Anthropic Claude / OpenAI) para absolver consultas normativas e interpretación de leyes laborales/fiscales.
7. **PWA (Progressive Web App)**: Funcionalidad ejecutable como aplicación nativa en dispositivos móviles y de escritorio mediante Service Workers.

---

## 🛠️ 2. Stack Tecnológico

### Frontend Stack
* **Librería Core**: [React 18](https://react.dev/) + [TypeScript 5](https://www.typescriptlang.org/)
* **Build Tool & Dev Server**: [Vite 5](https://vitejs.dev/) con compilación ultrarrápida `@vitejs/plugin-react-swc`
* **Estilos & UI**: [Tailwind CSS 3](https://tailwindcss.com/) + `tailwindcss-animate` + `@tailwindcss/typography`
* **Componentes Primitivos**: [Radix UI](https://www.radix-ui.com/) (Accordion, Dialog, Dropdown, Tabs, Tooltips, Toasts, etc.)
* **Iconografía & Animaciones**: [Lucide React](https://lucide.dev/) + [Framer Motion](https://www.framer.com/motion/)
* **Gestión de Estado Asíncrono & Caching**: [TanStack React Query v5](https://tanstack.com/query/latest)
* **Enrutamiento**: [React Router DOM v6](https://reactrouter.com/)
* **Validación de Formularios**: `react-hook-form` + `zod` + `@hookform/resolvers`
* **Generación de Documentos & QR**: `jspdf` + `jspdf-autotable` para PDF legal, `qrcode` para rendering de códigos QR
* **Soporte PWA**: `vite-plugin-pwa` (Workbox Service Worker, manifests, offline caching)

### Backend & Serverless (BaaS - Supabase)
* **Base de Datos**: PostgreSQL con **Row Level Security (RLS)** para aislamiento Multi-Tenant.
* **Autenticación**: Supabase Auth (JWT token-based auth).
* **Storage**: Supabase Storage Buckets (Logos de empresas, firmas digitalizadas).
* **Edge Functions (Deno Runtime)**:
  - `send-email`: Envío transaccional y de alertas vía Resend SDK.
  - `send-whatsapp`: Despacho de alertas a WhatsApp mediante Twilio REST API.
  - `mp-webhook`: Webhook listener para cobros y suscripciones de Mercado Pago.
  - `ai-assistant`: Asistente de inteligencia artificial para normativas.
  - `google-calendar-sync` / `google-oauth-callback`: Sincronización de eventos con Google Calendar.
  - `create-user`: Provisionamiento seguro de usuarios administrativos.

---

## 📁 3. Estructura del Código Fuente

```text
sentinel-alerts/
├── public/                     # Archivos estáticos y manifest PWA
├── scripts/                    # Scripts de soporte/mantenimiento
├── supabase/                   # Configuración del Backend Supabase
│   ├── config.toml             # Configuración CLI Supabase
│   ├── functions/              # Deno Edge Functions
│   │   ├── ai-assistant/       # Edge function para consultas con IA
│   │   ├── create-user/        # Alta administrativa de usuarios
│   │   ├── google-calendar-sync/ # Sincronización bidireccional de calendario
│   │   ├── google-oauth-callback/
│   │   ├── mp-webhook/         # Webhook de suscripciones Mercado Pago
│   │   ├── send-email/         # Integración Resend API
│   │   └── send-whatsapp/      # Integración Twilio API
│   └── migrations/             # Migraciones SQL de PostgreSQL (RLS, Triggers, Views)
├── src/
│   ├── components/             # Componentes reutilizables
│   │   ├── ai/                 # Componentes del asistente IA
│   │   ├── ui/                 # Componentes Shadcn UI / Radix
│   │   ├── Header.tsx          # Barra de navegación principal
│   │   ├── SignaturePad.tsx    # Pad de captura de firma manuscrita Canvas
│   │   ├── UserTable.tsx       # Grilla de gestión de usuarios
│   │   └── InviteUserDialog.tsx# Modal para invitar operarios/miembros
│   ├── contexts/               # Contextos de React
│   │   ├── AuthContext.tsx     # Estado global de sesión, perfil, rol y empresa active
│   │   └── LanguageContext.tsx # Internacionalización y localización
│   ├── hooks/                  # Custom React Hooks
│   ├── integrations/           # Clientes de integración externa
│   │   └── supabase/           # Cliente instanciado y tipos autogenerados (`client.ts`, `types.ts`)
│   ├── lib/                    # Utilidades auxiliares (`utils.ts`)
│   ├── pages/                  # Páginas / Vistas principales
│   │   ├── Auth.tsx            # Iniciar Sesión / Registro de Usuarios
│   │   ├── Dashboard.tsx       # Panel de control de alertas y score de cumplimiento
│   │   ├── Employees.tsx       # Módulo de alta y ficha de operarios
│   │   ├── EPPInventory.tsx    # Inventario de EPPs y registro de Entregas con Firma
│   │   ├── Reports.tsx         # Reportes exportables e métricas de entregas
│   │   ├── UserSettings.tsx   # Configuración de perfil y branding de empresa
│   │   ├── VerifyDelivery.tsx  # Portal público de verificación de constancias PDF por QR
│   │   └── Welcome.tsx        # Onboarding inicial
│   ├── services/               # Servicios de lógica de negocio (API layer)
│   │   ├── eppService.ts       # CRUD EPP, entregas, cálculo de Hash SHA-256 y PDF generator
│   │   ├── userService.ts      # Gestión de usuarios, roles y permisos
│   │   ├── companyService.ts   # Configuración y branding multi-empresa
│   │   ├── emailService.ts     # Invoca Edge Function de Email
│   │   └── googleCalendarSync.ts
│   ├── App.tsx                 # Configuración de Router y Providers
│   ├── main.tsx                # Punto de entrada Vite React
│   └── index.css               # Estilos globales y tokens CSS de Tailwind
├── package.json
├── tailwind.config.ts
├── vite.config.ts              # Aliases (`@`), PWA setup y SWC setup
└── tsconfig.json
```

---

## 🗄️ 4. Modelo de Datos y Seguridad (Multi-Tenancy & RLS)

### Aislamiento Multi-Empresa (`companies`)
Toda la información operativa pertenece a una **Empresa** (`company_id`). El archivo `AuthContext.tsx` resuelve automáticamente el `company_id` del usuario autenticado y lo inyecta en cada llamada a la base de datos.

### Tablas Principales:
* **`companies`**: Datos de la empresa (Nombre, CUIT, `logo_url`, fecha de creación).
* **`profiles`**: Datos del usuario (Nombre, Email, Teléfono, `company_id`, Plan contratado).
* **`user_roles`**: Roles de acceso (`admin`, `owner`, `member`) asociados al `user_id`.
* **`employees`**: Ficha técnica de operarios (DNI/CUIL, Legajo, Puesto de Trabajo, EPPs requeridos según puesto).
* **`epp_items`**: Catálogo de EPPs en inventario (Nombre, Categoría, Marca, Modelo, Organismo de Certificación IRAM/IQC, Número de Certificado, Stock disponible).
* **`epp_deliveries`**: Registro de constancias de entrega.
  - `signature_path`: Firma en formato Base64/SVG.
  - `hash_sha256`: Hash criptográfico de verificación.
  - `geolocation`, `ip_address`, `device_info`: Evidencia de auditoría.
* **`obligations` & `obligation_notifications`**: Reglas de alerta para impuestos, licencias, capacitaciones o vencimientos legales.

### Seguridad y Polícas RLS (Row Level Security)
1. **Acceso Autenticado Multi-tenant**: Un usuario solo puede leer/modificar filas donde `company_id` coincida con el `company_id` de su perfil.
2. **Acceso Público de Verificación (`20260723_public_verification_rls.sql`)**: 
   - La tabla `epp_deliveries` cuenta con una política RLS permisiva de **lectura anónima** orientada *exclusivamente* a consultas de verificación mediante la vista/función pública `/verificar-constancia/:id`.

---

## ⚡ 5. Flujos Técnicos Clave a Nivel Código

### A. Registro y Firma Digital de Entrega de EPP (`eppService.ts` & `SignaturePad.tsx`)
1. El supervisor selecciona el operario y los elementos a entregar desde [EPPInventory.tsx](file:///d:/proyectos/sentinel-alerts/src/pages/EPPInventory.tsx).
2. El operario firma en pantalla usando el componente [SignaturePad.tsx](file:///d:/proyectos/sentinel-alerts/src/components/SignaturePad.tsx).
3. **Cálculo de Hash Criptográfico**: `eppService.ts` genera una cadena canónica con los datos clave:
   ```typescript
   const payload = `${companyId}|${employeeId}|${eppItemId}|${quantity}|${deliveryDate}|${signatureData}`;
   const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload));
   const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
   ```
4. **Generación del PDF Legal (Formulario 299/11 SRT)**:
   - Se compila el documento PDF mediante `jsPDF` y `jspdf-autotable`.
   - Se renderiza un código QR que apunta a `https://<dominio>/verificar-constancia/<delivery_id>`.
   - Se insertan la firma digitalizada, el Hash SHA-256 y la marca gráfica de la empresa.

### B. Verificación de Autenticidad (`VerifyDelivery.tsx`)
1. Cuando un auditor o inspector escanea el QR del acta impresa, la SPA carga el componente [VerifyDelivery.tsx](file:///d:/proyectos/sentinel-alerts/src/pages/VerifyDelivery.tsx).
2. La app ejecuta la consulta pública mediante el id de entrega.
3. Se verifica si el registro existe en la base de datos y se compara la firma e integridad del Hash registrado contra los datos de la entrega, mostrando una **Insignia Verde de Verificación Legal**.

### C. Sistema de Notificaciones de Vencimiento (`send-email` y `send-whatsapp`)
1. Las Edge Functions leen la fecha de vencimiento (`daysUntilDue`) y el destinatario.
2. `send-email` envía una plantilla HTML estilizada mediante **Resend**.
3. `send-whatsapp` da formato al número telefónico y realiza un `POST` a la API de **Twilio Messages**, incluyendo emoticones de urgencia según la proximidad del vencimiento (🚨 Vencida, ⚠️ Vence hoy, 📅 Próximo).

---

## 🔑 6. Variables de Entorno (.env)

Crea o configura tu archivo `.env` en la raíz del proyecto con las siguientes claves:

```bash
# Supabase Backend Configuration
VITE_SUPABASE_PROJECT_ID="tu-project-id"
VITE_SUPABASE_PUBLISHABLE_KEY="tu-anon-key"
VITE_SUPABASE_URL="https://tu-project-id.supabase.co"

# Servicios de Alertas & Email (Frontend / Dev)
VITE_RESEND_API_KEY="re_..."
VITE_RESEND_FROM_EMAIL="IfsinRem <no-reply@tu-dominio.com>"

# Edge Functions Secrets (Configurables en Supabase Dashboard -> Secrets)
RESEND_API_KEY="re_..."
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
TWILIO_WHATSAPP_FROM="whatsapp:+14155238886"
MERCADOPAGO_ACCESS_TOKEN="APP_USR-..."
```

---

## 🚀 7. Guía de Instalación y Ejecución Local

### Prerrequisitos
* **Node.js**: v18.0.0 o superior
* **Administrador de paquetes**: `npm`, `pnpm` o `bun`

### Pasos de Instalación
1. **Clonar el repositorio**:
   ```bash
   git clone <repository-url>
   cd sentinel-alerts
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   # o con bun:
   bun install
   ```

3. **Iniciar el servidor de desarrollo**:
   ```bash
   npm run dev
   ```
   La aplicación se abrirá automáticamente en `http://localhost:8080`.

4. **Compilar para Producción**:
   ```bash
   npm run build
   ```

5. **Previsualizar la Build de Producción**:
   ```bash
   npm run preview
   ```

---

## 📜 8. Licencia y Cumplimiento Normativo

Desarrollado bajo los estándares de seguridad industrial y protección de datos. Diseñado conforme a las resoluciones de Seguridad e Higiene Laboral (como la Res. SRT 299/11 de Argentina) para la validez digital de la entrega de Elementos de Protección Personal.
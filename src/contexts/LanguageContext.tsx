import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type Language = 'es' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const translations = {
  es: {
    // Header & Navigation
    'header.login': 'Iniciar sesión',
    'header.scheduleDemo': 'Agendar Demo',
    'nav.dashboard': 'Dashboard',
    'nav.employees': 'Operarios',
    'nav.inventory': 'Inventario',
    'nav.reports': 'Reportes',
    'nav.users': 'Usuarios',
    'nav.settings': 'Configuración',
    'nav.logout': 'Cerrar sesión',

    // Hero Section
    'hero.badge': 'Res. SRT 299/11 · Firma Digital en Obra',
    'hero.title1': 'Entrega de EPP y',
    'hero.titleGradient': 'Planilla 299 SRT',
    'hero.title2': 'en 1 Clic.',
    'hero.subtitle': 'Registrá entregas por voz en obra, recolectá la firma táctil del trabajador en tu celular y generá la constancia legal inalterable con código QR.',
    'hero.btnStart': 'Comenzar ahora',
    'hero.btnDemo': 'Agendar Demo en Vivo',
    'hero.legalVal': '⚖️ Validez Jurídica:',
    'hero.legalValDesc': 'Conforme a Resolución SRT 299/11 y validez de firmas electrónicas/manuscritas según el Código Civil y Comercial.',

    // Stats Bar
    'stats.f299': 'F. 299/11',
    'stats.f299Desc': 'generación automática en PDF firmada al instante',
    'stats.clicks': '3 clics',
    'stats.clicksDesc': 'desde cualquier celular para registrar una entrega',
    'stats.paperless': '0 papeles',
    'stats.paperlessDesc': 'trazabilidad legal completa y blindada ante auditorías',

    // Control Operativo
    'control.tag': 'Control Operativo de EPP',
    'control.title1': 'Firma manuscrita digital.',
    'control.title2': 'Trazabilidad inmediata.',
    'control.desc': 'Olvidate de imprimir planillas, buscar al operario para que firme, y archivar biblioratos. El supervisor entrega la protección y el operario firma con el dedo en el celular del supervisor. Todo queda guardado.',
    'control.feat1Title': 'Alta Express',
    'control.feat1Desc': 'Cargá operarios por DNI o CUIL desde el campo en 10 segundos.',
    'control.feat2Title': 'Historial por Trabajador',
    'control.feat2Desc': 'Sabé exactamente qué elementos se le entregaron a cada persona y cuándo vencen.',
    'control.feat3Title': 'Búsqueda por Voz',
    'control.feat3Desc': 'Consultá entregas anteriores diciendo el nombre del trabajador.',

    // Workflow & Simulator
    'workflow.tag': 'Interactúa con el sistema',
    'workflow.title': '¿Cómo funciona ifsinrem?',
    'workflow.subtitle': 'Diseñado específicamente para el trabajo de campo. Mirá cómo reemplazamos las planillas de papel en 3 simples pasos interactivos.',
    'workflow.step1Title': '1. Carga Inteligente por Voz',
    'workflow.step1Sub': 'Dictado en campo sin tipear',
    'workflow.step1Desc': 'El supervisor presiona un botón y habla de forma natural. Nuestra IA interpreta nombres, talles y elementos de protección en tiempo real.',
    'workflow.step2Title': '2. Firma Digital & Audit Trail',
    'workflow.step2Sub': 'IP, Geolocalización GPS y Registro Muestra',
    'workflow.step2Desc': 'El operario dibuja su firma táctil. El sistema registra la IP de la obra, ubicación GPS y sello de inalterabilidad.',
    'workflow.step3Title': '3. Planilla 299/11 Oficial',
    'workflow.step3Sub': 'Cumplimiento legal automático',
    'workflow.step3Desc': 'El sistema genera al instante el PDF oficial con el formato exacto exigido por la Superintendencia de Riesgos del Trabajo (SRT).',
    'workflow.step4Title': '4. Código QR & Verificación Pública',
    'workflow.step4Sub': 'Sello Criptográfico SHA-256 e Inspección ART',
    'workflow.step4Desc': 'Cada planilla incluye un código QR único. Al escanearlo desde cualquier teléfono, se valida la constancia inalterable en tiempo real ante la SRT/ART.',

    // Legal Feature
    'legal.tag': 'RESOLUCIÓN SRT 299/11',
    'legal.title': '¿Es legal el registro digital de EPP?',
    'legal.desc': 'Sí, la Superintendencia de Riesgos del Trabajo (SRT) y el Código Civil y Comercial de la Nación habilitan y validan legalmente el formato digital y la firma electrónica para la entrega de elementos de protección. ifsinrem genera la Planilla 299 oficial firmada digitalmente, lista ante inspecciones del Ministerio de Trabajo o demandas de ART.',
    'legal.btn': 'Digitalizar mi gestión',

    // Demo Section
    'demo.badge': 'Demo 1:1 · Sin cargo',
    'demo.title1': 'Hablemos de tu empresa.',
    'demo.title2': 'Diseñemos tu plan.',
    'demo.desc': 'Coordinamos una llamada corta de 15 a 20 minutos para revisar tu operativa actual de entrega de EPP y configurar tu entorno de pruebas.',
    'demo.btnCalendly': 'Agendar demo en Calendly',

    // Footer
    'footer.description': 'Gestión Inteligente de EPP y Documentación Laboral con Inteligencia Artificial. Blindá tu empresa ante reclamos e inspecciones.',
    'footer.quickLinks': 'Enlaces rápidos',
    'footer.home': 'Inicio',
    'footer.features': '¿Por qué IfsinRem?',
    'footer.pricing': 'Precios',
    'footer.contact': 'Contacto y Soporte',
    'footer.copyright': 'Todos los derechos reservados.',

    // Auth & Login / Register
    'auth.badge': 'Control Absoluto en Obra',
    'auth.heroTitle': 'Digitalizá el control de seguridad laboral.',
    'auth.heroDesc': 'Entregá equipos de protección personal, firmá planillas oficiales 299/11 digitalmente y blindá tu empresa ante contingencias legales.',
    'auth.feat1Title': 'Firma digital manuscrita',
    'auth.feat1Desc': 'El operario firma directo con el dedo desde el celular en obra',
    'auth.feat2Title': 'Asistente por voz con IA',
    'auth.feat2Desc': 'Dictá registros hablando: \'Casco amarillo para Carlos hoy\'',
    'auth.feat3Title': 'Planilla 299/11 automática',
    'auth.feat3Desc': 'PDF oficial compilado al instante para auditorías y ART',

    'auth.secureAccess': 'Acceso Seguro',
    'auth.welcomeBack': '¡Hola de nuevo!',
    'auth.registerCompany': 'Completar Registro de Invitación',
    'auth.recoverPassword': 'Recuperar Contraseña',
    'auth.newPassword': 'Nueva Contraseña',

    'auth.restrictedTitle': 'Registro Restringido',
    'auth.restrictedDesc': 'El registro público está deshabilitado. Las cuentas son creadas y gestionadas únicamente por un Administrador o SuperAdmin.',

    'auth.subLogin': 'Ingresá tus credenciales corporativas para continuar',
    'auth.subSignup': 'Ingresá los datos para completar tu registro de usuario invitado',
    'auth.subForgot': 'Te enviaremos un email con el enlace para restablecerla',
    'auth.subReset': 'Ingresá tu nueva clave de acceso',

    'auth.managerName': 'Nombre del Responsable *',
    'auth.managerNamePlaceholder': 'Ej: Ing. Juan Pérez',
    'auth.companyName': 'Nombre de la Empresa *',
    'auth.companyNamePlaceholder': 'Ej: Empresa S.A.',
    'auth.phone': 'Celular / Teléfono',
    'auth.phonePlaceholder': 'Ej: +54 9 387 123 4567',
    'auth.corporateEmail': 'Email Corporativo *',
    'auth.corporateEmailPlaceholder': 'ejemplo@constructora.com',
    'auth.password': 'Contraseña *',
    'auth.passwordResetLabel': 'Nueva Contraseña *',
    'auth.passwordPlaceholder': 'Mínimo 6 caracteres',

    'auth.btnProcessing': 'Procesando...',
    'auth.btnDashboard': 'Acceder al Dashboard',
    'auth.btnRegister': 'Completar Registro',
    'auth.btnSendReset': 'Enviar Enlace de Recuperación',
    'auth.btnUpdatePassword': 'Actualizar Contraseña',

    'auth.hasAccount': '¿Ya tenés una cuenta? Iniciar Sesión',
    'auth.forgotPassword': '¿Olvidaste tu contraseña?',
    'auth.backToLogin': 'Volver al Inicio de Sesión',

    'auth.terms': 'Al registrarte, confirmás que aceptás nuestros términos de servicio y políticas de seguridad informática de obra.',
    'auth.activeSession': 'Sesión activa iniciada',
    'auth.inviteNotice': 'Estás intentando registrar la invitación para {email}. Para continuar con el nuevo registro, es necesario cerrar la sesión actual.',
    'auth.logoutToRegister': 'Cerrar Sesión Actual para Registrar',

    'auth.toastEnterEmail': 'Por favor ingresa tu correo electrónico',
    'auth.toastResetSent': 'Correo de recuperación enviado con éxito. Revisá tu bandeja de entrada.',
    'auth.toastEnterNewPass': 'Por favor ingresa tu nueva contraseña',
    'auth.toastPassLength': 'La contraseña debe tener al menos 6 caracteres',
    'auth.toastPassUpdated': 'Contraseña actualizada con éxito',
    'auth.toastFillAll': 'Por favor completa todos los campos',
    'auth.toastFillName': 'Por favor completa tu nombre',
    'auth.toastFillRequired': 'Por favor completa los campos obligatorios',
    'auth.toastInvalidPhone': 'Por favor ingresa un número de teléfono válido',
    'auth.toastInvalidCreds': 'Credenciales incorrectas',
    'auth.toastWelcomeBack': 'Bienvenido de vuelta',
    'auth.toastEmailRegistered': 'Este email ya está registrado',
    'auth.toastRateLimit': 'Límite de emails alcanzado. Esperá unos minutos o desactivá la confirmación por email en Supabase.',
    'auth.toastConfirmEmail': 'Revisá tu correo para confirmar la cuenta y luego iniciá sesión.',
    'auth.toastAccountCreated': 'Cuenta creada exitosamente',
    'auth.toastLoggedOut': 'Sesión cerrada. Podés completar el registro del invitado.',
    'auth.toastSignupError': 'Error de registro',
    'auth.toastAccountFail': 'No se pudo crear la cuenta. Si ya tenés cuenta, iniciá sesión.',
  },
  en: {
    // Header & Navigation
    'header.login': 'Log in',
    'header.scheduleDemo': 'Schedule Demo',
    'nav.dashboard': 'Dashboard',
    'nav.employees': 'Workers',
    'nav.inventory': 'Inventory',
    'nav.reports': 'Reports',
    'nav.users': 'Users',
    'nav.settings': 'Settings',
    'nav.logout': 'Log out',

    // Hero Section
    'hero.badge': 'Res. SRT 299/11 · On-Site Digital Signature',
    'hero.title1': 'PPE Delivery &',
    'hero.titleGradient': 'SRT Form 299',
    'hero.title2': 'in 1 Click.',
    'hero.subtitle': 'Record deliveries by voice on-site, collect the worker\'s touch signature on your phone, and generate unalterable legal receipts with QR codes.',
    'hero.btnStart': 'Get Started Now',
    'hero.btnDemo': 'Schedule Live Demo',
    'hero.legalVal': '⚖️ Legal Validity:',
    'hero.legalValDesc': 'Compliant with SRT Resolution 299/11 and electronic/manuscript signature validity under the Civil and Commercial Code.',

    // Stats Bar
    'stats.f299': 'Form 299/11',
    'stats.f299Desc': 'instant automatic PDF generation & signed on the spot',
    'stats.clicks': '3 clicks',
    'stats.clicksDesc': 'from any mobile device to record a delivery',
    'stats.paperless': '0 paper',
    'stats.paperlessDesc': 'complete legal traceability audit-proof',

    // Control Operativo
    'control.tag': 'PPE Operational Control',
    'control.title1': 'Digital manuscript signature.',
    'control.title2': 'Instant traceability.',
    'control.desc': 'Forget printing forms, tracking down workers for signatures, and archiving binders. Supervisors deliver equipment and workers sign with a finger on the phone. Everything is logged securely.',
    'control.feat1Title': 'Express Onboarding',
    'control.feat1Desc': 'Register workers by ID from the field in 10 seconds.',
    'control.feat2Title': 'Worker History',
    'control.feat2Desc': 'Know exactly which items were delivered to each person and when they expire.',
    'control.feat3Title': 'Voice Search',
    'control.feat3Desc': 'Query previous deliveries simply by speaking the worker\'s name.',

    // Workflow & Simulator
    'workflow.tag': 'Interact with the system',
    'workflow.title': 'How does ifsinrem work?',
    'workflow.subtitle': 'Designed specifically for field work. See how we replace paper forms in 3 simple interactive steps.',
    'workflow.step1Title': '1. Smart Voice Recording',
    'workflow.step1Sub': 'On-site dictation without typing',
    'workflow.step1Desc': 'The supervisor presses a button and speaks naturally. Our AI interprets names, sizes, and protective items in real time.',
    'workflow.step2Title': '2. Digital Signature & Audit Trail',
    'workflow.step2Sub': 'IP, GPS Location & Sample Record',
    'workflow.step2Desc': 'The worker draws a touch signature. The system logs site IP, GPS location, and unalterability seal.',
    'workflow.step3Title': '3. Official Form 299/11',
    'workflow.step3Sub': 'Automatic legal compliance',
    'workflow.step3Desc': 'The system instantly generates the official PDF in the exact format required by the Superintendency of Occupational Risks (SRT).',
    'workflow.step4Title': '4. QR Code & Public Verification',
    'workflow.step4Sub': 'SHA-256 Cryptographic Seal & ART Inspection',
    'workflow.step4Desc': 'Each form includes a unique QR code. Scanning it from any phone validates the unalterable receipt in real time for SRT/ART.',

    // Legal Feature
    'legal.tag': 'RESOLUTION SRT 299/11',
    'legal.title': 'Is digital PPE recording legal?',
    'legal.desc': 'Yes, the Superintendency of Occupational Risks (SRT) and the Civil and Commercial Code legally validate digital formats and electronic signatures for PPE delivery. ifsinrem generates official Form 299 digitally signed, ready for Labor Ministry inspections or insurance audits.',
    'legal.btn': 'Digitize my management',

    // Demo Section
    'demo.badge': '1:1 Demo · Free of charge',
    'demo.title1': 'Let\'s talk about your company.',
    'demo.title2': 'Let\'s design your plan.',
    'demo.desc': 'We coordinate a short 15-20 minute call to review your current PPE delivery operation and set up your sandbox environment.',
    'demo.btnCalendly': 'Book demo on Calendly',

    // Footer
    'footer.description': 'Smart PPE Management & Labor Documentation powered by AI. Protect your company against claims and audits.',
    'footer.quickLinks': 'Quick links',
    'footer.home': 'Home',
    'footer.features': 'Why IfsinRem?',
    'footer.pricing': 'Pricing',
    'footer.contact': 'Contact & Support',
    'footer.copyright': 'All rights reserved.',

    // Auth & Login / Register
    'auth.badge': 'Absolute On-Site Control',
    'auth.heroTitle': 'Digitize workplace safety management.',
    'auth.heroDesc': 'Deliver personal protective equipment, sign official 299/11 forms digitally, and shield your company against legal risks.',
    'auth.feat1Title': 'Digital manuscript signature',
    'auth.feat1Desc': 'Workers sign directly with their finger on mobile phones on-site',
    'auth.feat2Title': 'AI Voice Assistant',
    'auth.feat2Desc': 'Dictate records by speaking: \'Yellow helmet for Carlos today\'',
    'auth.feat3Title': 'Automatic Form 299/11',
    'auth.feat3Desc': 'Official PDF compiled instantly for audits and insurance',

    'auth.secureAccess': 'Secure Access',
    'auth.welcomeBack': 'Welcome back!',
    'auth.registerCompany': 'Complete Invitation Registration',
    'auth.recoverPassword': 'Reset Password',
    'auth.newPassword': 'New Password',

    'auth.restrictedTitle': 'Restricted Registration',
    'auth.restrictedDesc': 'Public signup is disabled. Accounts are created and managed exclusively by an Administrator or SuperAdmin.',

    'auth.subLogin': 'Enter your corporate credentials to continue',
    'auth.subSignup': 'Enter your details to complete your invited user registration',
    'auth.subForgot': 'We will send you an email with a link to reset your password',
    'auth.subReset': 'Enter your new access password',

    'auth.managerName': 'Manager Name *',
    'auth.managerNamePlaceholder': 'e.g., Eng. John Doe',
    'auth.companyName': 'Company Name *',
    'auth.companyNamePlaceholder': 'e.g., Acme Corp.',
    'auth.phone': 'Mobile / Phone',
    'auth.phonePlaceholder': 'e.g., +1 555 123 4567',
    'auth.corporateEmail': 'Corporate Email *',
    'auth.corporateEmailPlaceholder': 'example@company.com',
    'auth.password': 'Password *',
    'auth.passwordResetLabel': 'New Password *',
    'auth.passwordPlaceholder': 'Minimum 6 characters',

    'auth.btnProcessing': 'Processing...',
    'auth.btnDashboard': 'Access Dashboard',
    'auth.btnRegister': 'Complete Registration',
    'auth.btnSendReset': 'Send Recovery Link',
    'auth.btnUpdatePassword': 'Update Password',

    'auth.hasAccount': 'Already have an account? Log in',
    'auth.forgotPassword': 'Forgot your password?',
    'auth.backToLogin': 'Back to Login',

    'auth.terms': 'By signing up, you confirm that you accept our terms of service and jobsite security policies.',
    'auth.activeSession': 'Active session logged in',
    'auth.inviteNotice': 'You are attempting to register the invitation for {email}. To continue, you must log out of the current session.',
    'auth.logoutToRegister': 'Log Out Current Session to Register',

    'auth.toastEnterEmail': 'Please enter your email address',
    'auth.toastResetSent': 'Recovery email sent successfully. Please check your inbox.',
    'auth.toastEnterNewPass': 'Please enter your new password',
    'auth.toastPassLength': 'Password must be at least 6 characters long',
    'auth.toastPassUpdated': 'Password updated successfully',
    'auth.toastFillAll': 'Please fill in all fields',
    'auth.toastFillName': 'Please enter your name',
    'auth.toastFillRequired': 'Please fill in all required fields',
    'auth.toastInvalidPhone': 'Please enter a valid phone number',
    'auth.toastInvalidCreds': 'Invalid login credentials',
    'auth.toastWelcomeBack': 'Welcome back',
    'auth.toastEmailRegistered': 'This email is already registered',
    'auth.toastRateLimit': 'Email limit reached. Please wait a few minutes or disable email confirmation in Supabase.',
    'auth.toastConfirmEmail': 'Check your email to confirm your account, then log in.',
    'auth.toastAccountCreated': 'Account created successfully',
    'auth.toastLoggedOut': 'Logged out. You can now complete guest registration.',
    'auth.toastSignupError': 'Registration error',
    'auth.toastAccountFail': 'Could not create account. If you already have an account, please log in.',
  }
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved === 'en' || saved === 'es') ? saved : 'es';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['es']] || key;
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

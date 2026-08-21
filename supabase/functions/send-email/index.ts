import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const RESEND_FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL") || "IfsinRem <no-reply@ifsinrem.site>";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};


interface EmailRequest {
  to: string;
  type?: 'alert' | 'invitation' | 'test';
  userName: string;
  obligationName?: string;
  daysUntilDue?: number;
  dueDate?: string;
  obligationId?: string;
  invitedBy?: string;
  inviteLink?: string;
  isTestEmail?: boolean;
  recipientEmail?: string;
}

/**
 * Generates professional HTML email template for obligation alerts,
 * styled with IfsinRem's official landing page palette and branding.
 */
function generateAlertHtml(
  userName: string,
  obligationName: string,
  daysUntilDue: number,
  dueDate: string,
  isTest: boolean = false
): string {
  const isOverdue = daysUntilDue < 0;
  const absDays = Math.abs(daysUntilDue);
  
  let statusBadgeHtml = '';
  let statusNoticeHtml = '';

  if (isOverdue) {
    statusBadgeHtml = `<span style="background-color: #FEF2F2; color: #DC2626; border: 1px solid #FCA5A5; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; display: inline-block;">🚨 VENCIDA</span>`;
    statusNoticeHtml = `
      <div style="background-color: #FEF2F2; border: 1px solid #FCA5A5; border-left: 4px solid #DC2626; padding: 14px 16px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 0; color: #991B1B; font-size: 13px; font-weight: 600;">
          🚨 ${absDays === 1 ? 'Esta obligación venció ayer' : `Esta obligación venció hace ${absDays} días`} (${dueDate}).
        </p>
      </div>`;
  } else if (daysUntilDue === 0) {
    statusBadgeHtml = `<span style="background-color: #FFFBEB; color: #D97706; border: 1px solid #FCD34D; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; display: inline-block;">⚠️ VENCE HOY</span>`;
    statusNoticeHtml = `
      <div style="background-color: #FFFBEB; border: 1px solid #FCD34D; border-left: 4px solid #D97706; padding: 14px 16px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 0; color: #92400E; font-size: 13px; font-weight: 600;">
          ⚠️ Esta obligación vence HOY (${dueDate}). Por favor toma acción inmediata.
        </p>
      </div>`;
  } else if (daysUntilDue <= 7) {
    statusBadgeHtml = `<span style="background-color: #FFFBEB; color: #D97706; border: 1px solid #FCD34D; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; display: inline-block;">⚠️ PRÓXIMA</span>`;
    statusNoticeHtml = `
      <div style="background-color: #FFFBEB; border: 1px solid #FCD34D; border-left: 4px solid #D97706; padding: 14px 16px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 0; color: #92400E; font-size: 13px; font-weight: 600;">
          ⏰ ${daysUntilDue === 1 ? 'Falta 1 día' : `Faltan ${daysUntilDue} días`} para el vencimiento.
        </p>
      </div>`;
  } else {
    statusBadgeHtml = `<span style="background-color: #F0F9FF; color: #0284C7; border: 1px solid #BAE6FD; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; display: inline-block;">📅 RECORDATORIO</span>`;
    statusNoticeHtml = `
      <div style="background-color: #F0F9FF; border: 1px solid #BAE6FD; border-left: 4px solid #0284C7; padding: 14px 16px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 0; color: #075985; font-size: 13px; font-weight: 600;">
          📅 Faltan ${daysUntilDue} días para el vencimiento (${dueDate}).
        </p>
      </div>`;
  }

  const testBadge = isTest 
    ? `<div style="background-color: #F0FDF4; border: 1px solid #BBF7D0; border-left: 4px solid #10B981; padding: 12px 16px; border-radius: 6px; margin-bottom: 24px; color: #166534; font-size: 13px;">
        <strong>✓ Correo de prueba exitoso:</strong> Tu configuración de notificaciones en IfsinRem está activada y funcionando correctamente.
       </div>` 
    : '';

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Notificación de Vencimiento - IfsinRem</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif; background-color: #F1F5F9; color: #0F172A;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F1F5F9; padding: 30px 10px;">
    <tr>
      <td align="center">
        <div style="max-width: 580px; width: 100%; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.04); border: 1px solid #E2E8F0;">
          
          <!-- Header Branding -->
          <div style="background-color: #070B14; padding: 24px 32px; border-bottom: 3px solid #10B981; text-align: left;">
            <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td style="vertical-align: middle;">
                  <img src="https://www.ifsinrem.site/logo.png" width="36" height="36" style="vertical-align: middle; border-radius: 8px; margin-right: 10px;" alt="IfsinRem Logo" />
                  <span style="font-size: 22px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.5px; vertical-align: middle;">ifsin<span style="color: #10B981;">rem</span></span>
                </td>
                <td align="right" style="vertical-align: middle;">
                  <span style="color: #94A3B8; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px;">Gestión de Vencimientos</span>
                </td>
              </tr>
            </table>
          </div>

          <!-- Body Content -->
          <div style="padding: 32px 32px 28px 32px;">
            ${testBadge}

            <p style="margin: 0 0 16px 0; color: #0F172A; font-size: 15px; line-height: 1.5;">
              Hola <strong style="color: #0F172A;">${userName}</strong>,
            </p>
            
            <p style="margin: 0 0 20px 0; color: #475569; font-size: 14px; line-height: 1.6;">
              Te enviamos este aviso importante sobre una obligación registrada en tu plataforma de control:
            </p>

            <!-- Obligation Card -->
            <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 20px; margin: 20px 0;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="color: #64748B; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px;">OBLIGACIÓN LEGAL / FISCAL</span>
                  </td>
                  <td align="right">
                    ${statusBadgeHtml}
                  </td>
                </tr>
              </table>

              <h2 style="margin: 10px 0 16px 0; color: #0F172A; font-size: 17px; font-weight: 700; line-height: 1.4;">${obligationName}</h2>

              <div style="border-top: 1px border-dashed #CBD5E1; padding-top: 12px; margin-top: 12px;">
                <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="color: #64748B; font-size: 13px;">Fecha límite:</td>
                    <td align="right" style="color: #0F172A; font-size: 14px; font-weight: 700;">${dueDate}</td>
                  </tr>
                </table>
              </div>
            </div>

            ${statusNoticeHtml}

            <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 24px 0 28px 0;">
              Por favor ingresa a tu panel de control para realizar las acciones o registros pertinentes antes del vencimiento.
            </p>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 28px 0 20px 0;">
              <a href="https://www.ifsinrem.site/dashboard" style="display: inline-block; background: linear-gradient(135deg, #0D9488 0%, #059669 100%); color: #FFFFFF; padding: 13px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 14px; box-shadow: 0 4px 6px -1px rgba(13, 148, 136, 0.25);">
                Ir al Dashboard
              </a>
            </div>

          </div>

          <!-- Footer -->
          <div style="background-color: #F8FAFC; padding: 20px 32px; border-top: 1px solid #E2E8F0; text-align: center;">
            <p style="color: #64748B; font-size: 12px; margin: 0 0 8px 0; line-height: 1.5;">
              Recibes este correo porque tienes activadas las alertas por email en IfsinRem.
            </p>
            <p style="color: #94A3B8; font-size: 11px; margin: 0; line-height: 1.5;">
              <a href="https://www.ifsinrem.site/user/settings" style="color: #0D9488; text-decoration: underline;">Configurar mis notificaciones</a> &bull; &copy; ${new Date().getFullYear()} IfsinRem
            </p>
          </div>

        </div>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Generates professional HTML email template for invitations
 */
function generateInvitationHtml(
  userName: string,
  invitedBy: string,
  inviteLink: string
): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Invitación a IfsinRem</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif; background-color: #F1F5F9; color: #0F172A;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F1F5F9; padding: 30px 10px;">
    <tr>
      <td align="center">
        <div style="max-width: 580px; width: 100%; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.08); border: 1px solid #E2E8F0;">
          
          <!-- Header -->
          <div style="background-color: #070B14; padding: 24px 32px; border-bottom: 3px solid #10B981; text-align: left;">
            <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td style="vertical-align: middle;">
                  <img src="https://www.ifsinrem.site/logo.png" width="36" height="36" style="vertical-align: middle; border-radius: 8px; margin-right: 10px;" alt="IfsinRem Logo" />
                  <span style="font-size: 22px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.5px; vertical-align: middle;">ifsin<span style="color: #10B981;">rem</span></span>
                </td>
              </tr>
            </table>
          </div>

          <!-- Body -->
          <div style="padding: 32px 32px 28px 32px;">
            <p style="margin: 0 0 16px 0; color: #0F172A; font-size: 16px;">¡Hola <strong style="color: #0F172A;">${userName}</strong>!</p>
            
            <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
              <strong style="color: #0F172A;">${invitedBy}</strong> te ha invitado a unirte a su equipo de trabajo en la plataforma <strong>IfsinRem</strong>.
            </p>

            <div style="background-color: #F0FDF4; border: 1px solid #BBF7D0; border-left: 4px solid #10B981; padding: 16px; border-radius: 8px; margin: 24px 0;">
              <p style="margin: 0; color: #166534; font-size: 13px; font-weight: 600;">
                ✓ Tendrás acceso colaborativo a la gestión de vencimientos, auditorías e inventario de EPP.
              </p>
            </div>

            <!-- CTA -->
            <div style="text-align: center; margin: 32px 0 24px 0;">
              <a href="${inviteLink}" style="display: inline-block; background: linear-gradient(135deg, #0D9488 0%, #059669 100%); color: #FFFFFF; padding: 13px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 14px; box-shadow: 0 4px 6px -1px rgba(13, 148, 136, 0.25);">
                Completar Registro
              </a>
            </div>

            <p style="color: #64748B; font-size: 12px; text-align: center; margin: 16px 0 0 0;">
              Si el botón no abre correctamente, copia este enlace en tu navegador:<br>
              <a href="${inviteLink}" style="color: #0D9488; text-decoration: underline; word-break: break-all;">${inviteLink}</a>
            </p>
          </div>

          <!-- Footer -->
          <div style="background-color: #F8FAFC; padding: 20px 32px; border-top: 1px solid #E2E8F0; text-align: center;">
            <p style="color: #94A3B8; font-size: 11px; margin: 0;">
              &copy; ${new Date().getFullYear()} IfsinRem. Todos los derechos reservados.
            </p>
          </div>

        </div>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    if (!RESEND_API_KEY) {
      console.error("❌ RESEND_API_KEY no configurada");
      return new Response(
        JSON.stringify({
          success: false,
          error: "RESEND_API_KEY no establecida en Supabase Secrets."
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resend = new Resend(RESEND_API_KEY);
    const body: EmailRequest = await req.json();
    console.log("📥 Payload recibido:", JSON.stringify(body));

    const {
      to,
      type = 'alert',
      userName,
      obligationName,
      daysUntilDue = 0,
      dueDate,
      invitedBy,
      inviteLink = "https://www.ifsinrem.site/auth",
      obligationId,
      isTestEmail = false,
    } = body;

    if (!to || !userName) {
      return new Response(
        JSON.stringify({ success: false, error: "Faltan parámetros: to y userName" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let subject = "";
    let htmlContent = "";

    if (type === 'invitation') {
      subject = `🎫 ${userName}, tienes una invitación en IfsinRem`;
      htmlContent = generateInvitationHtml(userName, invitedBy || 'Un administrador', inviteLink);
    } else if (type === 'alert' || type === 'test') {
      if (!obligationName) {
        return new Response(
          JSON.stringify({ success: false, error: "Faltan parámetros para alerta: obligationName" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const isOverdue = daysUntilDue < 0;
      const absDays = Math.abs(daysUntilDue);

      subject = isOverdue
        ? `🚨 VENCIDA: ${obligationName}`
        : daysUntilDue <= 7
          ? `⚠️ PRÓXIMO VENCIMIENTO: ${obligationName}`
          : `📅 Recordatorio: ${obligationName}`;

      if (isTestEmail) {
        subject = `✓ [PRUEBA] ${subject}`;
      }

      htmlContent = generateAlertHtml(userName, obligationName, daysUntilDue, dueDate || new Date().toISOString().split('T')[0], isTestEmail);
    }

    console.log(`🚀 Enviando email a: ${to} (tipo: ${type}${isTestEmail ? ', prueba' : ''})`);
    const { data: resendData, error: resendError } = await resend.emails.send({
      from: RESEND_FROM_EMAIL,
      to: [to],
      subject,
      html: htmlContent,
    });

    if (resendError) {
      console.error("❌ Error de Resend:", resendError);
      return new Response(
        JSON.stringify({ success: false, error: resendError }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("✅ Email enviado exitosamente:", resendData?.id);
    return new Response(
      JSON.stringify({ success: true, data: resendData }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("❌ Error inesperado:", error);
    const message = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});


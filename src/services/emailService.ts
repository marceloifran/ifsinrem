import { supabase } from '@/integrations/supabase/client';

export interface SendObligationAlertParams {
    to: string;
    userName: string;
    obligationName: string;
    daysUntilDue: number;
    dueDate: string;
    obligationId?: string;
}

export interface SendInvitationEmailParams {
    to: string;
    userName: string;
    invitedBy: string;
    inviteLink?: string;
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
    isTest: boolean = false,
    ctaUrl?: string
): string {
    const defaultOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://www.ifsinrem.site';
    const targetUrl = ctaUrl || `${defaultOrigin}/dashboard`;
    const isOverdue = daysUntilDue < 0;
    const absDays = Math.abs(daysUntilDue);
    
    // Status Badge & Border Accent
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
              <a href="${targetUrl}" style="display: inline-block; background: linear-gradient(135deg, #0D9488 0%, #059669 100%); color: #FFFFFF; padding: 13px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 14px; box-shadow: 0 4px 6px -1px rgba(13, 148, 136, 0.25);">
                Acceder a la Plataforma
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

/**
 * Direct Resend API Fallback
 */
async function sendViaDirectResendApi(
    to: string,
    type: 'alert' | 'invitation',
    data: Record<string, any>
): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const resendApiKey = import.meta.env.VITE_RESEND_API_KEY;
    const fromEmail = import.meta.env.VITE_RESEND_FROM_EMAIL || 'IfsinRem <no-reply@ifsinrem.site>';

    if (!resendApiKey) {
        return {
            success: false,
            error: 'No se encontró VITE_RESEND_API_KEY configurada.',
        };
    }

    try {
        const {
            userName = 'Usuario',
            obligationName = 'Notificación',
            daysUntilDue = 0,
            dueDate = new Date().toISOString().split('T')[0],
            invitedBy = 'Administrador',
            inviteLink = typeof window !== 'undefined' ? `${window.location.origin}/auth` : 'https://www.ifsinrem.site/auth',
            isTestEmail = false,
        } = data;

        let subject = '';
        let htmlContent = '';

        if (type === 'invitation') {
            subject = `🎫 ${userName}, tienes una invitación en IfsinRem`;
            htmlContent = generateInvitationHtml(userName, invitedBy, inviteLink);
        } else {
            const isOverdue = daysUntilDue < 0;
            subject = isOverdue
                ? `🚨 VENCIDA: ${obligationName}`
                : daysUntilDue <= 7
                    ? `⚠️ PRÓXIMO VENCIMIENTO: ${obligationName}`
                    : `📅 Recordatorio: ${obligationName}`;

            if (isTestEmail) {
                subject = `✓ [PRUEBA] ${subject}`;
            }

            htmlContent = generateAlertHtml(userName, obligationName, daysUntilDue, dueDate, isTestEmail);
        }

        console.log(`📤 Enviando email vía endpoint local/serverless /api/send-email a ${to}...`);

        const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: fromEmail,
                to: [to],
                subject,
                html: htmlContent,
            }),
        });

        const resData = await response.json();

        if (!response.ok) {
            console.error('❌ Error de Resend Direct API:', resData);
            return {
                success: false,
                error: resData.message || resData.error || 'Error al comunicarse con Resend',
            };
        }

        console.log('✅ Email enviado exitosamente vía Resend Direct API. ID:', resData.id);
        return {
            success: true,
            messageId: resData.id,
        };
    } catch (err: any) {
        console.error('❌ Error enviando email directamente vía Resend:', err);
        return {
            success: false,
            error: err.message || 'Error de red al conectar con Resend API',
        };
    }
}

/**
 * Secure email dispatcher via Supabase Edge Function with automatic direct Resend fallback
 */
async function sendViaEdgeFunction(
    to: string,
    type: 'alert' | 'invitation',
    data: Record<string, any>
): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
        console.log(`📧 Invoking secure send-email Edge Function for ${to}...`);

        const { data: responseData, error } = await supabase.functions.invoke('send-email', {
            body: {
                type,
                to,
                ...data,
            },
        });

        if (error || responseData?.success === false) {
            const errorMsg = error?.message || responseData?.error || 'Edge Function error';
            console.warn(`⚠️ Supabase Edge Function no disponible (${errorMsg}). Usando fallback directo a API de Resend...`);
            return await sendViaDirectResendApi(to, type, data);
        }

        const messageId = responseData?.data?.id || responseData?.id;
        console.log('✅ Email enviado exitosamente vía Edge Function. ID:', messageId);
        return {
            success: true,
            messageId,
        };
    } catch (error: any) {
        console.warn('⚠️ Excepción al invocar Edge Function. Ejecutando fallback directo a API de Resend...', error);
        return await sendViaDirectResendApi(to, type, data);
    }
}

/**
 * Sends an email alert for an obligation nearing its due date or overdue.
 */
export async function sendObligationAlert({
    to,
    userName,
    obligationName,
    daysUntilDue,
    dueDate,
    obligationId,
}: SendObligationAlertParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return sendViaEdgeFunction(to, 'alert', {
        userName,
        obligationName,
        daysUntilDue,
        dueDate,
        obligationId,
    });
}

/**
 * Sends an invitation email to a new user.
 */
export async function sendInvitationEmail({
    to,
    userName,
    invitedBy,
    inviteLink = typeof window !== 'undefined' ? `${window.location.origin}/auth` : 'https://www.ifsinrem.site/auth',
}: SendInvitationEmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return sendViaEdgeFunction(to, 'invitation', {
        userName,
        invitedBy,
        inviteLink,
    });
}

/**
 * Sends a test notification email to the currently authenticated user.
 */
export async function sendTestNotificationEmail(
    userName: string,
    userEmail: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    return sendViaEdgeFunction(userEmail, 'alert', {
        userName,
        obligationName: 'Correo de prueba de IfsinRem',
        daysUntilDue: 1,
        dueDate: tomorrow.toISOString().split('T')[0],
        isTestEmail: true,
    });
}


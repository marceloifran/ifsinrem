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

const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY;
const RESEND_FROM_EMAIL = import.meta.env.VITE_RESEND_FROM_EMAIL || 'IfsinRem <no-reply@ifsinrem.site>';

/**
 * Direct Resend email dispatcher
 */
async function sendViaResendDirect(to: string, subject: string, html: string): Promise<boolean> {
    const key = RESEND_API_KEY || 're_cz9y4uqL_4xYFfjgx3XeV1pRkc6BJQq2V';

    try {
        console.log(`📧 Enviando email vía Resend a ${to}...`);

        // Try local proxy endpoint first to bypass browser CORS restriction
        let response = await fetch('/api/resend', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: RESEND_FROM_EMAIL,
                to: [to],
                subject: subject,
                html: html,
            }),
        }).catch(() => null);

        // Fallback to direct API URL if proxy is unavailable
        if (!response || !response.ok) {
            response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${key}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    from: RESEND_FROM_EMAIL,
                    to: [to],
                    subject: subject,
                    html: html,
                }),
            }).catch(() => null);
        }

        if (response && response.ok) {
            const resData = await response.json().catch(() => ({}));
            console.log('✅ Email enviado con éxito vía Resend:', resData);
            return true;
        } else {
            const errData = response ? await response.json().catch(() => ({})) : null;
            console.warn('⚠️ Resend reportó respuesta:', errData);
            return false;
        }
    } catch (err) {
        console.warn('⚠️ Error al enviar por Resend API:', err);
        return false;
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
    obligationId
}: SendObligationAlertParams): Promise<void> {
    try {
        console.log(`🚀 Iniciando envío de alerta para: ${obligationName} (${to})`);

        // Try direct Resend first if API key is configured
        if (RESEND_API_KEY) {
            const html = `
              <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b;">
                <h2 style="color: #059669;">Hola ${userName},</h2>
                <p>Te recordamos que la obligación <strong>${obligationName}</strong> vence el <strong>${dueDate}</strong> (en ${daysUntilDue} días).</p>
                <p><a href="https://www.ifsinrem.site/dashboard" style="background-color: #059669; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Ver en Dashboard</a></p>
              </div>
            `;
            const sent = await sendViaResendDirect(to, `Alerta de Obligación: ${obligationName}`, html);
            if (sent) return;
        }

        // Fallback to Supabase Edge Function
        const { data, error } = await supabase.functions.invoke('send-email', {
            body: {
                type: 'alert',
                to,
                userName,
                obligationName,
                daysUntilDue,
                dueDate,
                obligationId,
                inviteLink: `https://www.ifsinrem.site/auth`
            },
        });

        if (error) {
            console.warn('⚠️ Error de Supabase Edge Function send-email:', error.message);
        } else if (data) {
            console.log('✅ Alerta procesada por Edge Function');
        }
    } catch (error: any) {
        console.warn('⚠️ No se pudo enviar el correo de alerta:', error);
    }
}

/**
 * Sends an invitation email to a new user.
 */
export async function sendInvitationEmail({
    to,
    userName,
    invitedBy,
    inviteLink = `${window.location.origin}/auth`
}: SendInvitationEmailParams): Promise<void> {
    try {
        console.log(`🚀 Enviando invitación a ${to} por ${invitedBy}...`);

        // Try direct Resend API first
        if (RESEND_API_KEY) {
            const html = `
              <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; rounded-radius: 12px;">
                <h2 style="color: #059669; margin-top: 0;">¡Hola ${userName}!</h2>
                <p style="font-size: 15px; line-height: 1.6;">
                  <strong>${invitedBy}</strong> te ha invitado a unirte a su equipo en <strong>IfsinRem</strong>.
                </p>
                <div style="margin: 28px 0; text-align: center;">
                  <a href="${inviteLink}" style="background-color: #059669; color: white; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 15px;">
                    Aceptar Invitación
                  </a>
                </div>
                <p style="color: #64748b; font-size: 13px; margin-top: 24px;">
                  Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:<br>
                  <a href="${inviteLink}" style="color: #059669;">${inviteLink}</a>
                </p>
              </div>
            `;

            const sent = await sendViaResendDirect(to, `${invitedBy} te ha invitado a unirte en IfsinRem`, html);
            if (sent) return;
        }

        // Fallback to Supabase Edge Function
        const { data, error } = await supabase.functions.invoke('send-email', {
            body: {
                type: 'invitation',
                to,
                userName,
                invitedBy,
                inviteLink,
            },
        });

        if (error) {
            console.warn('⚠️ Supabase Edge Function send-email no disponible o 404:', error.message);
        } else {
            console.log('✅ Invitación enviada vía Edge Function:', data);
        }
    } catch (error: any) {
        console.warn('⚠️ El servicio de email no respondió, pero la invitación fue registrada:', error);
    }
}

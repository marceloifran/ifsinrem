/**
 * DEPRECATED: This file should not be used anymore.
 * All email sending must route through the secure Supabase Edge Function.
 * The Resend API key is stored securely in Supabase environment variables only.
 * 
 * This handler is kept for reference only.
 * Use supabase.functions.invoke('send-email') instead.
 */

export default async function handler(req: any, res: any) {
  res.status(403).json({
    error: 'DEPRECATED: Email sending via this endpoint is disabled for security reasons.',
    message: 'Please use Supabase Edge Functions (send-email) instead.',
    solution: 'Route all emails through supabase.functions.invoke("send-email")',
  });
}

    const resData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error('❌ Resend API error response:', resData);
      return res.status(resendResponse.status).json(resData);
    }

    console.log('✅ Email enviado exitosamente vía Resend Serverless:', resData);
    return res.status(200).json(resData);
  } catch (err: any) {
    console.error('❌ Error fatal en Vercel Serverless Function /api/resend:', err);
    return res.status(500).json({ error: err.message || 'Error interno al enviar correo' });
  }
}

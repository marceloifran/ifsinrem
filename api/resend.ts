export default async function handler(req: any, res: any) {
  // CORS headers for preflight and cross-origin requests
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey =
    process.env.RESEND_API_KEY ||
    process.env.VITE_RESEND_API_KEY ||
    're_cz9y4uqL_4xYFfjgx3XeV1pRkc6BJQq2V';

  const defaultFromEmail =
    process.env.RESEND_FROM_EMAIL ||
    process.env.VITE_RESEND_FROM_EMAIL ||
    'IfsinRem <no-reply@ifsinrem.site>';

  try {
    const { to, subject, html, from } = req.body || {};

    if (!to || !subject || !html) {
      return res.status(400).json({ error: 'Faltan parámetros requeridos (to, subject, html)' });
    }

    console.log(`📧 Dispatching email via Vercel Serverless Function to ${to}...`);

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: from || defaultFromEmail,
        to: Array.isArray(to) ? to : [to],
        subject: subject,
        html: html,
      }),
    });

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

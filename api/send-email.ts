export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const resendApiKey = process.env.VITE_RESEND_API_KEY || process.env.RESEND_API_KEY || "re_cz9y4uqL_4xYFfjgx3XeV1pRkc6BJQq2V";
    const fromEmail = process.env.VITE_RESEND_FROM_EMAIL || "IfsinRem <no-reply@ifsinrem.site>";

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: body.from || fromEmail,
        to: Array.isArray(body.to) ? body.to : [body.to],
        subject: body.subject,
        html: body.html,
      }),
    });

    const resData = await response.json();
    if (!response.ok) {
      console.error('❌ Resend API error response:', resData);
      return res.status(response.status).json(resData);
    }

    console.log('✅ Email enviado exitosamente vía Serverless Endpoint:', resData);
    return res.status(200).json(resData);
  } catch (err: any) {
    console.error('❌ Error fatal en Serverless Endpoint /api/send-email:', err);
    return res.status(500).json({ error: err.message || 'Error interno al enviar correo' });
  }
}

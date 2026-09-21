/**
 * DEPRECATED: This file should not be used anymore.
 * All email sending must route through the secure Supabase Edge Function.
 * The Resend API key is stored securely in Supabase environment variables only.
 * 
 * This handler is kept for reference only.
 * Use supabase.functions.invoke('send-email') instead.
 */

export default async function handler(req: any, res: any) {
  return res.status(403).json({
    error: 'DEPRECATED: Email sending via this endpoint is disabled for security reasons.',
    message: 'Please use Supabase Edge Functions (send-email) instead.',
    solution: 'Route all emails through supabase.functions.invoke("send-email")',
  });
}

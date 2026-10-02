/**
 * email.ts — kirim email transaksional via Resend HTTP API (Sprint 9).
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * SERVER-ONLY.
 *
 * Kenapa tidak pakai payload.sendEmail: adapter email Payload dibangun dari
 * process.env.RESEND_API_KEY saat config di-build. Kalau operator hanya mengisi
 * key di CMS (Integrations) — seperti key Xendit/Biteship — adapter itu tidak
 * pernah terpasang dan email diam-diam gagal. Helper ini memakai key hasil
 * resolveIntegrations() (CMS → env), jadi mengisi key di CMS cukup.
 *
 * Gagal-aman: mengembalikan false alih-alih melempar, supaya alur pembayaran
 * tidak pernah gagal gara-gara email.
 */

interface SendEmailArgs {
  apiKey?: string;
  from: string;
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

export async function sendEmail(args: SendEmailArgs): Promise<boolean> {
  if (!args.apiKey || !args.to) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${args.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: args.from,
        to: args.to,
        subject: args.subject,
        html: args.html,
        ...(args.replyTo ? { reply_to: args.replyTo } : {}),
      }),
    });
    if (!res.ok) {
      console.error("Resend gagal:", res.status, await res.text().catch(() => ""));
      return false;
    }
    return true;
  } catch (err) {
    console.error("Resend error:", err);
    return false;
  }
}

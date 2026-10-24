import nodemailer, { type Transporter } from "nodemailer";
import { getSmtpConfig } from "./env";

/*
 * Pengirim email transaksional (Brevo relay).
 *
 * Hanya untuk kode sisi server — route handler, server action, atau skrip.
 * Jangan pernah di-import dari komponen client: kredensial SMTP akan ikut
 * ter-bundle ke browser.
 */

let cached: Transporter | null = null;

export function getTransport(): Transporter {
  if (cached) return cached;

  const smtp = getSmtpConfig();
  cached = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: { user: smtp.user, pass: smtp.pass },
    pool: true,
    maxConnections: 2,
  });

  return cached;
}

export type MailInput = {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
};

export type MailResult = {
  messageId: string;
  accepted: string[];
  rejected: string[];
};

/** Kirim satu email. Melempar error kalau SMTP belum dikonfigurasi. */
export async function sendMail(input: MailInput): Promise<MailResult> {
  const { from } = getSmtpConfig();
  const info = await getTransport().sendMail({ from, ...input });

  return {
    messageId: info.messageId,
    accepted: info.accepted.map(String),
    rejected: info.rejected.map(String),
  };
}

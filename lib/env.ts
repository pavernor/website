/*
 * Satu sumber kebenaran untuk env sisi server.
 *
 * Next.js memuat `.env` otomatis di dev dan build. Nilai dibaca lazy (bukan
 * saat modul di-import) supaya `next build` tetap jalan di mesin/VPS yang
 * belum punya kredensial SMTP.
 */

export type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
};

const SMTP_KEYS = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "SMTP_FROM"] as const;

/** True kalau semua kredensial SMTP tersedia. Tidak pernah melempar error. */
export function isSmtpConfigured(): boolean {
  return SMTP_KEYS.every((key) => Boolean(process.env[key]));
}

/** Baca konfigurasi SMTP; melempar error yang jelas kalau ada yang kurang. */
export function getSmtpConfig(): SmtpConfig {
  const missing = SMTP_KEYS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `SMTP belum dikonfigurasi. Variabel hilang: ${missing.join(", ")}. ` +
        "Salin .env.example ke .env lalu isi nilainya.",
    );
  }

  const port = Number(process.env.SMTP_PORT);
  if (!Number.isInteger(port) || port <= 0) {
    throw new Error(`SMTP_PORT tidak valid: ${process.env.SMTP_PORT}`);
  }

  return {
    host: process.env.SMTP_HOST!,
    port,
    // Port 587 = STARTTLS (secure=false). Port 465 = implicit TLS (secure=true).
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
    from: process.env.SMTP_FROM!,
  };
}

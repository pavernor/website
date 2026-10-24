#!/usr/bin/env node
/*
 * Uji konfigurasi SMTP.
 *
 *   node --env-file=.env scripts/send-test-email.mjs
 *       → hanya verify() koneksi + login, tidak mengirim apa pun.
 *
 *   node --env-file=.env scripts/send-test-email.mjs alvin@pavernor.site
 *       → verify() lalu kirim satu email percobaan.
 *
 * `--env-file` adalah fitur Node (20.6+), jadi tidak perlu dotenv.
 */
import nodemailer from "nodemailer";

const required = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "SMTP_FROM"];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(`✗ env hilang: ${missing.join(", ")}`);
  console.error("  jalankan dengan: node --env-file=.env scripts/send-test-email.mjs");
  process.exit(1);
}

const port = Number(process.env.SMTP_PORT);
const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port,
  secure: process.env.SMTP_SECURE === "true",
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

/** Terjemahkan kode SMTP jadi instruksi yang bisa langsung dikerjakan. */
async function diagnose(error) {
  const code = error.responseCode;
  const message = String(error.message).replace(/\s+/g, " ");

  if (code === 525 || /Unauthorized IP address/i.test(message)) {
    let egress = "tidak diketahui";
    try {
      const res = await fetch("https://www.cloudflare.com/cdn-cgi/trace", { signal: AbortSignal.timeout(5000) });
      const trace = await res.text();
      const ip = trace.match(/^ip=(.+)$/m)?.[1];
      const warp = trace.match(/^warp=(.+)$/m)?.[1];
      egress = `${ip ?? "?"}${warp === "on" ? " (Cloudflare WARP aktif)" : ""}`;
    } catch {
      /* diagnosa IP opsional */
    }
    return [
      "IP mesin ini belum diizinkan di kunci SMTP Brevo.",
      `  IP keluar sekarang: ${egress}`,
      "  Kalau WARP/VPN aktif, IP-nya berubah-ubah — allowlist tidak akan stabil.",
      "  Perbaikan: Brevo → Settings → SMTP & API → SMTP → Authorised IPs,",
      "  lalu kosongkan pembatasan (atau isi IP VPS saat produksi).",
    ].join("\n");
  }

  if (code === 535) {
    return "Kredensial ditolak. SMTP_USER harus alamat @smtp-brevo.com, dan SMTP_PASS harus SMTP key (bukan API key).";
  }

  if (code === 550) {
    return "Pengirim ditolak. SMTP_FROM harus alamat yang sudah diverifikasi di Brevo (Senders & IP).";
  }

  if (error.code === "ETIMEDOUT" || error.code === "ECONNECTION" || error.code === "ESOCKET") {
    return `Tidak bisa menjangkau ${process.env.SMTP_HOST}:${port}. Cek koneksi atau firewall keluar.`;
  }

  return `${code ? `[${code}] ` : ""}${message}`;
}

try {
  await transport.verify();
  console.log(`✓ koneksi + login OK → ${process.env.SMTP_HOST}:${port}`);
} catch (error) {
  console.error(`✗ gagal konek/login`);
  console.error(`  ${await diagnose(error)}`);
  process.exit(1);
}

const to = process.argv[2];
if (!to) {
  console.log("  (mode verify saja — tambahkan alamat tujuan untuk kirim betulan)");
  transport.close();
  process.exit(0);
}

try {
  const info = await transport.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: "Pavernor SMTP test",
    text: `SMTP terpasang benar.\nDikirim: ${new Date().toISOString()}`,
  });
  console.log(`✓ terkirim ke ${to}`);
  console.log(`  accepted: ${info.accepted.join(", ") || "-"}`);
  console.log(`  rejected: ${info.rejected.join(", ") || "-"}`);
  console.log(`  id: ${info.messageId}`);
} catch (error) {
  console.error(`✗ gagal kirim: ${error.message}`);
  process.exitCode = 1;
} finally {
  transport.close();
}

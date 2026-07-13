/**
 * Noblekase — PM2 Ecosystem Config (Native Deployment)
 * Dibuat oleh: PT Solusi Inovasi Bangsa (https://ide.asia)
 *
 * Usage:
 *   pm2 start ecosystem.config.cjs
 *   pm2 save
 *   pm2 startup            # generate systemd service
 *
 * Logs:
 *   pm2 logs noblekase
 *   pm2 logs noblekase --lines 200
 */

module.exports = {
  apps: [
    {
      name: "noblekase",
      cwd: "/opt/noblekase",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 8080 -H 0.0.0.0",
      // 1 instance saja — Payload (admin & API) safer di mode fork
      // Naikkan instances ke "max" hanya jika app sudah stateless penuh.
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "1500M",
      autorestart: true,
      watch: false,
      kill_timeout: 8000,
      listen_timeout: 15000,
      env: {
        NODE_ENV: "production",
        PORT: "8080",
        HOSTNAME: "0.0.0.0",
        NODE_OPTIONS: "--no-deprecation",
      },
      error_file: "/var/log/noblekase/error.log",
      out_file: "/var/log/noblekase/out.log",
      merge_logs: true,
      time: true,
    },
  ],
};

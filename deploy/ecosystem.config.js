// PM2 konfiguratsiyasi — saytni doim ishlab turishini ta'minlaydi,
// server qayta ishga tushsa ham avtomatik qayta ko'taradi.
module.exports = {
  apps: [
    {
      name: "sales-dashboard",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      cwd: __dirname + "/..",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};

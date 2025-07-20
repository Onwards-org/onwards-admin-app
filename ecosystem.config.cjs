module.exports = {
  apps: [
    {
      name: 'onwards-admin-server',
      script: 'dist/server/server/index.js',
      cwd: '/root/Repos/onwards-admin-app',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 3001
      },
      error_file: '/root/Repos/onwards-admin-app/logs/server-error.log',
      out_file: '/root/Repos/onwards-admin-app/logs/server-out.log',
      log_file: '/root/Repos/onwards-admin-app/logs/server-combined.log',
      time: true
    },
    {
      name: 'onwards-admin-client',
      script: 'serve',
      env: {
        PM2_SERVE_PATH: '/root/Repos/onwards-admin-app/dist/client',
        PM2_SERVE_PORT: 8080,
        PM2_SERVE_SPA: 'true',
        PM2_SERVE_HOMEPAGE: '/index.html'
      },
      error_file: '/root/Repos/onwards-admin-app/logs/client-error.log',
      out_file: '/root/Repos/onwards-admin-app/logs/client-out.log',
      log_file: '/root/Repos/onwards-admin-app/logs/client-combined.log',
      time: true
    }
  ]
};
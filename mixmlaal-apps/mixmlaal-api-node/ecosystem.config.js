module.exports = {
  apps: [
    {
      name: 'mixmlaal-api',
      script: './src/app.js',
      instances: 'max',
      exec_mode: 'cluster',
      wait_ready: true,
      listen_timeout: 5000,
      kill_timeout: 5000,
      shutdown_with_message: true,
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      pid_file: './logs/mixmlaal-api.pid',
      rotateHistory: true,
      rotateSize: '10M',
      rotateMaxFiles: 10,
      max_memory_restart: '1G',
      restart_delay: 1000,
      max_restarts: 10,
      min_uptime: '10s',
      comment: 'MIXMLAAL API Service - Cluster Mode for Production',
      instance_var: 'INSTANCE_ID',
      treeKill: true,
      autorestart: true,
      watch: false,
      source_map_support: true,
      kill_retry_timeouts: true
    }
  ]
};

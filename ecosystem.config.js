module.exports = {
  apps: [
    {
      name: "digital-quotation-form",
      script: "src/app.js",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      watch: false,
      autorestart: true,
      max_memory_restart: "300M",
      env: {
        NODE_ENV: "production"
      },
      env_development: {
        NODE_ENV: "development",
        watch: true
      },
      out_file: "logs/out.log",
      error_file: "logs/error.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true
    }
  ]
};

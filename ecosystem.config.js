module.exports = {
  apps: [
    {
      name: "bird-watcher",
      script: "./bin/www",
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};

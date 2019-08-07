module.exports = {
  apps: [{
    name: 'temperature-humidity',
    script: 'npm',
    args: 'run temperature-humidity',

    // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
    instances: 1,
    // autorestart: true,
    restart_delay: 3000,
    watch: false,
    // max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }],

  deploy: {
    production: {
      user: 'pi',
      host: 'hiddenpi',
      ref: 'origin/master',
      repo: 'git@github.com:christian-fei/garden.git',
      path: '/home/pi/garden',
      'post-deploy': 'npm install && pm2 startOrGracefulReload ecosystem.config.js --env production'
    }
  }
}

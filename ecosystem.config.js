module.exports = {
  apps: [{
    name: 'temperature-humidity',
    script: 'temperature-humidity.js',
    exec_mode: 'fork',
    instances: 1,
    restart_delay: 3000,
    watch: false,
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }, {
    name: 'logger',
    script: 'logger.js',
    exec_mode: 'fork',
    instances: 1,
    restart_delay: 3000,
    watch: false,
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }, {
    name: 'telegram-bot',
    script: 'telegram-bot.js',
    exec_mode: 'fork',
    instances: 1,
    restart_delay: 3000,
    watch: false,
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
      'post-deploy': 'npm install && cp /home/pi/.env /home/pi/garden/current/.env && pm2 startOrGracefulReload ecosystem.config.js --env production'
    }
  }
}

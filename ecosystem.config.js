module.exports = {
  apps: [{
    name: 'dht11',
    script: 'devices/dht11.js',
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
  // },{
  //   name: 'ds18b20',
  //   script: 'devices/ds18b20.js',
  //   exec_mode: 'fork',
  //   instances: 1,
  //   restart_delay: 3000,
  //   watch: false,
  //   env: {
  //     NODE_ENV: 'development'
  //   },
  //   env_production: {
  //     NODE_ENV: 'production'
  //   }
  // }, {
  //   name: 'logger',
  //   script: 'app/logger.js',
  //   exec_mode: 'fork',
  //   instances: 1,
  //   restart_delay: 3000,
  //   watch: false,
  //   env: {
  //     NODE_ENV: 'development'
  //   },
  //   env_production: {
  //     NODE_ENV: 'production'
  //   }
  // }, {
  //   name: 'bot',
  //   script: 'app/bot.js',
  //   exec_mode: 'fork',
  //   instances: 1,
  //   restart_delay: 3000,
  //   watch: false,
  //   env: {
  //     NODE_ENV: 'development'
  //   },
  //   env_production: {
  //     NODE_ENV: 'production'
  //   }
  }],
  deploy: {
    production: {
      user: 'pi',
      // host: '192.168.1.110',
      host: '151.62.218.46',
      ref: 'origin/master',
      repo: 'git@github.com:christian-fei/garden.git',
      path: '/home/pi/garden',
      'post-deploy': 'npm install && cp /home/pi/.env /home/pi/garden/current/.env && pm2 startOrGracefulReload ecosystem.config.js --env production'
    }
  }
}

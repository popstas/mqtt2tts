const os = require('os');

module.exports = {
  mqtt: {
    host: 'localhost',
    port: 1883,
    user: 'user',
    password: 'password'
  },
  ttsTopic: 'tts',
  playCommand: os.platform() == 'linux' ? 'mpg321 -q' : 'cmdmp3',
  lang: 'ru'
};

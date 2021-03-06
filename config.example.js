const os = require('os');

module.exports = {
  mqtt: {
    host: 'localhost',
    port: 1883,
    user: 'user',
    password: 'password'
  },
  ttsTopic: 'tts',
  playCommand: os.platform() == 'linux' ? 'mpg321 -q' : 'mpg123 -q',
  lang: 'ru', // en
  gapLinux: 200,
  gapNoLinux: 0,
};

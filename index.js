const mqtt = require('mqtt');
const execSync = require('child_process').execSync;
const config = require('./config');

const mp3Path = './tts.mp3';

console.log('Connecting to MQTT...');
const client = mqtt.connect(`mqtt://${config.mqtt.host}`, {
  port: config.mqtt.port,
  username: config.mqtt.user,
  password: config.mqtt.password
});

const ttsSay = msg => {
  const cmd = `gtts-cli --nocheck --lang ru "${msg}" --output "${mp3Path}"`;
  // console.log('cmd: ', cmd);
  const ttsOutput = execSync(cmd);
  // console.log('ttsOutput: ', ttsOutput);
  const mp3Output = execSync(`cmdmp3 "${mp3Path}"`);
  // console.log('mp3Output: ', mp3Output);
  return mp3Output;
};

client.on('connect', () => {
  console.log('MQTT connected to ' + config.mqtt.host);
  client.subscribe(config.ttsTopic);
  client.on('message', (topic, message) => {
    const msg = message.toString().toLowerCase();
    console.log(`tts: ${msg}`);
    try {
      ttsSay(msg);
    } catch (e) {
      console.error(`error ttsSay: ${msg}`);
      console.error(e);
    }
  });
});

client.on('offline', () => {
  console.log('MQTT offline');
});

const fs = require('fs');
const execSync = require('child_process').execSync;
const mqtt = require('mqtt');
const config = require('./config');

// for tts cache
const mp3Path = './data';
if (!fs.existsSync(mp3Path)) {
  fs.mkdir(mp3Path);
}

const log = msg => {
  const d = new Date().toLocaleString();
  console.log(`${d} ${msg}`);
};

const ttsSay = msg => {
  log(msg);
  const mp3PathFile = `${mp3Path}/${msg}.mp3`;
  if (!fs.existsSync(mp3PathFile)) {
    const cmd = `gtts-cli --nocheck --lang ${config.lang} "${msg}" --output "${mp3PathFile}"`;
    // console.log('cmd: ', cmd);
    const ttsOutput = execSync(cmd);
  }
  // console.log('ttsOutput: ', ttsOutput);
  const mp3Output = execSync(`${config.playCommand} "${mp3PathFile}"`);
  // console.log('mp3Output: ', mp3Output);
  return mp3Output;
};

log('Connecting to MQTT...');
const client = mqtt.connect(`mqtt://${config.mqtt.host}`, {
  port: config.mqtt.port,
  username: config.mqtt.user,
  password: config.mqtt.password
});

client.on('connect', () => {
  log('MQTT connected to ' + config.mqtt.host);
});

client.on('offline', () => {
  log('MQTT offline');
});

client.subscribe(config.ttsTopic);
client.on('message', (topic, message) => {
  const msg = message.toString().toLowerCase();
  try {
    ttsSay(msg);
  } catch (e) {
    console.error(`error ttsSay: ${msg}`);
    console.error(e);
    setTimeout(() => ttsSay(msg), 1000);
  }
});

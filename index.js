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

  // generate mp3 with gTTS
  if (!fs.existsSync(mp3PathFile)) {
    const cmd = `gtts-cli --nocheck --lang ${config.lang} "${msg}" --output "${mp3PathFile}"`;
    // console.log('cmd: ', cmd);
    const ttsOutput = execSync(cmd);
    // console.log('ttsOutput: ', ttsOutput);
  }

  // play mp3
  const mp3Output = execSync(`${config.playCommand} "${mp3PathFile}"`);
  // console.log('mp3Output: ', mp3Output);
  return mp3Output;
};

const mqttInit = () => {
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
      log(`error ttsSay: ${msg}, retry after 1 sec...`);
      console.error(e);
      setTimeout(() => ttsSay(msg), 1000);
    }
  });
};

// main
mqttInit();


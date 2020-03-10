const fs = require('fs');
const execSync = require('child_process').execSync;
const mqtt = require('mqtt');
const config = require('./config');

const maxRetry = 10;
const retryDelay = 1000;

// for tts cache
const mp3Path = './data';
if (!fs.existsSync(mp3Path)) {
  fs.mkdir(mp3Path);
}

const log = msg => {
  const tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
  const d = new Date(Date.now() - tzoffset).
    toISOString().
    replace(/T/, ' ').      // replace T with a space
    replace(/\..+/, '')     // delete the dot and everything after
  console.log(`${d} ${msg}`);
};

const ttsSay = (msg, tryNum = 1) => {
  msg = msg.toLowerCase();
  msg = msg.replace(/[^. a-zа-я0-9_-]/g,'');
  log(msg);
  const mp3PathFile = `${mp3Path}/${msg}.mp3`;

  try {
    if (tryNum > maxRetry) return false;

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
  } catch (e) {
    log(`error ttsSay: ${msg}, retry ${tryNum} of ${maxRetry} after 1 sec...`);
    // console.error(e);
    setTimeout(() => ttsSay(msg, tryNum + 1), retryDelay);
  }
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
    ttsSay(message.toString());
  });
};

// main
mqttInit();


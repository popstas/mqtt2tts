const fs = require('fs');
const os = require('os');
const execSync = require('child_process').execSync;
const mqtt = require('mqtt');
const config = require('./config');

const maxRetry = 10;
const retryDelay = 1000;

const ttsDelay = 2000; // макс. время задержки в получении и генерации mp3, если в сообщении приходит msg|1234567889, то в конце - время отправки
const gap = os.platform == 'linux' ? 0 : -370; // подобрано методом тыка, разница между Windows и Ubuntu

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

  let sendTime = msg.match(/\|(\d+)$/);
  if(sendTime){
    sendTime = parseInt(sendTime[1]);
    msg = msg.replace(/\|(\d)+$/, '');
  } else {
    sendTime = Date.now();
  }

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
    let mp3Output;
    const delay = sendTime ? sendTime + ttsDelay - Date.now() + gap : 0;
    // console.log('sent: ', new Date(sendTime));
    // console.log('current: ', new Date());
    // console.log('tts time: ', new Date(sendTime + ttsDelay));
    // console.log('delay: ', delay);
    setTimeout(() => { mp3Output = execSync(`${config.playCommand} "${mp3PathFile}"`) }, delay);
    // console.log(`${config.playCommand} "${mp3PathFile}"`);
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


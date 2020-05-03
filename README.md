Receive text from MQTT and TTS via Google TTS on Windows and Linux.

Ajustable syncronous say.

Tested on Windows 10 and Ubuntu 18.04.

## Requirements
- [Node.js](https://nodejs.org/en/)
- [mpg123](https://www.mpg123.de/download.shtml) for Windows
- `apt install mpg321` for Ubuntu
- [gTTS](https://github.com/pndurette/gTTS)

## Install
Download and install Node.js.

Install gTTS:
```
pip install gTTS
```

For Windows: download cmd2mp3, place to PATH, or replace `playCommand` to your in command.

Clone this repository.

### Install as Windows service
```
npm run install-windows
```

By default service run as user SYSTEM. This discard your gTTS and mpg123 paths.

Edit service for run as your user.

### Install as Ubuntu service
Create `/etc/systemd/system/mqtt2tts.service`.

Edit your path:
```
[Unit]
Description=mqtt2tts
DefaultDependencies=no
After=network.target

[Service]
Type=simple
Restart=always
RestartSec=1
ExecStart=cd ~/projects/js/mqtt2tts && npm start
TimeoutSec=0
User=popstas

[Install]
WantedBy=multi-user.target
```

Then run `systemctl enable mqtt2tts.service`.


## Config
- Copy `config.example.js` to `config.js`
- Edit `config.js`

## Usage
`npm start` or just open `node start.lnk`.

Default host: `localhost:1883`.

Default MQTT topic: `tts`.

Tool will save mp3 to `./data` directory for cache.

You can send message with timestamp: `hello|1584547867492` and ajust `gap` variable, for syncronous say.

#### TTS accents
Support `+` as accent and `,` for pauses.

## Linux bash verion
Requirements: gtts, playogg (ogg123 package).

Create `tts-say` script:

``` bash
#!/bin/bash
set -eu

in="${1:-/dev/stdin}"

if [ "$in" = "/dev/stdin" ]; then
	while read line
	do
		line="$(echo "$line" | sed 's/^log //g')"
		echo "tts-say: $line"
		gtts-cli --nocheck --lang ru "$line" --output /tmp/tts.mp3
		playogg /tmp/tts.mp3
	done < "$in"
else
	gtts-cli --nocheck --lang ru "$in" --output /tmp/tts.mp3
	playogg /tmp/tts.mp3
fi
```

Usage:
``` bash
echo "проверка" | tts-say
```

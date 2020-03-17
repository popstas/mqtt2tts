Receive text from MQTT and TTS via Google TTS on Windows and Linux.

Tested on Windows 10 and Ubuntu 18.04.

## Requirements
- [Node.js](https://nodejs.org/en/)
- [cmd2mp3](https://github.com/jimlawless/cmdmp3) for Windows
- `apt install mpg123` for Ubuntu
- [gTTS](https://github.com/pndurette/gTTS)

## Install
Download and install Node.js.

Install gTTS:
```
pip install gTTS
```

For Windows: download cmd2mp3, place to PATH, or replace `playCommand` to your in command.

Clone this repository.

## Config
- Copy `config.example.js` to `config.js`
- Edit `config.js`

## Usage
`npm start` or just open `node start.lnk`.

Default host: `localhost:1883`.

Default MQTT topic: `tts`.

Tool will save mp3 to `./data` directory for cache.

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

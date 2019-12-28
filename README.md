Receive text from MQTT and TTS via Google TTS on Windows.

Tested only on Windows. Will work on Linux too.

## Requirements
- [Node.js](https://nodejs.org/en/)
- [cmd2mp3](https://github.com/jimlawless/cmdmp3) for Windows
- `apt install ogg123` for Ubuntu
- [gTTS](https://github.com/pndurette/gTTS)

## Install
Download and install Node.js.

Install gTTS:
```
pip install gTTS
```

Download cmd2mp3, place to PATH, or replace `playCommand` to your in command.

Clone this repository.

## Config
- Copy `config.example.js` to `config.js`
- Edit `config.js`
- For Ubuntu replace `cmd2mp3` to `playogg` in `config.js`

## Usage
`npm start` or just open `node start.lnk`.

Default host: `localhost:1883`.

Default MQTT topic: `tts`.

## Linux bash verion
Requirements: gtts, playogg.

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

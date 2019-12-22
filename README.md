Receive text from MQTT and TTS via Google TTS on Windows.

Working only on Windows.

## Requirements
- [Node.js](https://nodejs.org/en/)
- [cmd2mp3](https://github.com/jimlawless/cmdmp3)
- [gTTS](https://github.com/pndurette/gTTS)

## Config
- Copy `config.example.js` to `config.js`
- Edit `config.js`

## Usage
`npm start` or just open `node start.lnk`.

## Linux bash verion
Requirements: gtts, playogg.

```
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

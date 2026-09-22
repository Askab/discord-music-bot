const fs = require('fs');
const path = require('path');

const {
    createAudioResource,
    StreamType
} = require('@discordjs/voice');

const ffmpegPath = require('ffmpeg-static');

class AudioService {

    createResource(fileName) {
        const filePath = path.join(
            process.cwd(),
            'audio',
            fileName
        );

        if (!fs.existsSync(filePath)) {
            throw new Error(`Audio file not found: ${filePath}`);
        }

        if (!ffmpegPath) {
            throw new Error('FFmpeg binary not found.');
        }

        console.log(`Using FFmpeg: ${ffmpegPath}`);
        console.log(`Loading audio: ${filePath}`);

        const stream = fs.createReadStream(filePath);

        return createAudioResource(stream, {
            inputType: StreamType.Arbitrary
        });
    }
}

module.exports = AudioService;
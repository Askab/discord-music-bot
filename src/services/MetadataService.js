const path = require('path');
const { parseFile } = require('music-metadata');

class MetadataService {

    async read(fileName) {
        const filePath = path.join(
            process.cwd(),
            'audio',
            fileName
        );

        const metadata = await parseFile(filePath);

        return {
            title: metadata.common.title ?? path.parse(fileName).name,
            artist: metadata.common.artist ?? 'Unknown artist',
            album: metadata.common.album ?? 'Unknown album',
            duration: metadata.format.duration ?? 0,
            fileName
        };
    }
}

module.exports = MetadataService;
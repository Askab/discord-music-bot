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

        const fallbackTitle =
            this.cleanFileName(fileName);

        const hasTitle =
            Boolean(metadata.common.title);

        const hasArtist =
            Boolean(metadata.common.artist);

        let title =
            metadata.common.title ?? fallbackTitle;

        let artist =
            metadata.common.artist ?? null;

        // If no metadata exists, try to extract
        // "Artist - Title" from the filename.
        if (!hasTitle && !hasArtist) {
            const separatorIndex =
                fallbackTitle.indexOf(' - ');

            if (separatorIndex !== -1) {
                artist =
                    fallbackTitle.slice(0, separatorIndex).trim();

                title =
                    fallbackTitle
                        .slice(separatorIndex + 3)
                        .trim();
            }
        }

        return {
            title,
            artist,
            album: metadata.common.album ?? null,
            duration: metadata.format.duration ?? 0,
            fileName
        };
    }

    cleanFileName(fileName) {
        
        return path
            .parse(fileName)
            .name
            .replace(/_/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }
}

module.exports = MetadataService;
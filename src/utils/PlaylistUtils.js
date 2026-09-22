const fs = require('fs');

function getPlaylistNames(audioPath) {
    const entries = fs.readdirSync(
        audioPath,
        { withFileTypes: true }
    );

    return entries
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name);
}

module.exports = {
    getPlaylistNames
};
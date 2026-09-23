const sharp = require('sharp');

const CARD_WIDTH = 1000;
const CARD_HEIGHT = 500;

function escapeXml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function formatDuration(seconds) {
    const totalSeconds = Math.max(
        0,
        Math.round(seconds)
    );

    const minutes = Math.floor(
        totalSeconds / 60
    );

    const remainingSeconds =
        totalSeconds % 60;

    return `${minutes}:${String(
        remainingSeconds
    ).padStart(2, '0')}`;
}

function getElapsedTime(player) {
    if (!player.currentTrackStartedAt) {
        return 0;
    }

    let elapsed =
        (Date.now() - player.currentTrackStartedAt) / 1000;

    elapsed -= player.pausedDuration / 1000;

    if (player.pausedAt) {
        elapsed -=
            (Date.now() - player.pausedAt) / 1000;
    }

    return Math.max(
        0,
        Math.min(
            player.currentTrack.duration,
            elapsed
        )
    );
}

function createProgressSegments(progress, count = 24) {
    const clampedProgress =
        Math.max(0, Math.min(1, progress));

    const filled =
        Math.round(clampedProgress * count);

    let result = '';

    for (let i = 0; i < count; i++) {
        result += `
            <rect
                x="${380 + i * 18}"
                y="292"
                width="14"
                height="24"
                rx="2"
                fill="${i < filled ? '#5865F2' : '#4A4D55'}"
            />
        `;
    }

    return result;
}

function createArtworkSvg(track) {
    if (!track.artwork) {
        return `
            <rect
                x="60"
                y="145"
                width="250"
                height="250"
                rx="18"
                fill="#202225"
            />

            <text
                x="185"
                y="275"
                text-anchor="middle"
                fill="#72767D"
                font-size="28"
                font-family="Arial, sans-serif"
            >
                🎵
            </text>
        `;
    }

    const base64 =
        track.artwork.data.toString('base64');

    const mimeType =
        track.artwork.format || 'image/jpeg';

    return `
        <defs>
            <clipPath id="artworkClip">
                <rect
                    x="60"
                    y="145"
                    width="250"
                    height="250"
                    rx="18"
                />
            </clipPath>
        </defs>

        <image
            href="data:${mimeType};base64,${base64}"
            x="60"
            y="145"
            width="250"
            height="250"
            preserveAspectRatio="xMidYMid slice"
            clip-path="url(#artworkClip)"
        />
    `;
}

async function renderMusicPlayer(player) {
    const track = player.currentTrack;

    if (!track) {
        return createEmptyPlayerCard();
    }

    const elapsed =
        getElapsedTime(player);

    const progress =
        track.duration > 0
            ? elapsed / track.duration
            : 0;

    const isPaused =
        player.audioPlayer.state.status === 'paused';

    const status =
        isPaused
            ? '⏸ Paused'
            : '▶ Playing';

    const queueSize =
        player.queue.size;

    const title =
        escapeXml(track.title);

    const artist =
        track.artist
            ? escapeXml(track.artist)
            : '';

    const artwork =
        createArtworkSvg(track);

    const progressSegments =
        createProgressSegments(progress);

    const svg = `
        <svg
            width="${CARD_WIDTH}"
            height="${CARD_HEIGHT}"
            viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}"
            xmlns="http://www.w3.org/2000/svg"
        >
            <rect
                width="1000"
                height="500"
                rx="28"
                fill="#18191C"
            />

            <rect
                x="0"
                y="0"
                width="8"
                height="500"
                rx="4"
                fill="#5865F2"
            />

            <text
                x="60"
                y="65"
                fill="#FFFFFF"
                font-size="30"
                font-weight="700"
                font-family="Arial, sans-serif"
            >
                🎵 Shuriya FM
            </text>

            ${artwork}

            <text
                x="350"
                y="175"
                fill="#FFFFFF"
                font-size="30"
                font-weight="700"
                font-family="Arial, sans-serif"
            >
                ${title}
            </text>

            ${
                artist
                    ? `
                        <text
                            x="350"
                            y="210"
                            fill="#B9BBBE"
                            font-size="20"
                            font-family="Arial, sans-serif"
                        >
                            ${artist}
                        </text>
                    `
                    : ''
            }

            <text
                x="350"
                y="260"
                fill="#FFFFFF"
                font-size="21"
                font-family="Arial, sans-serif"
            >
                ${status}
            </text>

            ${progressSegments}

            <text
                x="815"
                y="313"
                fill="#FFFFFF"
                font-size="20"
                font-family="Arial, sans-serif"
            >
                ${formatDuration(elapsed)}
                /
                ${formatDuration(track.duration)}
            </text>

            <text
                x="60"
                y="445"
                fill="#FFFFFF"
                font-size="20"
                font-family="Arial, sans-serif"
            >
                📋 ${queueSize} track${queueSize === 1 ? '' : 's'}
            </text>

            <text
                x="350"
                y="445"
                fill="#FFFFFF"
                font-size="20"
                font-family="Arial, sans-serif"
            >
                🗃 Queue
            </text>
        </svg>
    `;

    return sharp(
        Buffer.from(svg)
    )
        .png()
        .toBuffer();
}

async function createEmptyPlayerCard() {
    const svg = `
        <svg
            width="1000"
            height="500"
            xmlns="http://www.w3.org/2000/svg"
        >
            <rect
                width="1000"
                height="500"
                rx="28"
                fill="#18191C"
            />

            <rect
                width="8"
                height="500"
                fill="#5865F2"
            />

            <text
                x="60"
                y="70"
                fill="#FFFFFF"
                font-size="30"
                font-weight="700"
                font-family="Arial, sans-serif"
            >
                🎵 Shuriya FM
            </text>

            <text
                x="500"
                y="275"
                text-anchor="middle"
                fill="#B9BBBE"
                font-size="26"
                font-family="Arial, sans-serif"
            >
                Nothing is currently playing.
            </text>
        </svg>
    `;

    return sharp(
        Buffer.from(svg)
    )
        .png()
        .toBuffer();
}

module.exports = {
    renderMusicPlayer
};
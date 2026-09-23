const sharp = require('sharp');

const CARD_WIDTH = 1000;
const CARD_HEIGHT = 700;

const TRACKS_PER_PAGE = 10;

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

    const hours = Math.floor(
        totalSeconds / 3600
    );

    const minutes = Math.floor(
        (totalSeconds % 3600) / 60
    );

    const remainingSeconds =
        totalSeconds % 60;

    if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    }

    return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
}

function getPageData(player, page) {
    const totalTracks =
        player.queue.size;

    const totalPages =
        Math.max(
            1,
            Math.ceil(
                totalTracks / TRACKS_PER_PAGE
            )
        );

    const safePage =
        Math.max(
            0,
            Math.min(
                page,
                totalPages - 1
            )
        );

    const start =
        safePage * TRACKS_PER_PAGE;

    const tracks =
        player.queue.items.slice(
            start,
            start + TRACKS_PER_PAGE
        );

    return {
        tracks,
        page: safePage,
        totalPages,
        totalTracks
    };
}

async function renderQueueCard(
    player,
    page = 0
) {
    const {
        tracks,
        page: currentPage,
        totalPages,
        totalTracks
    } = getPageData(
        player,
        page
    );

    const currentTrack =
        player.currentTrack;

    const trackRows =
        tracks.map(
            (track, index) => {
                const absoluteIndex =
                    currentPage *
                        TRACKS_PER_PAGE +
                    index +
                    1;

                const title =
                    escapeXml(
                        track.displayName
                    );

                const duration =
                    formatDuration(
                        track.duration
                    );

                const y =
                    245 + index * 38;

                return `
                    <text
                        x="70"
                        y="${y}"
                        fill="#72767D"
                        font-size="18"
                        font-family="Arial, sans-serif"
                    >
                        ${String(
                            absoluteIndex
                        ).padStart(2, '0')}
                    </text>

                    <text
                        x="120"
                        y="${y}"
                        fill="#FFFFFF"
                        font-size="18"
                        font-family="Arial, sans-serif"
                    >
                        ${title}
                    </text>

                    <text
                        x="875"
                        y="${y}"
                        text-anchor="end"
                        fill="#B9BBBE"
                        font-size="17"
                        font-family="Arial, sans-serif"
                    >
                        ${duration}
                    </text>
                `;
            }
        )
        .join('');

    const currentTrackName =
        currentTrack
            ? escapeXml(
                currentTrack.displayName
            )
            : 'Nothing is currently playing.';

    const svg = `
        <svg
            width="${CARD_WIDTH}"
            height="${CARD_HEIGHT}"
            viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}"
            xmlns="http://www.w3.org/2000/svg"
        >
            <rect
                width="1000"
                height="700"
                rx="28"
                fill="#18191C"
            />

            <rect
                x="0"
                y="0"
                width="8"
                height="700"
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

            <text
                x="60"
                y="115"
                fill="#B9BBBE"
                font-size="18"
                font-family="Arial, sans-serif"
            >
                Queue
            </text>

            <rect
                x="60"
                y="140"
                width="880"
                height="62"
                rx="12"
                fill="#202225"
            />

            <text
                x="82"
                y="166"
                fill="#72767D"
                font-size="14"
                font-family="Arial, sans-serif"
            >
                NOW PLAYING
            </text>

            <text
                x="82"
                y="190"
                fill="#FFFFFF"
                font-size="19"
                font-weight="600"
                font-family="Arial, sans-serif"
            >
                ${currentTrackName}
            </text>

            <text
                x="70"
                y="225"
                fill="#72767D"
                font-size="15"
                font-family="Arial, sans-serif"
            >
                UP NEXT
            </text>

            ${trackRows}

            ${
                tracks.length === 0
                    ? `
                        <text
                            x="500"
                            y="350"
                            text-anchor="middle"
                            fill="#72767D"
                            font-size="22"
                            font-family="Arial, sans-serif"
                        >
                            The queue is empty.
                        </text>
                    `
                    : ''
            }

            <line
                x1="60"
                y1="625"
                x2="940"
                y2="625"
                stroke="#2F3136"
                stroke-width="2"
            />

            <text
                x="70"
                y="660"
                fill="#B9BBBE"
                font-size="17"
                font-family="Arial, sans-serif"
            >
                ${totalTracks} track${totalTracks === 1 ? '' : 's'}
            </text>

            <text
                x="500"
                y="660"
                text-anchor="middle"
                fill="#B9BBBE"
                font-size="17"
                font-family="Arial, sans-serif"
            >
                Page ${currentPage + 1} / ${totalPages}
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
    renderQueueCard,
    TRACKS_PER_PAGE
};
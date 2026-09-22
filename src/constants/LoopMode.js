const LoopMode = Object.freeze({
    OFF: 'off',
    TRACK: 'track',
    QUEUE: 'queue'
});

const LoopModeLabels = Object.freeze({
    [LoopMode.OFF]: 'Off',
    [LoopMode.TRACK]: 'Track',
    [LoopMode.QUEUE]: 'Queue'
});

const LoopModeEmojis = Object.freeze({
    [LoopMode.OFF]: '🔁',
    [LoopMode.TRACK]: '🔂',
    [LoopMode.QUEUE]: '🔁'
});

module.exports = {
    LoopMode,
    LoopModeLabels,
    LoopModeEmojis
};
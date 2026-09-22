class Queue {

    constructor() {
        this.items = [];
    }

    add(track) {
        this.items.push(track);
    }

    next() {
        return this.items.shift();
    }

    clear() {
        this.items = [];
    }

    get size() {
        return this.items.length;
    }

    get current() {
        return this.items[0];
    }

    randomize() {
        for (let i = this.items.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));

            [this.items[i], this.items[j]] =
                [this.items[j], this.items[i]];
        }
    }
}

module.exports = Queue;
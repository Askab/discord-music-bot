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
}

module.exports = Queue;
export class Stats {
    total = 0;
    connected = 0;
    disconnected = 0;
    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}

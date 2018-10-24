export class DeviceStats {
    total = 0;
    connected = 0;
    disconnected = 0;
    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}

export class SolutionStats {
    total = 0;
    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}

export class SolutionBlueprintStats {
    total = 0;
    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}

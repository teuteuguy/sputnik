export class ConnectionState {
    state: string;
    at: string;
    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}

export class Device {
    thingId: string;
    thingName: string;
    thingArn: string;
    name: string;
    deviceTypeId: string;
    blueprintId: string;
    connectionState: ConnectionState;
    createdAt: string;
    updatedAt: string;

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}

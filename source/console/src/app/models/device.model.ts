export class ConnectionState {
    state: string;
    at: string;
    certificateId: string;
    certificateArn: string;
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
    lastDeploymentId: string;
    createdAt: string;
    updatedAt: string;

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}

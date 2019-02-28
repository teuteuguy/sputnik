export class ConnectionState {
    state: string;
    at: string;
    certificateId: string;
    certificateArn: string;
    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}

export class DeviceCert {
    url: string;
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
    deviceBlueprintId: string;
    greengrassGroupId: string;
    spec: any = {};
    connectionState: ConnectionState = new ConnectionState();
    cert: DeviceCert = new DeviceCert();
    lastDeploymentId: string;
    createdAt: string;
    updatedAt: string;

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}

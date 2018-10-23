export class DeviceBlueprint {
    id: string;
    name = 'UNKNOWN';
    type = 'UNKNOWN';
    compatibility: string[] = [];
    deviceTypeMappings: any = [];
    spec: any = {};
    createdAt: string;
    updatedAt: string;

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}

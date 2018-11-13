export class DeviceType {
    id: string;
    name = 'UNKNOWN';
    type = 'UNKNOWN';
    spec: any = {};
    createdAt: string;
    updatedAt: string;

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}

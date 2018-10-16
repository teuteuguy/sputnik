export class DeviceType {
    id: string;
    name = 'UNKNOWN';
    type = 'UNKNOWN';
    spec = '{}';
    createdAt: string;
    updatedAt: string;

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}

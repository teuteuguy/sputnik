export class DeviceTypeMapping {
    value: any = { deviceTypeId: 'value needing to replace with' };
    substitute = 'SUBSTITUTE_WORD_IN_TEMPLATE';
}

export class Blueprint {
    id: string;
    name = 'UNKNOWN';
    type: 'UNKNOWN';
    compatibility: string[] = [];
    deviceTypeMappings: DeviceTypeMapping[];
    spec: any;
    createdAt: string;
    updatedAt: string;

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}

export class SolutionBlueprint {
    id: string;
    name = 'new';
    description = 'UNKNOWN';
    prefix = 'MTM_';
    spec: any = {};
    createdAt: string;
    updatedAt: string;

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}

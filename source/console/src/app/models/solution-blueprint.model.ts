export class SolutionBlueprint {
    id: string;
    name: string;
    description: string;
    spec: any;
    createdAt: string;
    updatedAt: string;

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}

export class Solution {
    id: string;
    name = 'new';
    description = 'UNKNOWN';
    deviceIds: string[] = [];
    solutionBlueprintId: string; // = 'UNKNOWN';
    createdAt: string;
    updatedAt: string;

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}

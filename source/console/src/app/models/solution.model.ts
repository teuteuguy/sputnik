export class Solution {
    id: string;
    name = 'UNKNOWN';
    description = 'UNKNOWN';
    deviceIds: string[] = [];
    solutionBlueprintId: string; // = 'UNKNOWN';
    createdAt: string;
    updatedAt: string;

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}

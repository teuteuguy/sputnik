export class Solution {
    id: string;
    name = 'UNKNOWN';
    description = 'UNKNOWN';
    thingIds: string[] = [];
    solutionBlueprintId = 'UNKNOWN';
    createdAt: string;
    updatedAt: string;

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}

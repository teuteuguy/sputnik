export class Solution {
    id: string;
    name: string;
    description: string;
    thingIds: string[];
    solutionBlueprintId: string;
    createdAt: string;
    updatedAt: string;

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}

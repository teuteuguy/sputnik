export class Solution {
    id: string;
    thingId: string;
    name: string;
    solutionBlueprintId: string;
    createdAt: string;
    updatedAt: string;

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}

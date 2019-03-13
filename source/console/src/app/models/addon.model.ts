
export class AddOn {
    id: string;
    name: string;
    key: string;
    img: string;
    version: string;
    description: string;

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}

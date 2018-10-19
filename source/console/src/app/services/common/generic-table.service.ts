import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

// Models
class FUNCTION {
    name: string;
    func: any
    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}
class API {
    list: FUNCTION;
    get: FUNCTION;
    put: FUNCTION;
    update: FUNCTION;
    delete: FUNCTION;
    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}

// Services
import { AppSyncService } from './appsync.service';

// Helpers
import { _ } from 'underscore';

// Queries
// Mutations
// Subscriptions

@Injectable()
export class GenericTableService extends AppSyncService {

    constructor(private _api: API) {
        super();
    }

    public list(limit: number, nextToken: String) {
        return super
            .query(this._api.list.func, { limit: limit, nextToken: nextToken })
            .then(result => result.data[this._api.list.name]);
    }

    public get(fieldName: string, id: string) {
        let params = {};
        params[fieldName] = id;
        return super.query(this._api.get.func, params).then(result => result.data[this._api.get.name]);
    }

}

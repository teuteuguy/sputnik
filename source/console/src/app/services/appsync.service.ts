import { Injectable } from '@angular/core';

// AWS
import { AmplifyService } from 'aws-amplify-angular';

@Injectable()
export class AppSyncService {

    constructor(private _amplifyService: AmplifyService) {}

    protected query(query, params) {
        const _self = this;
        const promise: any = _self._amplifyService.api().graphql({ query: query.loc.source.body, variables: params });
        return promise;
    }
    protected mutation(mutation, params) {
        const _self = this;
        const promise: any = _self._amplifyService.api().graphql({ query: mutation.loc.source.body, variables: params });
        return promise;
    }
    protected subscribe(subscription, params) {
        const _self = this;
        const obs: any = _self._amplifyService.api().graphql({ query: subscription.loc.source.body, variables: params });
        return obs;
    }
}

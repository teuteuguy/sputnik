import { Injectable } from '@angular/core';

// Models
import { Setting } from '../models/setting.model';

// Services
import { AppSyncService } from './common/appsync.service';

// Helpers
import { _ } from 'underscore';

// Queries
import getThingAutoRegistrationState from '../graphql/queries/thing-auto-registration-state.get';
import setThingAutoRegistrationState from '../graphql/mutations/thing-auto-registration-state.set';
import getSetting from '../graphql/queries/setting.get';


@Injectable()
export class SettingService extends AppSyncService {
    constructor() {
        super();
    }

    public getSetting(id: string) {
        return super.query(getSetting, { id: id }).then(result => {
            if (result.data.getSetting !== null) {
                result.data.getSetting.setting = JSON.parse(result.data.getSetting.setting);
            }
            return <Setting>result.data.getSetting;
        });
    }

    public getThingAutoRegistrationState() {
        return super.query(getThingAutoRegistrationState, {}).then(result => {
            return result.data.getThingAutoRegistrationState;
        });
    }
    public setThingAutoRegistrationState(enabled: boolean) {
        return super.query(setThingAutoRegistrationState, { enabled: enabled }).then(result => {
            return result.data.setThingAutoRegistrationState;
        });
    }
}

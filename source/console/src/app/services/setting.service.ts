import { Injectable } from '@angular/core';

// Models
import { Setting } from '../models/setting.model';

// Services
import { AppSyncService } from './appsync.service';

// Helpers
import { _ } from 'underscore';


@Injectable()
export class SettingService {
    constructor(private appSyncService: AppSyncService) {}

    public getSetting = this.appSyncService.getSetting;
    public getThingAutoRegistrationState = this.appSyncService.getThingAutoRegistrationState;
    public setThingAutoRegistrationState = this.appSyncService.setThingAutoRegistrationState;
}

import { Injectable } from '@angular/core';

// Services
import { LoggerService } from './logger.service';
import { AppSyncService } from './appsync.service';

// Helpers
import { _ } from 'underscore';

@Injectable()
export class FactoryResetService {
    constructor(private logger: LoggerService, private appSyncService: AppSyncService) {
    }

    public factoryReset = this.appSyncService.factoryReset;
}

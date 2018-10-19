import { Injectable } from '@angular/core';

// Models
import { DeviceType } from '../models/device-type.model';

// Services
import { LoggerService } from './logger.service';
import { AppSyncService } from './common/appsync.service';

// Helpers
import { _ } from 'underscore';

// Queries
import factoryReset from '../graphql/mutations/factoryReset';

@Injectable()
export class FactoryResetService extends AppSyncService {
    constructor(private logger: LoggerService) {
        super();
    }

    public factoryReset(cmd) {
        return super.query(factoryReset, { cmd: cmd }).then(result => {
            return <boolean>result.data.factoryReset;
        });
    }
}

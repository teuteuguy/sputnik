import { Injectable } from '@angular/core';

// AWS
import { AmplifyService } from 'aws-amplify-angular';

// Models
import { DeviceType } from '../models/device-type.model';

// Services
import { LoggerService } from './logger.service';
import { AppSyncService } from './appsync.service';

// Helpers
import { _ } from 'underscore';

// Queries
import factoryReset from '../graphql/mutations/factoryReset';

@Injectable()
export class FactoryResetService extends AppSyncService {
    constructor(private logger: LoggerService, private amplifyService: AmplifyService) {
        super(amplifyService);
    }

    public factoryReset(cmd) {
        return super.query(factoryReset, { cmd: cmd }).then(result => {
            return <boolean>result.data.factoryReset;
        });
    }
}

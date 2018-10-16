import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

// AWS
import { AmplifyService } from 'aws-amplify-angular';

// Models
import { Deployment } from '../models/deployment.model';
import { Stats } from '../models/stats.model';

// Services
import { LoggerService } from './logger.service';
import { AppSyncService } from './appsync.service';

// Helpers
import { _ } from 'underscore';

// Queries
import getDeployments from '../graphql/queries/deployments.get';
// Mutations
// Subscriptions

@Injectable()
export class DeploymentService extends AppSyncService {

    constructor(private logger: LoggerService, private amplifyService: AmplifyService) {
        super(amplifyService);
    }

    public getDeployments(limit: number, nextToken: String) {
        return super.query(getDeployments, { limit: limit, nextToken: nextToken }).then(result => result.data.getDeployments);
    }

}

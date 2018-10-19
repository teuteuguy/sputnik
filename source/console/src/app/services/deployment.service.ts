import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

// Models
import { Deployment } from '../models/deployment.model';
import { Stats } from '../models/stats.model';

// Services
import { LoggerService } from './logger.service';
import { AppSyncService } from './common/appsync.service';

// Helpers
import { _ } from 'underscore';

// Queries
import listDeployments from '../graphql/queries/deployments.list';
// Mutations
// Subscriptions

@Injectable()
export class DeploymentService extends AppSyncService {

    constructor(private logger: LoggerService) {
        super();
    }

    public getDeployments(limit: number, nextToken: String) {
        return super
            .query(listDeployments, { limit: limit, nextToken: nextToken })
            .then(result => result.data.listDeployments);
    }

}

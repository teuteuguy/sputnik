import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';

// Models
import { DeviceStats, SolutionStats } from '../models/stats.model';

// Services
import { LoggerService } from './logger.service';
import { AppSyncService } from './appsync.service';

// Helpers
import { _ } from 'underscore';

export class Stats {
    deviceStats: DeviceStats;
    solutionStats: SolutionStats;
    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}

@Injectable()
export class StatService {
    private observer: any = new Subject<Stats>();
    private pollerInterval: any = null;
    statObservable$ = this.observer.asObservable();

    constructor(private logger: LoggerService, private appSyncService: AppSyncService) {
        const _self = this;
        this.loadStats();
        this.pollerInterval = setInterval(function() {
            _self.loadStats();
        }, environment.refreshInterval);
    }

    loadStats() {
        Promise.all([
            this.appSyncService.getDeviceStats(),
            this.appSyncService.getSolutionStats()
        ]).then(results => {
            this.observer.next(new Stats({
                deviceStats: results[0],
                solutionStats: results[1]
            }));
        }).catch(err => {
            this.logger.error('error occurred calling getDeviceStats api, show message');
            this.logger.error(err);
        });
    }

    refresh() {
        this.loadStats();
    }
}

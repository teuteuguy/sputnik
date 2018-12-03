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
    private pollerInterval: any = null;

    private observer: any = new Subject<Stats>();
    statObservable$ = this.observer.asObservable();

    constructor(
        private logger: LoggerService,
        private appSyncService: AppSyncService
    ) {
        const _self = this;
        _self.logger.info('StatService.constructor:');
        _self.pollerInterval = setInterval(function() {
            _self.logger.info('StatService.constructor: pollerInterval');
            _self.refresh();
        }, environment.refreshInterval);
        _self.refresh();
    }

    loadStats() {
        const _self = this;
        Promise.all([_self.appSyncService.getDeviceStats(), _self.appSyncService.getSolutionStats()])
            .then(results => {
                _self.observer.next(new Stats({ deviceStats: results[0], solutionStats: results[1] }));
            })
            .catch(err => {
                _self.logger.warn('error occurred calling getDeviceStats api, show message');
                _self.logger.warn(err);
            });
    }

    refresh() {
        this.loadStats();
    }
}

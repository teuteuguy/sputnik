import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';

// Services
import { LoggerService } from './logger.service';
import { AppSyncService } from './appsync.service';

// Helpers
import { _ } from 'underscore';

@Injectable()
export class StatService {
    private stat: any = new Subject<any>();
    private pollerInterval: any = null;
    statObservable$ = this.stat.asObservable();

    constructor(private logger: LoggerService, private appSyncService: AppSyncService) {
        const _self = this;
        this.loadStats();
        this.pollerInterval = setInterval(function() {
            _self.loadStats();
        }, environment.refreshInterval);
    }

    loadStats() {
        this.appSyncService.getDeviceStats()
            .then((data: any) => {
                this.stat.next(data);
            })
            .catch(err => {
                this.logger.error('error occurred calling getDeviceStats api, show message');
                this.logger.error(err);
            });
    }

    refresh() {
        this.loadStats();
    }
}

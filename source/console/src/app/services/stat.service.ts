import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';

// Services
import { LoggerService } from './logger.service';
import { AppSyncService } from './common/appsync.service';
import { DeviceService } from './device.service';

// Helpers
import { _ } from 'underscore';

@Injectable()
export class StatService extends AppSyncService {
    private stat: any = new Subject<any>();
    private pollerInterval: any = null;
    statObservable$ = this.stat.asObservable();

    constructor(
        private logger: LoggerService,
        private deviceService: DeviceService
    ) {
        super();
        const _self = this;
        this.loadStats();
        this.pollerInterval = setInterval(function() {
            _self.loadStats();
        }, environment.refreshInterval);
    }

    loadStats() {
        this.deviceService
            .getDeviceStats()
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

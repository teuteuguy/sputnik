import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';

// AWS
import { AmplifyService } from 'aws-amplify-angular';

// Models
// import { Stats } from '../models/stats.model';

// Services
import { LoggerService } from './logger.service';
import { AppSyncService } from './appsync.service';
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
        private deviceService: DeviceService,
        private amplifyService: AmplifyService
    ) {
        super(amplifyService);
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

    // constructor(private logger: LoggerService, private amplifyService: AmplifyService) {
    //     super(amplifyService);
    // }
    // public getStat(stat: String) {
    //     return super
    //         .query(getStat, { stat: stat })
    //         .then(d => {
    //             return <Stat>d.data.getStat;
    //         });
    // }
}

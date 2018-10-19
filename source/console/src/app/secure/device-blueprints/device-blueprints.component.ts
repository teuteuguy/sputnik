import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import swal from 'sweetalert2';
import { _ } from 'underscore';

// Models
import { ProfileInfo } from '../../models/profile-info.model';
import { DeviceBlueprint } from '../../models/device-blueprint.model';

// Services
import { BreadCrumbService, Crumb } from '../../services/bread-crumb.service';
import { LoggerService } from '../../services/logger.service';
import { DeviceBlueprintService } from '../../services/device-blueprint.service';

// Helpers
import * as moment from 'moment';
declare var jquery: any;
declare var $: any;
// declare var swal: any;

@Component({
    selector: 'app-root-device-blueprints',
    templateUrl: './device-blueprints.component.html'
})
export class DeviceBlueprintsComponent implements OnInit {
    public title = 'Device Blueprints';
    private profile: ProfileInfo;
    public deviceBlueprints: DeviceBlueprint[] = [];
    public pages: any = {
        current: 1,
        total: 0,
        pageSize: 20
    };
    public metrics: any = {
        total: 0
    };

    @BlockUI()
    blockUI: NgBlockUI;

    constructor(
        public router: Router,
        private breadCrumbService: BreadCrumbService,
        private deviceBlueprintService: DeviceBlueprintService,
        protected localStorage: LocalStorage,
        private logger: LoggerService,
        private _ngZone: NgZone
    ) {}

    ngOnInit() {
        const _self = this;
        _self.blockUI.start('Loading blueprints...');

        _self.breadCrumbService.setup(_self.title, [
            new Crumb({ title: _self.title, active: true, link: 'blueprints' })
        ]);

        _self.localStorage.getItem<ProfileInfo>('profile').subscribe(profile => {
            _self.profile = new ProfileInfo(profile);
            _self.loadBlueprints();
        });

        _self.deviceBlueprintService.blueprintsObservable$.subscribe(message => {
            _self.updatePaging();
            _self._ngZone.run(() => {});
        });
    }

    loadBlueprints() {
        const _self = this;
        _self.deviceBlueprints = _self.deviceBlueprintService.getDeviceBlueprints();
        _self.updatePaging();
        _self.blockUI.stop();

    }

    updatePaging() {
        const _self = this;
        _self.metrics.total = _self.deviceBlueprints.length;
        _self.pages.total = Math.ceil(_self.metrics.total / _self.pages.pageSize);
    }

    refreshData() {
        this.blockUI.start('Loading device blueprints...');
        this.loadBlueprints();
    }

    nextPage() {
        this.pages.current++;
        this.blockUI.start('Loading device blueprints...');
        this.loadBlueprints();
    }

    previousPage() {
        this.pages.current--;
        this.blockUI.start('Loading device blueprints...');
        this.loadBlueprints();
    }

    openBlueprint(id: string) {
        this.router.navigate([['/securehome/device-blueprints', id].join('/')]);
    }
}

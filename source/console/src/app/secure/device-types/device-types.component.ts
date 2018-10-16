import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import swal from 'sweetalert2';

// Models
import { ProfileInfo } from '../../models/profile-info.model';
import { DeviceType } from '../../models/device-type.model';

// Services
import { BreadCrumbService, Crumb } from '../../services/bread-crumb.service';
import { DeviceTypeService } from '../../services/device-type.service';
import { LoggerService } from '../../services/logger.service';

// Helpers
import * as moment from 'moment';
declare var jquery: any;
declare var $: any;

@Component({
    selector: 'app-root-device-types',
    templateUrl: './device-types.component.html'
})
export class DeviceTypesComponent implements OnInit {
    public title = 'Device Types';
    private profile: ProfileInfo;
    public deviceTypes: DeviceType[] = [];
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
        private deviceTypeService: DeviceTypeService,
        protected localStorage: LocalStorage,
        private logger: LoggerService,
        private _ngZone: NgZone
    ) {}

    ngOnInit() {
        const _self = this;
        _self.blockUI.start('Loading device types...');

        _self.breadCrumbService.setup(_self.title, [new Crumb({ title: _self.title, active: true, link: 'device-types' })]);

        _self.localStorage.getItem<ProfileInfo>('profile').subscribe(profile => {
            _self.profile = new ProfileInfo(profile);
            _self.loadDeviceTypes();
        });

        _self.deviceTypeService.deviceTypesObservable$.subscribe(message => {
            _self.updatePaging();
            _self._ngZone.run(() => {});
        });
    }

    updatePaging() {
        const _self = this;
        _self.metrics.total = _self.deviceTypes.length;
        _self.pages.total = Math.ceil(_self.metrics.total / _self.pages.pageSize);
    }

    loadDeviceTypes() {
        const _self = this;
        _self.deviceTypes = _self.deviceTypeService.getDeviceTypes();
        _self.updatePaging();
        _self.blockUI.stop();
    }

    refreshData() {
        this.blockUI.start('Loading device types...');
        this.deviceTypeService.refresh();
        this.pages.current = 1;
    }

    openDeviceType(typeId: string) {
        this.router.navigate([['/securehome/device-types', typeId].join('/')]);
    }

    formatDate(dt: string) {
        if (dt) {
            return moment(dt).format('MMM Do YYYY');
        } else {
            return '';
        }
    }

    nextPage() {
        this.pages.current++;
        this.blockUI.start('Loading device types...');
        this.loadDeviceTypes();
    }

    previousPage() {
        this.pages.current--;
        this.blockUI.start('Loading device types...');
        this.loadDeviceTypes();
    }
}

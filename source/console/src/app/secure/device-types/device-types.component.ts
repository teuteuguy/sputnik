import { Component, OnInit, NgZone, ComponentFactoryResolver } from '@angular/core';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { Router, NavigationExtras } from '@angular/router';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import swal from 'sweetalert2';

// Parent
import {
    GenericTableComponent,
    GenericTableParams,
    GenericTableElementParams
} from '../../common/components/generic-table/generic-table.component';
// Childs
import { DeviceTypesModalComponent } from './device-types.modal.component';

// Models
import { DeviceType } from '../../models/device-type.model';
import { ProfileInfo } from '../../models/profile-info.model';

// Services
import { BreadCrumbService, Crumb } from '../../services/bread-crumb.service';
import { DeviceTypeService } from '../../services/device-type.service';
import { LoggerService } from '../../services/logger.service';

@Component({
    selector: 'app-root-device-types',
    // templateUrl: './device-types.component.html'
    templateUrl: '../../common/components/generic-table/generic-table.component.html'
})
export class DeviceTypesComponent extends GenericTableComponent implements OnInit {
    @BlockUI()
    blockUI: NgBlockUI;

    constructor(
        public router: Router,
        private breadCrumbService: BreadCrumbService,
        private deviceTypeService: DeviceTypeService,
        private localStorage: LocalStorage,
        private logger: LoggerService,
        private _ngZone: NgZone,
        private resolver: ComponentFactoryResolver
    ) {
        super(logger, resolver);

        this.params = <GenericTableParams>{
            path: '/securehome/device-types',
            pageTitle: 'Device Types',
            createElement: <GenericTableElementParams>{
                text: 'Create NEW Device Type',
                modal: DeviceTypesModalComponent,
                link: false
            },
            editElement: <GenericTableElementParams>{
                text: 'Edit',
                modal: DeviceTypesModalComponent,
                link: false
            },
            fields: [
                { attr: 'type', text: 'type' },
                { attr: 'name', text: 'Name' },
                { attr: 'createdAt', text: 'Created At', class: 'text-right', format: 'date' },
                { attr: 'updatedAt', text: 'Last Updated At', class: 'text-right', format: 'date' }
            ],
            viewLink: true,
            editLink: false,
            cachedMode: true
        };

        this.handleDelete.subscribe((element: DeviceType) => {
            console.log(element);
        });

        this.data = deviceTypeService.deviceTypes;
    }

    ngOnInit() {
        const _self = this;
        _self.blockUI.start('Loading device types...');

        _self.breadCrumbService.setup(_self.params.pageTitle, [
            new Crumb({ title: _self.params.pageTitle, active: true, link: 'device-types' })
        ]);

        _self.deviceTypeService.deviceTypesObservable$.subscribe(deviceTypes => {
            _self.cleanup();
            _self.blockUI.stop();
            _self._ngZone.run(() => {});
        });

        _self.load();
    }

    cleanup() {
        this.dataStats.total = this.deviceTypeService.deviceTypes.length;
        this.updatePaging();
    }

    load() {
        // this.data = this.deviceTypeService.deviceTypes;
        this.blockUI.stop();
        this.cleanup();
    }

    refreshData() {
        this.blockUI.start('Loading device types...');
        this.deviceTypeService.refresh();
        this.pages.current = 1;
    }

    open(elem: DeviceType) {
        console.log(elem);
        // const queryParams: NavigationExtras = { queryParams: { edit: edit } };
        // this.router.navigate([['/securehome/device-types', elem.id].join('/')], queryParams);
        this.router.navigate([['/securehome/device-types', elem.id].join('/')]);
    }
}

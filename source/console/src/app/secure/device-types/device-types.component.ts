import { Component, OnInit, NgZone, ComponentFactoryResolver } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import swal from 'sweetalert2';

// User stuff
import { LocalStorage } from '@ngx-pwa/local-storage';
import { ProfileInfo } from '../../models/profile-info.model';

// Parent
import {
    GenericTableComponent,
    GenericTableParams,
    GenericTableElementParams
} from '../common/generic-table.component';
// Childs
import { DeviceTypesModalComponent } from './device-types.modal.component';

// Models
import { DeviceType } from '../../models/device-type.model';

// Services
import { BreadCrumbService, Crumb } from '../../services/bread-crumb.service';
import { DeviceTypeService } from '../../services/device-type.service';
import { LoggerService } from '../../services/logger.service';

@Component({
    selector: 'app-root-device-types',
    // templateUrl: './device-types.component.html'
    templateUrl: '../common/generic-table.component.html'
})
export class DeviceTypesComponent extends GenericTableComponent implements OnInit {
    private isAdminUser: boolean;
    private profile: ProfileInfo;

    @BlockUI()
    blockUI: NgBlockUI;

    constructor(
        public router: Router,
        private breadCrumbService: BreadCrumbService,
        private deviceTypeService: DeviceTypeService,
        private localStorage: LocalStorage,
        private logger: LoggerService,
        private ngZone: NgZone,
        private resolver: ComponentFactoryResolver
    ) {
        super(logger, resolver);

        this.localStorage.getItem<ProfileInfo>('profile').subscribe((profile: ProfileInfo) => {
            this.profile = new ProfileInfo(profile);
            this.isAdminUser = this.profile.isAdmin();

            this.params = <GenericTableParams>{
                path: '/securehome/device-types',
                pageTitle: 'Device Types',
                createElement: <GenericTableElementParams>{
                    text: 'Create NEW Device Type',
                    modal: DeviceTypesModalComponent,
                    modalName: 'defaultDeviceTypesModal',
                    link: false
                },
                editElement: <GenericTableElementParams>{
                    text: 'Edit',
                    modal: DeviceTypesModalComponent,
                    modalName: 'defaultDeviceTypesModal',
                    link: false
                },
                viewElement: <GenericTableElementParams>{
                    text: 'View',
                    modal: DeviceTypesModalComponent,
                    modalName: 'defaultDeviceTypesModal',
                    link: false
                },
                deleteElement: this.isAdminUser,
                fields: [
                    { attr: 'type', text: 'type' },
                    { attr: 'name', text: 'Name' },
                    { attr: 'createdAt', text: 'Created At', class: 'text-right', format: 'date' },
                    { attr: 'updatedAt', text: 'Last Updated At', class: 'text-right', format: 'date' }
                ],
                cachedMode: true
            };

            this.handleDelete.subscribe((element: DeviceType) => {
                const _self = this;
                swal({
                    title: 'Are you sure you want to delete this device type?',
                    text: `You won't be able to revert this!`,
                    type: 'question',
                    showCancelButton: true,
                    cancelButtonColor: '#3085d6',
                    confirmButtonColor: '#d33',
                    confirmButtonText: 'Yes, delete it!'
                }).then(result => {
                    if (result.value) {
                        _self.blockUI.start('Deleting device...');
                        _self.deviceTypeService
                            .delete(element.id)
                            .then((resp: any) => {
                                console.log(resp);
                                _self.blockUI.stop();
                            })
                            .catch(err => {
                                _self.blockUI.stop();
                                swal('Oops...', 'Something went wrong! Unable to delete the device type.', 'error');
                                _self.logger.error('error occurred calling deleteDeviceType api, show message');
                                _self.logger.error(err);
                            });
                    }
                });
            });

            this.data = deviceTypeService.deviceTypes;
        });
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
            _self.ngZone.run(() => {});
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

import { Component, OnInit, NgZone, ComponentFactoryResolver } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { LocalStorage } from '@ngx-pwa/local-storage';
import swal from 'sweetalert2';

// Models
import { DeviceBlueprint } from '@models/device-blueprint.model';
import { ProfileInfo } from '@models/profile-info.model';

// Services
import { BreadCrumbService, Crumb } from '@services/bread-crumb.service';
import { DeviceBlueprintService } from '@services/device-blueprint.service';
import { LoggerService } from '@services/logger.service';

@Component({
    selector: 'app-root-device-blueprints',
    templateUrl: './device-blueprints.component.html'
})
export class DeviceBlueprintsComponent implements OnInit {
    private profile: ProfileInfo;

    public isAdminUser: boolean;
    public tableData: DeviceBlueprint[];
    public tableHeaders = [
        { attr: 'type', name: 'type' },
        { attr: 'name', name: 'Name' },
        { attr: 'createdAt', name: 'Created At', class: 'text-right', pipe: 'moment', pipeValue: 'MMM Do YYYY' },
        { attr: 'updatedAt', name: 'Last Updated At', class: 'text-right', pipe: 'moment', pipeValue: 'MMM Do YYYY' }
    ];
    public totalDeviceBlueprints: number;
    public pages: any = {
        current: 1,
        total: 0,
        pageSize: 20
    };
    public pageTitle = 'Device Blueprints';

    @BlockUI()
    blockUI: NgBlockUI;

    constructor(
        public router: Router,
        private breadCrumbService: BreadCrumbService,
        private deviceBlueprintService: DeviceBlueprintService,
        private localStorage: LocalStorage,
        private logger: LoggerService,
        private ngZone: NgZone,
        private resolver: ComponentFactoryResolver
    ) {
        this.totalDeviceBlueprints = 0;
        this.tableData = deviceBlueprintService.deviceBlueprints;
    }

    ngOnInit() {
        const self = this;

        self.blockUI.start(`Loading ${self.pageTitle}...`);

        self.localStorage.getItem<ProfileInfo>('profile').subscribe((profile: ProfileInfo) => {
            self.profile = new ProfileInfo(profile);
            self.isAdminUser = self.profile.isAdmin();

            self.breadCrumbService.setup(self.pageTitle, [
                new Crumb({ title: self.pageTitle, active: true, link: 'device-blueprints' })
            ]);

            self.deviceBlueprintService.deviceBlueprintsObservable$.subscribe(deviceBlueprints => {
                self.ngZone.run(() => {
                    self.load();
                });
            });

            self.load();
        });
    }

    private load() {
        this.blockUI.stop();
        this.updatePaging();
    }

    private updatePaging() {
        this.totalDeviceBlueprints = this.deviceBlueprintService.deviceBlueprints.length;
        this.pages.total = Math.ceil(this.totalDeviceBlueprints / this.pages.pageSize);
    }

    refreshData() {
        this.blockUI.start(`Loading ${this.pageTitle}...`);
        this.deviceBlueprintService.refresh();
        this.pages.current = 1;
    }

    handleCreate() {
        this.router.navigate(['securehome/device-blueprints/new']);
    }
}










// import { Component, OnInit, NgZone, ComponentFactoryResolver } from '@angular/core';
// import { Router, NavigationExtras } from '@angular/router';
// import { BlockUI, NgBlockUI } from 'ng-block-ui';
// import { LocalStorage } from '@ngx-pwa/local-storage';
// import swal from 'sweetalert2';
// import { _ } from 'underscore';

// // Parent
// import {
//     GenericTableComponent,
//     GenericTableParams,
//     GenericTableElementParams
// } from '../common/generic-table.component';

// // Models
// import { DeviceBlueprint } from '@models/device-blueprint.model';
// import { ProfileInfo } from '@models/profile-info.model';

// // Services
// import { BreadCrumbService, Crumb } from '@services/bread-crumb.service';
// import { DeviceBlueprintService } from '@services/device-blueprint.service';
// import { LoggerService } from '@services/logger.service';

// // // Helpers
// // import * as moment from 'moment';
// // declare var jquery: any;
// // declare var $: any;
// // // declare var swal: any;

// @Component({
//     selector: 'app-root-device-blueprints',
//     // templateUrl: './device-blueprints.component.html'
//     templateUrl: '../common/generic-table.component.html'
// })
// export class DeviceBlueprintsComponent extends GenericTableComponent implements OnInit {
//     private isAdminUser: boolean;
//     private profile: ProfileInfo;

//     @BlockUI()
//     blockUI: NgBlockUI;

//     constructor(
//         public router: Router,
//         private breadCrumbService: BreadCrumbService,
//         private deviceBlueprintService: DeviceBlueprintService,
//         private localStorage: LocalStorage,
//         private logger: LoggerService,
//         private ngZone: NgZone,
//         private resolver: ComponentFactoryResolver
//     ) {
//         super(logger, resolver);

//         this.localStorage.getItem<ProfileInfo>('profile').subscribe((profile: ProfileInfo) => {
//             this.profile = new ProfileInfo(profile);
//             this.isAdminUser = this.profile.isAdmin();

//             this.params = <GenericTableParams>{
//                 path: '/securehome/device-blueprints',
//                 pageTitle: 'Device Blueprints',
//                 createElement: <GenericTableElementParams>{
//                     text: 'Create NEW Device Blueprint',
//                     modal: DeviceBlueprintsModalComponent,
//                     modalName: 'defaultDeviceBlueprintsModal',
//                     link: false
//                 },
//                 editElement: <GenericTableElementParams>{
//                     text: 'Edit',
//                     modal: DeviceBlueprintsModalComponent,
//                     modalName: 'defaultDeviceBlueprintsModal',
//                     link: false
//                 },
//                 viewElement: <GenericTableElementParams>{
//                     text: 'View',
//                     modal: DeviceBlueprintsModalComponent,
//                     modalName: 'defaultDeviceBlueprintsModal',
//                     link: false
//                 },
//                 deleteElement: this.isAdminUser,
//                 fields: [
//                     { attr: 'type', text: 'type' },
//                     { attr: 'name', text: 'Name' },
//                     { attr: 'createdAt', text: 'Created At', class: 'text-right', format: 'date' },
//                     { attr: 'updatedAt', text: 'Last Updated At', class: 'text-right', format: 'date' }
//                 ],
//                 cachedMode: true
//             };
//             this.handleDelete.subscribe((element: DeviceBlueprint) => {
//                 const _self = this;
//                 swal({
//                     title: 'Are you sure you want to delete this device blueprint?',
//                     text: `You won't be able to revert this!`,
//                     type: 'question',
//                     showCancelButton: true,
//                     cancelButtonColor: '#3085d6',
//                     confirmButtonColor: '#d33',
//                     confirmButtonText: 'Yes, delete it!'
//                 }).then(result => {
//                     if (result.value) {
//                         _self.blockUI.start('Deleting device...');
//                         _self.deviceBlueprintService
//                             .delete(element.id)
//                             .then((resp: any) => {
//                                 console.log(resp);
//                                 _self.blockUI.stop();
//                             })
//                             .catch(err => {
//                                 _self.blockUI.stop();
//                                 swal(
//                                     'Oops...',
//                                     'Something went wrong! Unable to delete the device bluepritn.',
//                                     'error'
//                                 );
//                                 _self.logger.error('error occurred calling deleteDeviceBlueprint api, show message');
//                                 _self.logger.error(err);
//                             });
//                     }
//                 });
//             });

//             this.data = deviceBlueprintService.deviceBlueprints;
//         });
//     }

//     ngOnInit() {
//         const _self = this;
//         _self.blockUI.start('Loading blueprints...');

//         _self.breadCrumbService.setup(_self.params.pageTitle, [
//             new Crumb({ title: _self.params.pageTitle, active: true, link: 'device-blueprints' })
//         ]);

//         _self.deviceBlueprintService.blueprintsObservable$.subscribe(message => {
//             _self.cleanup();
//             _self.blockUI.stop();
//             _self.ngZone.run(() => {});
//         });

//         _self.load();
//     }

//     cleanup() {
//         this.dataStats.total = this.deviceBlueprintService.deviceBlueprints.length;
//         this.updatePaging();
//     }

//     load() {
//         this.blockUI.stop();
//         this.cleanup();
//     }

//     refreshData() {
//         this.blockUI.start('Loading device types...');
//         this.deviceBlueprintService.refresh();
//         this.pages.current = 1;
//     }

//     open(elem: DeviceBlueprint) {
//         // const queryParams: NavigationExtras = { queryParams: { edit: edit } };
//         // this.router.navigate([['/securehome/device-blueprints', elem.id].join('/')], queryParams);
//         this.router.navigate([['/securehome/device-blueprints', elem.id].join('/')]);
//     }
// }

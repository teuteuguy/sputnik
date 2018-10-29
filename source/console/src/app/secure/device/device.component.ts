import {
    Injectable,
    Component,
    OnInit,
    OnDestroy,
    NgZone,
    ViewChild,
    ViewContainerRef,
    ComponentFactoryResolver,
    ComponentRef,
    ComponentFactory,
    Output
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import swal from 'sweetalert2';
import { environment } from '../../../environments/environment';

// Components
// import { FactoryResetDeeplensV10Component } from './types/factory-reset-deeplens-v1.0.component';
// import { MyDeeplensWebCameraV10Component } from './types/my-deeplens-web-camera-v1.0.component';
// import { MiniConnectedFactoryV10Component } from './types/mini-connected-factory-v1.0.component';

// Models
import { Device } from '../../models/device.model';
import { DeviceType } from '../../models/device-type.model';
import { DeviceBlueprint } from '../../models/device-blueprint.model';
import { ProfileInfo } from '../../models/profile-info.model';
// import { GGDeploymentStatus } from '../../models/gg-deployment-status.model';

// Services
import { BreadCrumbService, Crumb } from '../../services/bread-crumb.service';
import { DeviceService } from '../../services/device.service';
import { DeviceTypeService } from '../../services/device-type.service';
import { DeviceBlueprintService } from '../../services/device-blueprint.service';
import { LoggerService } from '../../services/logger.service';
// import { StatsService } from '../../services/stats.service';
// import { DeviceSubViewComponentService } from '../../services/device-sub-view-component.service';

declare var jquery: any;
declare var $: any;
import * as _ from 'underscore';

// const TYPE_COMPONENT_REGISTRY = {
//     'deeplens-v1.0': {
//         'factory-reset-deeplens-v1.0': FactoryResetDeeplensV10Component,
//         'my-deeplens-web-camera-v1.0': MyDeeplensWebCameraV10Component
//     }
// };

@Component({
    selector: 'app-root-device',
    templateUrl: './device.component.html'
})
export class DeviceComponent implements OnInit, OnDestroy {
    public title = 'Device';
    public thingId: string;
    private profile: ProfileInfo;
    // public deviceStats: any = {};
    // private pollerInterval: any = null;

    public device: Device;
    public deviceType: DeviceType;
    public deviceTypes: DeviceType[];
    public deviceBlueprints: DeviceBlueprint[];
    public deviceBlueprint: DeviceBlueprint;

    public deviceForEdit: Device;

    // public ggDeploymentStatus: GGDeploymentStatus = new GGDeploymentStatus();
    // public deploying = false;

    // private _myCustomComponent = null;

    @BlockUI()
    blockUI: NgBlockUI;

    // @ViewChild('deviceTypeTemplate', { read: ViewContainerRef })
    // entry: ViewContainerRef;

    constructor(
        public router: Router,
        public route: ActivatedRoute,
        protected localStorage: LocalStorage,
        private _ngZone: NgZone,
        private logger: LoggerService,
        private breadCrumbService: BreadCrumbService,
        private deviceService: DeviceService,
        private deviceBlueprintService: DeviceBlueprintService,
        private deviceTypeService: DeviceTypeService
    ) {
        // private resolver: ComponentFactoryResolver,
        // private statsService: StatsService,
        // private deviceSubViewComponentService: DeviceSubViewComponentService
        // this.deviceSubViewComponentService.registerComponent(
        //     'deeplens-v1.0',
        //     'factory-reset-deeplens-v1.0',
        //     FactoryResetDeeplensV10Component
        // );
        // this.deviceSubViewComponentService.registerComponent(
        //     'deeplens-v1.0',
        //     'my-deeplens-web-camera-v1.0',
        //     MyDeeplensWebCameraV10Component
        // );
        // this.deviceSubViewComponentService.registerComponent(
        //     'deeplens-v1.0',
        //     'mini-connected-factory-v1.0',
        //     MiniConnectedFactoryV10Component
        // );
    }

    ngOnInit() {
        const _self = this;

        _self.route.params.subscribe(params => {
            _self.thingId = params['thingId'];
        });

        _self.breadCrumbService.setup(_self.title, [
            new Crumb({
                title: 'Devices',
                link: 'devices'
            }),
            new Crumb({
                title: _self.thingId,
                active: true
            })
        ]);

        _self.blockUI.start('Loading device...');

        _self.localStorage.getItem<ProfileInfo>('profile').subscribe(profile => {
            _self.profile = new ProfileInfo(profile);
            _self.loadDevice();
            // this.pollerInterval = setInterval(function() {
            //     _self.loadDevice();
            // }, environment.refreshInterval);
        });
    }

    ngOnDestroy() {
        this.logger.info('destroying device page, attempting to remove poller.');
        // clearInterval(this.pollerInterval);
    }

    private loadDevice() {
        const _self = this;

        _self.deviceService
            .getDevice(_self.thingId)
            .then((device: Device) => {
                _self.logger.info('device:', device);
                _self.logger.info('device:', JSON.stringify(device.spec));
                _self.device = device;
                _self.deviceTypes = _self.deviceTypeService.deviceTypes;
                _self.deviceBlueprints = _self.deviceBlueprintService.deviceBlueprints;
                _self.getTheExtraResources();
                _self.blockUI.stop();
            })
            .catch(err => {
                _self.blockUI.stop();
                swal('Oops...', 'Something went wrong! Unable to retrieve the device.', 'error');
                _self.logger.error('error occurred calling getDevice api, show message');
                _self.logger.error(err);
                _self.router.navigate(['/securehome/devices']);
            });

        //         _self.loadCustomComponentForDeviceType(_self.device.typeId, _self.device.ggBlueprintId);

        //         return _self.deviceService.getDeviceType(_self.device.typeId);
        //     })
        //     .then((deviceType: DeviceType) => {
        //         _self.deviceType = deviceType;
        //         // this.logger.info('deviceType:', deviceType);
        //         if (_self.device.greengrass && _self.device.ggBlueprintId) {
        //             return _self.ggBlueprintService.getGGBlueprint(_self.device.ggBlueprintId);
        //         }
        //         return null;
        //     })
        //     .then((ggBlueprint: GGBlueprint) => {
        //         // this.logger.info('ggBlueprint:', ggBlueprint);
        //         _self.ggBlueprint = ggBlueprint;
        //         _self.blockUI.stop();
        //         return _self.ggBlueprintService.getDeploymentStatus(_self.device);
        //     })
        //     .then((ggDeploymentStatus: GGDeploymentStatus) => {
        //         // _self.logger.info('deploymentStatus:', ggDeploymentStatus);
        //         _self.ggDeploymentStatus = ggDeploymentStatus;
        //         return;
        //     })
    }

    private getTheExtraResources() {
        const _self = this;
        _self.deviceType = new DeviceType(
            _self.deviceTypes.find(dt => {
                return dt.id === _self.device.deviceTypeId;
            })
        );
        _self.deviceBlueprint = new DeviceBlueprint(
            _self.deviceBlueprints.find(b => {
                return b.id === _self.device.deviceBlueprintId;
            })
        );
    }

    public refreshData() {
        this.blockUI.start('Loading device...');
        this.loadDevice();
    }

    // loadEditData() {
    //     // const _self = this;
    //     // Promise.all([
    //     //     _self.deviceService.getAllDeviceTypes().then(deviceTypes => (_self.deviceTypes = deviceTypes)),
    //     //     _self.ggBlueprintService.getAllGGBlueprints().then(ggBlueprints => (_self.ggBlueprints = ggBlueprints))
    //     // ])
    //     //     .then(results => results)
    //     //     .catch(err => {
    //     //         swal(
    //     //             'Oops...',
    //     //             'Something went wrong! Unable to retrieve the device types and/or gg blueprints.',
    //     //             'error'
    //     //         );
    //     //         this.logger.error('error occurred calling getDeviceTypes or getGGBlueprints api, show message');
    //     //         this.logger.error(err);
    //     //     });
    // }

    // loadCustomComponentForDeviceType(typeId: string, ggBlueprintId: string) {
    //     // const _self = this;
    //     // if (_self._myCustomComponent === null) {
    //     //     // _self.logger.info('loadCustomComponentForDeviceType: is null', _self._myCustomComponent, typeId, ggBlueprintId);
    //     //     _self._myCustomComponent = _self.deviceSubViewComponentService.getRegistryComponent(typeId, ggBlueprintId);
    //     //     // if (
    //     //     //     ggBlueprintId &&
    //     //     //     TYPE_COMPONENT_REGISTRY.hasOwnProperty(typeId) &&
    //     //     //     TYPE_COMPONENT_REGISTRY[typeId].hasOwnProperty(ggBlueprintId)
    //     //     // ) {
    //     //     //     _self._myCustomComponent = TYPE_COMPONENT_REGISTRY[typeId][ggBlueprintId];
    //     //     // } else if (!ggBlueprintId && TYPE_COMPONENT_REGISTRY.hasOwnProperty(typeId)) {
    //     //     //     _self._myCustomComponent = null; //TYPE_COMPONENT_REGISTRY[typeId];
    //     //     // }
    //     //     if (_self._myCustomComponent) {
    //     //         _self.entry.clear();
    //     //         const factory = _self.resolver.resolveComponentFactory(_self._myCustomComponent);
    //     //         const componentRef = _self.entry.createComponent(factory);
    //     //         (<any>componentRef.instance).device = _self.device;
    //     //         (<any>componentRef.instance).deviceType = _self.deviceType;
    //     //         (<any>componentRef.instance).ggBlueprint = _self.ggBlueprint;
    //     //         (<any>componentRef.instance).ggDeploymentStatus = _self.ggDeploymentStatus;
    //     //     }
    //     //     // } else {
    //     //     //     _self.logger.info('loadCustomComponentForDeviceType: already set', _self._myCustomComponent, typeId, ggBlueprintId);
    //     // }
    // }

    submitEditDevice(value: any) {
        const _self = this;
        _self.blockUI.start('Editing device...');
        _self.deviceService
            .updateDevice(
                _self.deviceForEdit.thingId,
                _self.deviceForEdit.name,
                _self.deviceForEdit.deviceTypeId,
                _self.deviceForEdit.deviceBlueprintId
            )
            .then((resp: any) => {
                $('#editModal').modal('hide');
                console.log('Updated device:', resp);
                _self.device = new Device(resp);
                _self.getTheExtraResources();
                _self.blockUI.stop();
            })
            .catch(err => {
                _self.blockUI.stop();
                swal('Oops...', 'Something went wrong! Unable to update the device.', 'error');
                _self.logger.error('error occurred calling updateDevice api, show message');
                _self.logger.error(err);
                _self.loadDevice();
            });
    }

    deleteDevice(device: Device) {
        const _self = this;
        swal({
            title: 'Are you sure you want to delete this device?',
            text: `You won't be able to revert this!`,
            type: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then(result => {
            $('#editModal').modal('hide');
            if (result.value) {
                _self.blockUI.start('Deleting device...');
                _self.deviceService
                    .deleteDevice(device.thingId)
                    .then((resp: any) => {
                        console.log(resp);
                        _self.router.navigate(['/securehome/devices']);
                    })
                    .catch(err => {
                        _self.blockUI.stop();
                        swal('Oops...', 'Something went wrong! Unable to delete the widget.', 'error');
                        _self.logger.error('error occurred calling deleteDevice api, show message');
                        _self.logger.error(err);
                        _self.loadDevice();
                    });
            }
        });
    }

    showEditForm() {
        this.deviceForEdit = new Device(this.device);
        $('#editModal').modal('show');
        // $('#editModal').on('hide.bs.modal', function(e) {
        //     console.log('ype');
        // });
    }

    deploy() {
        // this.logger.info('deploying');
        // this.deploying = true;
        // this.ggBlueprintService
        //     .deployToDevice(this.device)
        //     .then(data => {
        //         console.log('result', data);
        //         this.deploying = false;
        //         this.loadDevice();
        //     })
        //     .catch(err => {
        //         console.error(err);
        //         this.deploying = false;
        //     });
    }
}

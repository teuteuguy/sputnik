import { Component, OnInit, NgZone } from '@angular/core';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
// import { SwalComponent } from '@toverux/ngx-sweetalert2';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Subscription } from 'rxjs';
import swal from 'sweetalert2';

// Component
import { PrettifierComponent } from '../common/prettifier.component';

// Models
import { ProfileInfo } from '../../models/profile-info.model';
import { DeviceBlueprint } from '../../models/device-blueprint.model';
import { DeviceType } from '../../models/device-type.model';

// Services
import { BreadCrumbService, Crumb } from '../../services/bread-crumb.service';
import { DeviceBlueprintService } from '../../services/device-blueprint.service';
import { DeviceTypeService } from '../../services/device-type.service';
import { LoggerService } from '../../services/logger.service';

import * as _ from 'underscore';

@Component({
    selector: 'app-root-device-blueprint',
    templateUrl: './device-blueprint.component.html'
})
export class DeviceBlueprintComponent extends PrettifierComponent implements OnInit {
    public title = 'Device Blueprint';
    private sub: Subscription;
    private profile: ProfileInfo;
    public hasError = false;
    public errorMsg = '';

    public deviceBlueprint: DeviceBlueprint;
    public compatibleWithAll = false;
    // public deviceTypes: DeviceType[] = [];

    public test;

    @BlockUI()
    blockUI: NgBlockUI;

    constructor(
        public router: Router,
        public route: ActivatedRoute,
        private breadCrumbService: BreadCrumbService,
        private deviceBlueprintService: DeviceBlueprintService,
        public deviceTypeService: DeviceTypeService,
        protected localStorage: LocalStorage,
        private logger: LoggerService,
        private _ngZone: NgZone
    ) {
        super();
    }

    ngOnInit() {
        const _self = this;

        _self.blockUI.start('Loading device blueprint...');

        _self.sub = _self.route.params.subscribe(params => {
            _self.deviceBlueprint = new DeviceBlueprint({ id: params['deviceBlueprintId'] });
            if (_self.deviceBlueprint.id === 'new') {
                _self.deviceBlueprint.name = 'new';
                _self.deviceBlueprint.type = 'UNKNOWN';
                // _self.deviceBlueprint.compatibility = [];
                // _self.deviceBlueprint.deviceTypeMappings = '[]';
                // _self.deviceBlueprint.spec = '{}';
                // _self.manualPrettify(_self.deviceBlueprint, 'spec', 4);
                // _self.manualPrettify(_self.deviceBlueprint, 'deviceTypeMappings', 4);
                _self.blockUI.stop();
            } else {
                _self.loadBlueprint();
            }
            _self.breadCrumbService.setup(_self.title, [
                new Crumb({
                    title: 'Device Blueprints',
                    link: 'device-blueprints'
                }),
                new Crumb({
                    title: _self.deviceBlueprint.id,
                    active: true
                })
            ]);

        });

    }

    loadBlueprint() {
        const _self = this;

        _self.logger.info('loadBlueprint for ' + _self.deviceBlueprint.id);

        _self.deviceBlueprintService
            .get(_self.deviceBlueprint.id)
            .then((deviceBlueprint: DeviceBlueprint) => {
                _self.blockUI.stop();
                _self.logger.info(deviceBlueprint);
                _self.deviceBlueprint = new DeviceBlueprint(deviceBlueprint);
                // if (_self.deviceBlueprint.spec) {
                //     _self.manualPrettify(_self.deviceBlueprint, 'spec', 4);
                // }
                // if (_self.deviceBlueprint.deviceTypeMappings) {
                //     _self.manualPrettify(_self.deviceBlueprint, 'deviceTypeMappings', 4);
                // }
                _self.test = _self.deviceBlueprint.deviceTypeMappings;
            })
            .catch(err => {
                _self.blockUI.stop();
                swal('Oops...', 'Something went wrong! Unable to retrieve the device blueprint.', 'error');
                _self.logger.error('error occurred calling getDeviceBlueprint api, show message');
                _self.logger.error(err);
                _self.router.navigate(['/securehome/device-blueprints']);
            });
    }

    cancel() {
        this.router.navigate(['/securehome/device-blueprints']);
    }

    delete() {
        swal({
            title: 'Are you sure?',
            text: 'You will not be able to recover this imaginary file!',
            type: 'warning',
            showCancelButton: true,
            confirmButtonText: 'No, keep it',
            cancelButtonText: 'Yes, delete it!'
        }).then(result => {
            if (result.dismiss === swal.DismissReason.cancel) {
                this.deviceBlueprintService
                    .delete(this.deviceBlueprint.id)
                    .then((deviceBlueprint: DeviceBlueprint) => {
                        console.log(deviceBlueprint);
                        swal({
                            timer: 1000,
                            title: 'Deleted!',
                            text: 'Device Blueprint, ' + this.deviceBlueprint.name + ', deleted!',
                            type: 'success',
                            showConfirmButton: false
                        }).then(result => {
                            this.router.navigate(['/securehome/device-blueprints']);
                        });
                    })
                    .catch(err => {
                        swal('Oops...', 'Something went wrong! Unable to delete the device type.', 'error');
                        this.logger.error('error occurred calling deleteDevice api, show message');
                        this.logger.error(err);
                    });
            }
        });
    }

    saveBlueprint() {
        const _self = this;

        _self.blockUI.start('Saving device blueprint...');

        let promise = null;
        let popupTitle = '';
        let popupText = '';
        let errorMessage = '';

        // if (_self.deviceBlueprint.id === 'new') {
        //     delete _self.deviceBlueprint.id;
        //     promise = _self.deviceBlueprintService.add(_self.deviceBlueprint);
        //     popupTitle = 'Device Blueprint Created';
        //     popupText = `The device blueprint ${_self.deviceBlueprint.name} was successfully created.`;
        //     errorMessage = 'Something went wrong! Unable to create the new device blueprint.';
        // } else {
        //     promise = _self.deviceBlueprintService.update(_self.deviceBlueprint);
        //     popupTitle = 'Device Blueprint Updated';
        //     popupText = `The device blueprint ${_self.deviceBlueprint.name} was successfully updated.`;
        //     errorMessage = 'Something went wrong! Unable to update the device blueprint.';
        // }

        // // if (_self.blueprint.compatibility === null) {
        // //     delete _self.blueprint.compatibility;
        // // }
        // // if (_self.blueprint.deviceTypeMappings === null) {
        // //     delete _self.blueprint.deviceTypeMappings;
        // // }
        // // if (_self.blueprint.spec === null) {
        // //     delete _self.blueprint.spec;
        // // }

        _self.logger.info('Test:', JSON.stringify(_self.deviceBlueprint.deviceTypeMappings));
        _self.logger.info('Test:', JSON.stringify(_self.test));
        _self.logger.info('Saving device blueprint:', _self.deviceBlueprint);

        // promise
        //     .then((deviceBlueprint: DeviceBlueprint) => {
        //         _self.logger.info('Saved device blueprint', deviceBlueprint);
        //         _self.blockUI.stop();
        //         swal({
        //             timer: 1000,
        //             title: popupTitle,
        //             text: popupText,
        //             type: 'success',
        //             showConfirmButton: false
        //         }).then(result => {
        //             _self.router.navigate(['/securehome/device-blueprints']);
        //         });
        //     })
        //     .catch(err => {
        //         _self.blockUI.stop();
        //         swal('Oops...', errorMessage, 'error');
        //         _self.logger.error(err);
        //         err.errors.forEach(e => {
        //             _self.logger.error(e.message);
        //         });
        //     });
    }

    inCompatibilityList(id: string) {
        if (this.deviceBlueprint.compatibility) {
            return (
                this.deviceBlueprint.compatibility.findIndex(devicetypetype => {
                    return devicetypetype === id;
                }) !== -1
            );
        } else {
            return false;
        }
    }

    toggleDeviceType(event, id: string) {
        const _self = this;
        const index = _self.deviceBlueprint.compatibility.indexOf(id);
        if (index === -1) {
            _self.deviceBlueprint.compatibility.push(id);
        } else {
            _self.deviceBlueprint.compatibility.splice(index, 1);
        }
        // _self.logger.info(_self.deviceBlueprint.compatibility);
        event.stopPropagation();
        event.preventDefault();
    }
}

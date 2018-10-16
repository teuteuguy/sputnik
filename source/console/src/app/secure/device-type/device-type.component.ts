import { Component, OnInit, NgZone } from '@angular/core';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
// import { SwalComponent } from '@toverux/ngx-sweetalert2';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import swal from 'sweetalert2';

// Component
import { PrettifierComponent } from '../common/prettifier.component';

// Models
import { ProfileInfo } from '../../models/profile-info.model';
import { DeviceType } from '../../models/device-type.model';

// Services
import { BreadCrumbService, Crumb } from '../../services/bread-crumb.service';
import { DeviceTypeService } from '../../services/device-type.service';
import { LoggerService } from '../../services/logger.service';

import * as _ from 'underscore';

@Component({
    selector: 'app-root-device-type',
    templateUrl: './device-type.component.html'
})
export class DeviceTypeComponent extends PrettifierComponent implements OnInit {
    public title = 'Device Type';
    public deviceStats: any = {};
    private profile: ProfileInfo;
    public hasError = false;
    public errorMsg = '';

    public dtype: DeviceType;

    @BlockUI()
    blockUI: NgBlockUI;

    constructor(
        public router: Router,
        public route: ActivatedRoute,
        private breadCrumbService: BreadCrumbService,
        private deviceTypeService: DeviceTypeService,
        protected localStorage: LocalStorage,
        private logger: LoggerService,
        private _ngZone: NgZone
    ) {
        super();
    }

    ngOnInit() {
        const _self = this;

        _self.blockUI.start('Loading device type...');

        _self.route.params.subscribe(params => {
            _self.dtype = new DeviceType({ id: params['deviceTypeId'] });
            if (_self.dtype.id === 'new') {
                _self.dtype.name = 'new';
            }
        });

        _self.breadCrumbService.setup(_self.title, [
            new Crumb({
                title: 'Devices Types',
                link: 'device-types'
            }),
            new Crumb({
                title: _self.dtype.id,
                active: true
            })
        ]);

        _self.localStorage.getItem<ProfileInfo>('profile').subscribe(profile => {
            _self.profile = new ProfileInfo(profile);
            if (_self.dtype.id !== 'new') {
                _self.loadDeviceType();
            } else {
                _self.blockUI.stop();
            }
        });
    }

    loadDeviceType() {
        const _self = this;

        _self.logger.info('loadDeviceType for ' + _self.dtype.id);

        const type = _self.deviceTypeService.getDeviceType(_self.dtype.id);
        _self.logger.info(type);
        _self.blockUI.stop();
        if (type) {
            _self.dtype = new DeviceType(type);
            _self.manualPrettify(_self.dtype, 'spec', 4);
        } else {
            swal('Oops...', 'Something went wrong! Unable to retrieve the device type.', 'error');
            _self.logger.error('error occurred calling getDeviceType api, show message');
            _self.logger.error('the requested type doesnt exist');
            _self.router.navigate(['/securehome/device-types']);
        }
    }

    cancel() {
        this.router.navigate(['/securehome/device-types']);
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
                this.deviceTypeService
                    .deleteDeviceType(this.dtype.id)
                    .then((type: DeviceType) => {
                        console.log(type);
                        swal({
                            timer: 1000,
                            title: 'Deleted!',
                            text: 'Device type, ' + this.dtype.name + ', deleted!',
                            type: 'success',
                            showConfirmButton: false
                        }).then(result => {
                            this.router.navigate(['/securehome/device-types']);
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

    saveDeviceType() {
        const _self = this;
        //     _self.hasError = false;
        //     _self.errorMsg = '';
        //     // error checks
        //     if (!_self.dtype.name) {
        //         _self.hasError = true;
        //         _self.errorMsg = 'Name is a required field for a device type.';
        //         // } else if (!_self.dtype.spec.topic) {
        //         //     _self.hasError = true;
        //         //     _self.errorMsg += 'Topic is a required field for a device type.';
        //     }
        //     // if (!_self.dtype.spec.interval) {
        //     //     _self.dtype.spec.interval = 2000;
        //     // }
        //     // if (_self.dtype.spec.interval < 1000) {
        //     //     _self.dtype.spec.interval = 1000;
        //     // }
        //     // if (!_self.dtype.spec.duration) {
        //     //     _self.dtype.spec.duration = 60000;
        //     // }
        //     // if (_self.dtype.spec.duration < 60000) {
        //     //     _self.dtype.spec.duration = 60000;
        //     // }
        //     if (_self.hasError) {
        //         return;
        //     } else {
        _self.blockUI.start('Saving device type...');
        //         // for (let i = 0; i < _self.dtype.spec.payload.length; i++) {
        //         //     if (_self.dtype.spec.payload[i].hasOwnProperty('default')) {
        //         //         if (_self.dtype.spec.payload[i].default === '') {
        //         //             delete _self.dtype.spec.payload[i].default;
        //         //         }
        //         //     }
        //         // }
        let promise = null;
        let popupTitle = '';
        let popupText = '';
        let errorMessage = '';
        if (_self.dtype.id === 'new') {
            delete _self.dtype.id;
            promise = _self.deviceTypeService.addDeviceType(_self.dtype);
            popupTitle = 'Device Type Created';
            popupText = `The device type ${_self.dtype.name} was successfully created.`;
            errorMessage = 'Something went wrong! Unable to create the new device type.';
        } else {
            promise = _self.deviceTypeService.updateDeviceType(_self.dtype);
            popupTitle = 'Device Type Updated';
            popupText = `The device type ${_self.dtype.name} was successfully updated.`;
            errorMessage = 'Something went wrong! Unable to update the device type.';
        }
        _self.logger.info(_self.dtype);
        promise
            .then((resp: any) => {
                _self.blockUI.stop();
                swal({
                    timer: 1000,
                    title: popupTitle,
                    text: popupText,
                    type: 'success',
                    showConfirmButton: false
                }).then(result => {
                    _self.router.navigate(['/securehome/device-types']);
                });
            })
            .catch(err => {
                _self.blockUI.stop();
                swal('Oops...', errorMessage, 'error');
                _self.logger.error(err);
                err.errors.forEach(e => {
                    _self.logger.error(e.message);
                });
            });
        // } else {
        //     // _self.deviceTypeService
        //     //     .updateDeviceType(_self.dtype)
        //     //     .then((resp: any) => {
        //     //         _self.blockUI.stop();
        //     //         swal({
        //     //             timer: 1000,
        //     //             title: 'Device Type Updated',
        //     //             text: `The device type ${_self.dtype.name} was successfully updated.`,
        //     //             type: 'success',
        //     //             showConfirmButton: false
        //     //         }).then(result => {
        //     //             _self.router.navigate(['/securehome/device-types']);
        //     //         });
        //     //     })
        //     //     .catch(err => {
        //     //         _self.blockUI.stop();
        //     //         swal('Oops...', 'Something went wrong! Unable to update the device type.', 'error');
        //     //         _self.logger.error('error occurred calling updateDeviceType api, show message');
        //     //         _self.logger.error(err);
        //     //     });
        // }
        //     }
    }
}

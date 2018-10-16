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
import { Blueprint } from '../../models/blueprint.model';
import { DeviceType } from '../../models/device-type.model';

// Services
import { BreadCrumbService, Crumb } from '../../services/bread-crumb.service';
import { BlueprintService } from '../../services/blueprint.service';
import { DeviceTypeService } from '../../services/device-type.service';
import { LoggerService } from '../../services/logger.service';

import * as _ from 'underscore';

@Component({
    selector: 'app-root-blueprint',
    templateUrl: './blueprint.component.html'
})
export class BlueprintComponent extends PrettifierComponent implements OnInit {
    public title = 'Blueprint';
    private sub: Subscription;
    private profile: ProfileInfo;
    public hasError = false;
    public errorMsg = '';

    public blueprint: Blueprint;
    public compatibleWithAll = false;
    // public deviceTypes: DeviceType[] = [];

    @BlockUI()
    blockUI: NgBlockUI;

    constructor(
        public router: Router,
        public route: ActivatedRoute,
        private breadCrumbService: BreadCrumbService,
        private blueprintService: BlueprintService,
        public deviceTypeService: DeviceTypeService,
        protected localStorage: LocalStorage,
        private logger: LoggerService,
        private _ngZone: NgZone
    ) {
        super();
    }

    ngOnInit() {
        const _self = this;

        _self.blockUI.start('Loading blueprint...');

        _self.sub = _self.route.params.subscribe(params => {
            _self.blueprint = new Blueprint({ id: params['blueprintId'] });
            if (_self.blueprint.id === 'new') {
                _self.blueprint.name = 'new';
                _self.blueprint.type = 'UNKNOWN';
                // _self.blueprint.compatibility = [];
                // _self.blueprint.deviceTypeMappings = '[]';
                // _self.blueprint.spec = '{}';
                // _self.manualPrettify(_self.blueprint, 'spec', 4);
                // _self.manualPrettify(_self.blueprint, 'deviceTypeMappings', 4);
            }
        });

        _self.breadCrumbService.setup(_self.title, [
            new Crumb({
                title: 'Blueprints',
                link: 'blueprints'
            }),
            new Crumb({
                title: _self.blueprint.id,
                active: true
            })
        ]);

        _self.localStorage.getItem<ProfileInfo>('profile').subscribe(profile => {
            _self.profile = new ProfileInfo(profile);
            if (_self.blueprint.id !== 'new') {
                _self.loadBlueprint();
            } else {
                _self.blockUI.stop();
            }
        });
    }

    loadBlueprint() {
        const _self = this;

        _self.logger.info('loadBlueprint for ' + _self.blueprint.id);

        _self.blueprintService
            .getBlueprint(_self.blueprint.id)
            .then((blueprint: Blueprint) => {
                _self.blockUI.stop();
                _self.logger.info(blueprint);
                _self.blueprint = new Blueprint(blueprint);
                if (_self.blueprint.spec) {
                    _self.manualPrettify(_self.blueprint, 'spec', 4);
                }
                if (_self.blueprint.deviceTypeMappings) {
                    _self.manualPrettify(_self.blueprint, 'deviceTypeMappings', 4);
                }
            })
            .catch(err => {
                _self.blockUI.stop();
                swal('Oops...', 'Something went wrong! Unable to retrieve the blueprint.', 'error');
                _self.logger.error('error occurred calling getBlueprint api, show message');
                _self.logger.error(err);
            });
    }

    cancel() {
        this.router.navigate(['/securehome/blueprints']);
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
                this.blueprintService
                    .deleteBlueprint(this.blueprint.id)
                    .then((blueprint: Blueprint) => {
                        console.log(blueprint);
                        swal({
                            timer: 1000,
                            title: 'Deleted!',
                            text: 'Blueprint, ' + this.blueprint.name + ', deleted!',
                            type: 'success',
                            showConfirmButton: false
                        }).then(result => {
                            this.router.navigate(['/securehome/blueprints']);
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

        _self.blockUI.start('Saving blueprint...');

        let promise = null;
        let popupTitle = '';
        let popupText = '';
        let errorMessage = '';

        if (_self.blueprint.id === 'new') {
            delete _self.blueprint.id;
            promise = _self.blueprintService.addBlueprint(_self.blueprint);
            popupTitle = 'Blueprint Created';
            popupText = `The blueprint ${_self.blueprint.name} was successfully created.`;
            errorMessage = 'Something went wrong! Unable to create the new blueprint.';
        } else {
            promise = _self.blueprintService.updateBlueprint(_self.blueprint);
            popupTitle = 'Blueprint Updated';
            popupText = `The blueprint ${_self.blueprint.name} was successfully updated.`;
            errorMessage = 'Something went wrong! Unable to update the blueprint.';
        }

        // if (_self.blueprint.compatibility === null) {
        //     delete _self.blueprint.compatibility;
        // }
        // if (_self.blueprint.deviceTypeMappings === null) {
        //     delete _self.blueprint.deviceTypeMappings;
        // }
        // if (_self.blueprint.spec === null) {
        //     delete _self.blueprint.spec;
        // }

        _self.logger.info('Saving blueprint:', _self.blueprint);

        promise
            .then((blueprint: Blueprint) => {
                _self.logger.info('Saved blueprint', blueprint);
                _self.blockUI.stop();
                swal({
                    timer: 1000,
                    title: popupTitle,
                    text: popupText,
                    type: 'success',
                    showConfirmButton: false
                }).then(result => {
                    _self.router.navigate(['/securehome/blueprints']);
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
    }

    inCompatibilityList(id: string) {
        if (this.blueprint.compatibility) {
            return (
                this.blueprint.compatibility.findIndex(devicetypetype => {
                    return devicetypetype === id;
                }) !== -1
            );
        } else {
            return false;
        }
    }

    toggleDeviceType(event, id: string) {
        const _self = this;
        const index = _self.blueprint.compatibility.indexOf(id);
        if (index === -1) {
            _self.blueprint.compatibility.push(id);
        } else {
            _self.blueprint.compatibility.splice(index, 1);
        }
        // _self.logger.info(_self.blueprint.compatibility);
        event.stopPropagation();
        event.preventDefault();
    }
}

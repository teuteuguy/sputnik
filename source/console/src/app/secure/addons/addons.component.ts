import { Component, OnInit } from '@angular/core';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import swal from 'sweetalert2';

// Models
import { ProfileInfo } from '@models/profile-info.model';
import { AddOn } from '@models/addon.model';

// Services
import { BreadCrumbService, Crumb } from '@services/bread-crumb.service';
import { LoggerService } from '@services/logger.service';
import { AddonService } from '@services/addon.service';

import { AddonSettings } from './addons';

import * as addons from './addons';
declare var $: any;

declare var appVariables: any;

@Component({
    selector: 'app-root-addons',
    templateUrl: './addons.component.html'
})
export class AddOnsComponent implements OnInit {
    public title = 'AddOns';
    public addons: AddOn[] = [];

    private profile: ProfileInfo = null;

    @BlockUI()
    blockUI: NgBlockUI;

    constructor(
        private logger: LoggerService,
        protected localStorage: LocalStorage,
        private addonService: AddonService,
        private breadCrumbService: BreadCrumbService
    ) {}

    ngOnInit() {
        const _self = this;
        console.log(AddonSettings.addons);

        _self.localStorage.getItem<ProfileInfo>('profile').subscribe((profile: ProfileInfo) => {
            _self.profile = new ProfileInfo(profile);

            _self.breadCrumbService.setup(_self.title, [
                new Crumb({ title: _self.title, active: true, link: 'addons' })
            ]);

            _self.addons = AddonSettings.addons;
        });
    }

    installAddon(addon: AddOn) {

        const _self = this;
        swal({
            title: `Are you sure you want to install the ${addon.name} add-on ?`,
            text: ``,
            type: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, install it!'
        }).then(result => {
            if (result.value) {
                _self.blockUI.start(`Installing the ${addon.name} add-on...`);
                _self.addonService
                    .installAddon(addon.key)
                    .then((resp: any) => {
                        _self.blockUI.stop();
                    })
                    .catch(err => {
                        _self.blockUI.stop();
                        swal('Oops...', `Something went wrong! Unable to install the ${addon.name} add-on.`, 'error');
                        _self.logger.error('error occurred calling installAddon api, show message');
                        _self.logger.error(err);
                    });
            }
        });
    }
}

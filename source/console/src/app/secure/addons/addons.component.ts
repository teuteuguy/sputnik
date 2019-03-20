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

declare var $: any;
declare var appVariables: any;
declare var addons: any;

import * as uuid from 'uuid';

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
        private breadCrumbService: BreadCrumbService
    ) {}

    ngOnInit() {
        const _self = this;
        // console.log(AddonSettings.addons);

        _self.localStorage.getItem<ProfileInfo>('profile').subscribe((profile: ProfileInfo) => {
            _self.profile = new ProfileInfo(profile);

            _self.breadCrumbService.setup(_self.title, [
                new Crumb({ title: _self.title, active: true, link: 'addons' })
            ]);

            _self.addons = addons;
        });
    }

    installAddon(addon: AddOn) {

        const _self = this;
        swal({
            title: `Are you sure you want to install the ${addon.name} add-on ?`,
            text: `This will open a new cloudformation page`,
            type: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, install it!'
        }).then(result => {
            console.log(uuid.v4());
            if (result.value) {
                const url = `https://console.aws.amazon.com/cloudformation/home?region=${
                    appVariables.REGION
                }#/stacks/create/review?stackName=sputnik-addon-${addon.id}&${
                    appVariables.ADDON_TEMPLATES_URL
                }/${addon.id}/${addon.id}.yml&param_uuid=${uuid.v4()}`;
                window.open(url);
            }
        });
    }
}

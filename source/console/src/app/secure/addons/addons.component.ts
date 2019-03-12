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
import { AddonSettings } from './addons';

import * as addons from './addons';

@Component({
    selector: 'app-root-addons',
    templateUrl: './addons.component.html'
})
export class AddOnsComponent implements OnInit {
    public title = 'AddOns';
    public addons: AddOn[] = [];

    private profile: ProfileInfo = null;

    constructor(
        private logger: LoggerService,
        protected localStorage: LocalStorage,
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

}

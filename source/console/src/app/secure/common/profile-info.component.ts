import { Component } from '@angular/core';
import { LocalStorage } from '@ngx-pwa/local-storage';

// Models
import { ProfileInfo } from '../../models/profile-info.model';


@Component({
    selector: 'app-root-profile-info',
    template: ''
})
export class ProfileInfoComponent {
    isAdminUser = false;
    loadedProfile = false;
    profile: ProfileInfo = null; // = new ProfileInfo();

    constructor(protected _localStorage: LocalStorage) {
        this.loadedProfile = false;
        this._localStorage.getItem<ProfileInfo>('profile').subscribe((profile: ProfileInfo) => {
            if (profile) {
                this.profile = new ProfileInfo(profile);
                this.isAdminUser = this.profile.isAdmin();
            }
        });
    }
}


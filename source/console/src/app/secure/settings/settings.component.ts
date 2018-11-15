import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { BlockUI, NgBlockUI } from 'ng-block-ui';

// Models
import { ProfileInfo } from '../../models/profile-info.model';
import { Setting } from '../../models/setting.model';

// Services
import { BreadCrumbService, Crumb } from '../../services/bread-crumb.service';
import { LoggerService } from '../../services/logger.service';
import { SettingService } from '../../services/setting.service';
import { FactoryResetService } from '../../services/factoryreset.service';

@Component({
    selector: 'app-root-settings',
    templateUrl: './settings.component.html'
})
export class SettingsComponent implements OnInit {
    public title = 'System Settings';

    public profile: ProfileInfo = null;
    public isAdminUser = false;

    public appConfig: Setting = new Setting();
    public appConfigError = true;
    public appConfigErrorMessage = '';

    public thingAutoRegistrationConfig: Setting = new Setting();
    public thingAutoRegistrationConfigError = true;
    public thingAutoRegistrationConfigErrorMessage = '';
    public thingAutoRegistrationState = false;

    // private profile: ProfileInfo;

    public factoryResetTables = [
        {
            table: 'Settings',
            done: false
        },
        {
            table: 'DeviceTypes',
            done: false
        },
        {
            table: 'DeviceBlueprints',
            done: false
        },
        {
            table: 'SolutionBlueprints',
            done: false
        }
    ];

    @BlockUI()
    blockUI: NgBlockUI;

    constructor(
        public router: Router,
        private breadCrumbService: BreadCrumbService,
        protected localStorage: LocalStorage,
        private logger: LoggerService,
        private settingService: SettingService,
        private factoryResetService: FactoryResetService
    ) {}

    ngOnInit() {
        this.blockUI.start('Loading settings...');

        this.breadCrumbService.setup(this.title, [
            new Crumb({
                title: 'Settings',
                link: 'settings',
                active: true
            })
        ]);

        const _self = this;

        _self.localStorage.getItem<ProfileInfo>('profile').subscribe((profile: ProfileInfo) => {
            _self.profile = new ProfileInfo(profile);
            _self.isAdminUser = _self.profile.isAdmin();
            _self.loadAllSettings();
        });
    }

    loadAllSettings() {
        const _self = this;
        _self.logger.info('Loading ALL settings:');

        if (_self.profile.isAdmin()) {
            _self
                .loadGeneralSettings()
                .then(data => {
                    _self.logger.info('Loaded general settings:', _self.appConfig);
                    return _self.loadThingAutoRegistrationSettings();
                })
                .then(data => {
                    _self.logger.info(
                        'Loaded Thing Group Auto Registration Settings:',
                        _self.thingAutoRegistrationState
                    );
                    _self.blockUI.stop();
                })
                .catch(err => {
                    _self.blockUI.stop();
                    _self.logger.error('error occurred calling loading the settings, show message', err);
                    return err;
                });
        }
    }

    factoryreset() {
        const _self = this;

        _self.factoryResetTables.forEach(t => {
            t.done = false;
            _self.factoryResetService
                .factoryReset(t.table)
                .then(result => {
                    _self.logger.info(t.table, result);
                    t.done = true;
                })
                .catch(err => {
                    _self.logger.error(err);
                });
        });
    }

    loadGeneralSettings(): Promise<any> {
        const _self = this;
        return _self.settingService
            .getSetting('app-config')
            .then((data: Setting) => {
                _self.appConfig = data;
                if (_self.appConfig !== null) {
                    _self.appConfigError = false;
                } else {
                    _self.appConfigErrorMessage =
                        'General Application settings are not configured yet. Please use Factory reset.';
                }
                return data;
            })
            .catch(err => {
                _self.appConfigError = true;
                _self.appConfigErrorMessage = 'Unable to load the general application settings.';
                throw err;
            });
    }

    loadThingAutoRegistrationSettings(): Promise<any> {
        const _self = this;

        return _self.settingService
            .getThingAutoRegistrationState()
            .then(data => {
                _self.thingAutoRegistrationState = data;
                _self.thingAutoRegistrationConfigError = false;
                return data;
            })
            .catch(err => {
                _self.thingAutoRegistrationConfigError = true;
                _self.thingAutoRegistrationConfigErrorMessage =
                    'Unable to load the Thing Group Auto Registration application settings.';
                throw err;
            });
    }

    public toggleThingAutoRegistration() {
        const _self = this;
        _self.settingService
            .setThingAutoRegistrationState(!_self.thingAutoRegistrationState)
            .then(result => {
                _self.thingAutoRegistrationState = result;
            })
            .catch(err => {
                _self.logger.error('Toggle of Thing Group Auto Registration Service failed:', err);
            });
    }
}

import { Component, Input, OnInit, ViewChild, NgZone } from '@angular/core';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { BlockUI, NgBlockUI } from 'ng-block-ui';

// Models
import { ProfileInfo } from '@models/profile-info.model';
import { Invitation } from '@models/invitation-model';
import { User } from '@models/user.model';

// Services
import { AdminService } from '@services/admin.service';
import { BreadCrumbService, Crumb } from '@services/bread-crumb.service';
import { LoggerService } from '@services/logger.service';
import { StatService, Stats } from '@services/stat.service';
import { UserLoginService } from '@services/user-login.service';

declare var jquery: any;
declare var $: any;
declare var swal: any;

@Component({
    selector: 'app-root-users',
    templateUrl: './users.component.html'
})
export class UsersComponent implements OnInit {
    // implements LoggedInCallback {

    //     private users: User[] = [];
    //     public deviceStats: any = {};

    private invite: Invitation;
    private profile: ProfileInfo;

    public isAdminUser = false;
    public pageTitle = 'Users';
    //     private name: string;

    @BlockUI() blockUI: NgBlockUI;

    constructor(
        public router: Router,
        private breadCrumbService: BreadCrumbService,
        public userService: UserLoginService,
        private adminService: AdminService,
        protected localStorage: LocalStorage,
        private logger: LoggerService,
        private statService: StatService,
        private ngZone: NgZone
    ) {
        this.invite = new Invitation();
        this.invite.name = '';
    }

    ngOnInit() {
        const _self = this;
        _self.blockUI.start('Loading users...');

        _self.localStorage.getItem<ProfileInfo>('profile').subscribe((profile: ProfileInfo) => {
            _self.profile = new ProfileInfo(profile);
            _self.isAdminUser = _self.profile.isAdmin();

            _self.breadCrumbService.setup(_self.pageTitle, [
                new Crumb({ title: _self.pageTitle, active: true, link: 'users' })
            ]);

            if (_self.isAdminUser) {
                _self.loadUsers();
            }
        });

        // _self.statService.statObservable$.subscribe((message: Stats) => {
        //     this.dataStats = message.solutionStats;
        //     this.ngZone.run(() => { });
        // });
        // _self.statService.refresh();

        //         const _self = this;
        //         this.statsService.statObservable$.subscribe(message => {
        //             this.deviceStats = message;
        //             this._ngZone.run(() => { });
        //         });

        //         this.localStorage.getItem<ProfileInfo>('profile').subscribe((profile) => {
        //             _self.profile = new ProfileInfo(profile);
        //             _self.isAdminUser = _self.profile.isAdmin();
        //             if (_self.profile.isAdmin()) {
        //                 _self.loadUsers();
        //             }
        //         });
    }

    loadUsers() {
        //         this.adminService.getAllUsers().then((data: User[]) => {
        //             this.blockUI.stop();
        //             this.users = data;
        //         }).catch((err) => {
        //             this.blockUI.stop();
        //             swal(
        //                 'Oops...',
        //                 'Something went wrong! Unable to retrieve the users.',
        //                 'error');
        //             this.logger.error('error occurred calling api, show message');
        //         });
    }

    refreshData() {
        this.blockUI.start('Loading users...');
        this.loadUsers();
    }

    //     openUser(username: string) {
    //         this.router.navigate([['/securehome/admin/users', username].join('/')]);
    //     }

    //     cancelInvite(form: NgForm) {
    //         form.reset();
    //         $('#inviteModal').modal('hide');
    //     }

    //     inviteUser(form: NgForm) {
    //         if (form.valid) {
    //             const _self = this;
    //             const _invite: Invitation = {
    //                 name: form.value.name,
    //                 email: form.value.email,
    //                 groups: [{
    //                     name: 'Members',
    //                     _state: 'new'
    //                 }]
    //             };

    //             this.blockUI.start('Inviting user...');
    //             $('#inviteModal').modal('hide');
    //             this.adminService.inviteUser(_invite).then((result) => {
    //                 _self.loadUsers();
    //             }).catch((err) => {
    //                 this.blockUI.stop();
    //                 swal(
    //                     'Oops...',
    //                     'Something went wrong! Unable to invite the user.',
    //                     'error');
    //                 this.logger.error('[error] Error occurred calling updateUser API.');
    //             });
    //         }

    //     }
}

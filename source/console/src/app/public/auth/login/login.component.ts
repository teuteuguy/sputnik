import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { environment } from '../../../../environments/environment';

// Models
import { ProfileInfo } from '../../../models/profile-info.model';

// Services
import { LoggerService } from '../../../services/logger.service';
import { UserLoginService, CognitoCallback, LoggedInCallback } from '../../../services/user-login.service';

declare var jquery: any;
declare var $: any;

@Component({
  selector: 'app-root',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, CognitoCallback, LoggedInCallback {
  appName: string = environment.appName;
  version: string = environment.appVersion;
  email: string = null;
  password: string = null;
  errorMessage: string;

  constructor(
    public router: Router,
    public userService: UserLoginService,
    private logger: LoggerService
  ) {
    this.logger.info('LoginComponent: constructor');
  }

  ngOnInit() {
    this.errorMessage = null;
    this.logger.info(
      'LoginComponent: Checking if the user is already authenticated. If so, then redirect to the secure site'
    );

    $('.owl-carousel').owlCarousel({
      slideSpeed: 300,
      paginationSpeed: 400,
      singleItem: !0,
      autoPlay: !0
    });
  }

  onLogin() {
    if (this.email == null || this.password == null) {
      this.errorMessage = 'All fields are required';
      return;
    }
    this.errorMessage = null;
    this.logger.info(this.email, this.password);
    this.userService.authenticate(this.email, this.password, this);
  }

  cognitoCallback(message: string, result: any) {
    if (message != null) {
      // error
      this.errorMessage = message;
      this.logger.info('result: ' + this.errorMessage);
      if (this.errorMessage === 'User is not confirmed.') {
        this.logger.error('redirecting');
        this.router.navigate(['/home/confirmRegistration', this.email]);
      } else if (this.errorMessage === 'User needs to set password.') {
        this.logger.error('redirecting to set new password');
        this.router.navigate(['/home/newPassword']);
      }
    } else {
      // success
      this.router.navigate(['/securehome']);
    }
  }

  isLoggedIn(message: string, isLoggedIn: boolean, profile: ProfileInfo) {
    if (isLoggedIn) {
      this.logger.info('LoginComponent: User logged in. Moving to securehome');
      this.router.navigate(['/securehome']);
    } else {
      this.logger.info('LoginComponent: User NOT logged in');
    }
  }
}

import {Component, OnInit, NgZone} from '@angular/core';
import {Router} from '@angular/router-deprecated';
import {AppService} from '../app.service';
import {UserService} from './user.service';
//import {GroupService} from '../group/group.service';
import {SuperGroupService} from '../super_group/super_group.service';
import {AuthenticationService} from '../authentication/authentication.service';
import {ErrorComponent} from '../misc/error.component';

// Ref:: http://stackoverflow.com/questions/35530483/google-sign-in-for-websites-and-angular-2-using-typescript
// Google's login API namespace
declare var gapi:any;

@Component({
  selector: 'my-new-user',
  template: `
    <div class="my-new-user">
      <div class="row">
        <div class="col-xs-12 col-md-offset-3 col-md-6">

<!--
<div class="login-wrapper">
<p>You need to log in.</p>
<div id="{{googleLoginButtonId}}"></div>
</div>
<div class="main-application">
<p>Hello, {{userDisplayName}}!</p>
</div>
<div (click)="signOut()">Sign out</div>
-->


          <div class="g-signin2" data-onsuccess="onSignIn"></div>

          <form #newUserForm="ngForm" class="form-horizontal" novalidate>

            <div class="form-group">
              <div class="col-xs-12 col-sm-offset-2 col-sm-10">
                <h3>Welcome fellow human!</h3>
              </div>
            </div>
            <div class="form-group">
              <label for="displayname" class="col-sm-2 control-label">Display Name</label>
              <div class="col-sm-10">
                <input id="displayname" type="text" class="form-control" placeholder="Display name" required
                  [(ngModel)] = "model.displayname" maxlength="30"
                  ngControl = "displayname" #displayname = "ngForm"
                >
                <div [hidden]="displayname.valid || displayname.pristine" class="alert alert-danger">
                  Display name is required. Maximum 30 characters.
                </div>
                <div class="text-muted field-explainer">
                  Display name will be visible on your posts and comments.<br/>
                  Once set here it cannot be changed.
                </div>
              </div>
            </div>

            <div class="form-group">
              <label for="email" class="col-sm-2 control-label">Email</label>
              <div class="col-sm-10">
                <input id="email" type="text" class="form-control" placeholder="Email" required
                  [(ngModel)] = "model.email"
                  ngControl = "email" #email = "ngForm"
                >
                <div [hidden]="email.valid || email.pristine" class="alert alert-danger">
                  Email is required
                </div>
                <span class="text-muted field-explainer">Email is used to login to the site.</span>
              </div>
            </div>

            <div class="form-group">
              <label for="password" class="col-sm-2 control-label">Password</label>
              <div class="col-sm-10">
                <input id="password" type="password" class="form-control" placeholder="Password" required
                  [(ngModel)] = "model.password"
                  ngControl="password" #password = "ngForm"
                >
                <div [hidden]="password.valid || password.pristine" class="alert alert-danger">
                  Password is required
                </div>
                <span class="text-muted field-explainer">Password is also used to login to the site.</span>
              </div>
            </div>

            <div class="form-group">
              <label for="confirm_password" class="col-sm-2 control-label">Confirm Password</label>
              <div class="col-sm-10">
                <input id="confirm_password" type="password" class="form-control" placeholder="Confirm Password" required
                  [(ngModel)] = "model.confirm_password"
                  ngControl="confirm_password" #confirm_password = "ngForm"
                >
                <div [hidden]="(confirm_password.value == password.value) || confirm_password.pristine" class="alert alert-danger">
                  Passwords do not match.
                </div>
                <span class="text-muted field-explainer">Retype password just to be sure.</span>
              </div>
            </div>

            <div class="form-group">
              <label class="col-sm-2 control-label"></label>
              <div class="col-sm-10">
                <p class="form-control-static"><i>By clicking on Sign up, you agree to Angry.City's terms & conditions and privacy policy.</i></p>
              </div>
            </div>

            <div class="form-group">
              <div class="col-sm-offset-2 col-sm-10">
                <my-error [_error]="_error"></my-error>
              </div>
            </div>

            <div class="form-group">
              <div class="col-sm-10 col-sm-offset-2">
                <button (click)="onSubmit($event)" [disabled]="!newUserForm.form.valid" class="btn btn-default">Sign Up</button>
                <button (click)="goBack()" class="btn btn-default">Go Back</button>
              </div>
            </div>

          </form>

        </div>
      </div>
    </div>
  `,
  styles: [`
    .my-new-user .ng-valid[required] {
      border-left: 5px solid #42A948; /* green */
    }
    .my-new-user .ng-invalid {
      border-left: 5px solid #a94442; /* red */
    }
    .my-new-user .field-explainer {
/*      text-align: right; */
      font-size: 0.9em;
      font-style: italic;
    }
  `],
  directives: [ErrorComponent]
})
export class NewUserComponent {

  private model = {
    email: null,
    displayname: null,
    password: null,
    confirm_password: null,
    /*
    international: [],
    national: {},
    state: [],
    city: [],
    local: []
    */
  };
  //private _groupList = {international: [], national: [], state: [], city: [], local: [], selectedNational: {}};
  private _error = { msg: null, type: null };
  private _loggedInUserSubcription = null;
/*
googleLoginButtonId = "google-login-button";
userAuthToken = null;
userDisplayName = "empty";
// Angular hook that allows for interaction with elements inserted by the
// rendering of a view.
ngAfterViewInit() {
// Converts the Google login button stub to an actual button.
gapi.signin2.render(
this.googleLoginButtonId,
{
"onSuccess": this.onGoogleLoginSuccess,
"onfailure": this.onGoogleLoginFailure,
"scope": "profile",
"theme": "dark",
"longtitle": false
});
}
// Triggered after a user successfully logs in using the Google external
// login provider.
onGoogleLoginSuccess = (loggedInUser) => {
console.log(loggedInUser);
//console.log(loggedInUser.getAuthResponse());
//console.log(loggedInUser.getBasicProfile());
this._zone.run(() => {
var profile = loggedInUser.getBasicProfile();
console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
console.log('Name: ' + profile.getName());
console.log('Full Name: ' + profile.getName());
console.log('Given Name: ' + profile.getGivenName());
console.log('Family Name: ' + profile.getFamilyName());
console.log('Email: ' + profile.getEmail());
console.log('Image URL: ' + profile.getImageUrl());
console.log(loggedInUser.getAuthResponse().id_token);
this.userAuthToken = loggedInUser.getAuthResponse().id_token;
this.userDisplayName = loggedInUser.getBasicProfile().getName();
});
}
onGoogleLoginFailure(xx) {
console.log("Fail", xx)
}
signOut() {
let auth2 = gapi.auth2.getAuthInstance();
auth2.signOut().then(function () {
console.log('User signed out.');
});
}
*/

  constructor(
    private _appService: AppService,
    private _userService: UserService,
    private _superGroupService: SuperGroupService,
    private _authenticationService: AuthenticationService,
    private _zone: NgZone,
    private _router: Router) {}

  ngOnInit() {
    /*
    this._superGroupService.getSuperGroupsByType('international').then( sgList => this._groupList.international = sgList );
    this._superGroupService.getSuperGroupsByType('national').then( sgList => this._groupList.national = sgList );
    this._superGroupService.getSuperGroupsByType('state').then( sgList => this._groupList.state = sgList );
    this._superGroupService.getSuperGroupsByType('city').then( sgList => this._groupList.city = sgList );
    this._superGroupService.getSuperGroupsByType('local').then( sgList => this._groupList.local = sgList );
    */

    // Only logged in uses can post
    this._loggedInUserSubcription = this._authenticationService.loggedInUser$.subscribe(currentUser => {
      if(currentUser) {
        this._router.navigate(['HyperGroupPostListDefault']);
      } else {
        // User not logged in, register allowed (this should not happen)
      }
    });
    // Only logged in uses can post (init version)
    // TODO:: Find the Observable way to do this
    let currentUser = this._authenticationService.getLoggedInUser();
    if(currentUser) {
      this._router.navigate(['HyperGroupPostListDefault']);
    } else {
      // User not logged in, register allowed
    }

  }

  onSubmit(event) {
    this._error.msg = null;
    event.preventDefault();
    /*
    this.model.international = this._groupList.international.filter(el => el.selected == true)
    this.model.national = this._groupList.selectedNational
    this.model.state = this._groupList.state.filter(el => el.selected == true)
    this.model.city = this._groupList.city.filter(el => el.selected == true)
    this.model.local = this._groupList.local.filter(el => el.selected == true)
    */
    this._userService.createNewUser(this.model).subscribe(
      user => {
        // Registeratin success
        // redirect ot login page (TODO: Auto login the new registered user)
        //this._router.navigate(['ViewUser', {id: user.id}]);
        console.log(user)
        if ( user.emailSuccess ) {
          this._appService.createNotification( { text: user.msg, type: 'success', timeout: 20000 } );
        } else {
          this._appService.createNotification( { text: user.msg, type: 'danger', timeout: 20000 } );
        }
        this._router.navigate(['Login']);
      },
      error => {
        // TODO:: Handle errors
        //console.log(error)
        this._error.msg = error;
      })
  }

  ngOnDestroy() {
    this._loggedInUserSubcription.unsubscribe();
  }

  goBack() {
    window.history.back();
  }

}

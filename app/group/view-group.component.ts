import {Component, OnInit, OnDestroy} from '@angular/core';
import {Router, RouteParams, RouterLink} from '@angular/router-deprecated';
import {AppService} from '../app.service';
import {Group} from './group';
import {User} from '../user/user';
import {GroupService} from './group.service';
import {Post} from '../post/post';
import {PostListComponent} from '../post/post-list.component';
import {PostTemplateType} from '../post/post-template-types';
import {AuthenticationService} from '../authentication/authentication.service';
import {ErrorComponent} from '../misc/error.component';
import {FabButtonComponent} from '../misc/fab-button.component';

@Component({
  selector: 'my-view-group',
  template: `
  <div class="my-view-group">

    <div>

      <div *ngIf="group">

      <div class="row border-row">
        <div class="col-xs-12">

          <div *ngIf="_sticky" class="dummy-div"></div>
          <div class="group-details" [ngClass]="{sticky: _sticky}">
            <div class="group-name">
              <div class="row">
                <div class="col-xs-10 col-sm-8">
                  <a class="menu-link" [routerLink]="[ '/HyperGroupPostList', { geo: _hyper_group } ]">
                    <i class="fa" [ngClass]="{'fa-plane': _hyper_group == 'international', 'fa-train': _hyper_group == 'national', 'fa-bus': _hyper_group === 'state', 'fa-car': _hyper_group === 'city', 'fa-bicycle': _hyper_group === 'local' }"></i> /
                  </a>
                  <a [routerLink]="['SuperGroupPostList', {super_group_name: group.supergroup.name}]">{{group.supergroup.name}}</a> /
                  <a [routerLink]="['ViewGroup', {super_group_name: group.supergroup.name, group_name: group.name}]">{{group.name}}</a>
                </div>
                <div class="col-xs-2 col-sm-4">

                  <div class="new-post hidden-xs">
                    <div>
                      <div class="pull-right btn btn-sm btn-default new-post-button" (click)='gotoNewPostForm($event)'>
                        <i class="fa fa-pencil" aria-hidden="true"></i> &nbsp;New Post
                      </div>
                    </div>
                  </div>

                  <div class="pull-right btn btn-sm btn-default subscribe-button" *ngIf="!group.isCurrentUserSubscribed && !group.isCurrentUsersMembershipPending" (click)="subscribeToThisGroup()">
                    Join Group
                  </div>

                </div>
              </div>
            </div>
          </div>

        </div> <!-- !col -->
      </div> <!-- !row -->

      <div class="row border-row">
        <div class="col-xs-12">
          <div class="group-description">
            <div class="group-label">Group description</div>
            <span *ngIf="group.description">{{group.description}}</span>
            <span *ngIf="!group.description"><i>Welcome to {{group.supergroup.name}}/{{group.name}}</i></span>
          </div>
        </div> <!-- !col -->
      </div> <!-- !row -->

      <div class="row border-row" *ngIf="group.isCurrentUsersMembershipPending || group.isCurrentUserSubscribed && !group.currentUserIsGroupOwner">
        <div class="col-xs-12">
          <div class="group-ops">
            <div class="btn btn-xs btn-link sub-text" *ngIf="group.isCurrentUserSubscribed && !group.currentUserIsGroupOwner" (click)="unSubscribeFromThisGroup()">Leave Group</div>
            <div class="btn btn-xs btn-link sub-text" *ngIf="group.isCurrentUsersMembershipPending" (click)="cancelPendingGroupMembership()">Membership Pending (Cancel?)</div>
          </div>
        </div> <!-- !col -->
      </div> <!-- !row -->

      <div class="row border-row" *ngIf="group.currentUserIsGroupOwner">
        <div class="col-xs-12">
          <div class="admin-row">
            <div class="group-label">Admin Panel</div>
            <a [routerLink]="['EditGroup', {group_id: group.id}]" class="">Edit Group</a>
            &bull;
            <a [routerLink]="['ApproveMembership', {group_id: group.id}]" class="">Pending Members</a>
          </div>
        </div> <!-- !col -->
      </div> <!-- !row -->

      </div> <!-- *ngIf="group" -->

      <my-error [_error]="_error"></my-error>

      <my-post-list [posts]="groupPostsSticky" [postTemplateType]="postTemplateType"  [currentUser]="_currentUser" [view]="_view" [contextGroups]="[group]"></my-post-list>
      <my-post-list [posts]="groupPosts" [postTemplateType]="postTemplateType"  [currentUser]="_currentUser" [view]="_view" [contextGroups]="[group]"
        [loadButtonState]="_loadButtonState" (loadMoreClicked)="loadMoreClicked($event)"></my-post-list>

      <div class="fab-button visible-xs-block">
        <my-fab-button (clicked)='gotoNewPostForm($event)'></my-fab-button>
      </div>

    </div>    <!-- my-view-group -->
  </div>  <!-- ! ngIfGroup -->
  `,
  styles: [`
  .my-view-group .dummy-div {
    /** dummy div should be the exact height of the sticky div
     * this is to prevent jumping of the page
     */
    height: 55px;
  }
  .my-view-group .sticky {
    position: fixed;
    top: 0;
    background-color: rgba(255, 255, 255, 0.98);
    z-index: 10;
    margin-left: -15px;
    padding-left: 15px;
    padding-right: 15px;
    width: 100%;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }
  .my-view-group .border-row {
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }
  .my-view-group .group-name {
    padding-top: 15px;
    padding-bottom: 15px;
    transition: 0.05s ease-in-out;
    display: block;
    vertical-align: baseline;
    letter-spacing: 1px;
    font-size: 18px;
    font-family: WorkSans,sans-serif;
    overflow-wrap: break-word;
    word-wrap: break-word;
    color: rgba(0, 0, 0, 0.6);
  }
  .my-view-group .group-name a {
    color: rgba(0, 0, 0, 0.6);
    text-decoration: none;
  }
  .my-view-group .group-ops {
    padding: 15px 0;
  }
  .my-view-group .group-description {
    color: rgba(0, 0, 0, 0.8);
    display: block;
    font-family: Georgia, Cambria, 'Times New Roman', Times, serif;
    font-size: 18px;
    line-height: 27px;
    margin-bottom: 15px;
    margin-top: 15px;
    word-wrap: break-word;
    -webkit-font-smoothing: antialiased;
    overflow-wrap: break-word;
    word-wrap: break-word;
  }
  .my-view-group .admin-row {
    padding: 15px 0;
  }
  .my-view-group .group-label {
    -webkit-font-smoothing: antialiased;
    color: rgb(200, 200, 200);
    font-family: "Graphik Web","Helvetica Neue",Helvetica,Arial,sans-serif;
    font-size: 12px;
    line-height: 1;
    text-transform: uppercase;
    vertical-align: middle;
  }
  .my-view-group .sub-text {
    color: rgba(0, 0, 0, 0.4);
  }
  .my-view-group .subscribe-button {
    /*
    color: rgba(0, 0, 0, 0.4); */
    padding: 3px 15px 3px 10px;
    margin-right: 15px;
    color: #af2b2b;
  }
  .my-view-group .new-post {
    padding-top: 0px;
  }
  .my-view-group .new-post-button {
    padding: 3px 15px 3px 10px;
    color: #af2b2b;
  }
  `],
  //styleUrls: ['app/group/view-group.component.css'],
  //inputs: ['group'],
  directives: [PostListComponent, RouterLink, ErrorComponent, FabButtonComponent]
})
export class ViewGroupComponent implements OnInit, OnDestroy  {

  private group: Group;
  private _super_group = null;
  private _hyper_group = null;
  private _super_group_name = null
  private _group_name = null

  private groupPosts: Post[] = [];
  private groupPostsSticky: Post[] = [];
  private _view = "group";
  private postTemplateType: PostTemplateType;
  private _loggedInUserSubcription = null;
  private _currentUser: User = null;
  private _error = { msg: null, type: null };
  private _sticky:boolean = false;
  private _loadButtonState = { show: true, buzyLoadingPosts: false, reachedLastPost: false, postListHasNoPosts: false }

  constructor(
    private _appService: AppService,
    private _groupService: GroupService,
    private _authenticationService: AuthenticationService,
    private _router: Router,
    private _routeParams: RouteParams) {}

  ngOnInit() {

    this.postTemplateType = PostTemplateType.Grouplist;

    this._super_group_name = this._routeParams.get('super_group_name');
    this._group_name = this._routeParams.get('group_name');

    // Only logged in uses view posts
    this._loggedInUserSubcription = this._authenticationService.loggedInUser$.subscribe(
      currentUser => {
        //if(currentUser) {
          this._currentUser = currentUser;
          this._error.msg = null;
          this._loadButtonState = { show: true, buzyLoadingPosts: false, reachedLastPost: false, postListHasNoPosts: false }
          this.getPostsInGroup(this._super_group_name, this._group_name, true);
        //} else {
        //  this.getPostsInGroup(super_group_name, group_name);
        //}
      },
      error => {
        this._error.msg = error;
      });
    // Only logged in uses view post (init version)
    // TODO:: Find the Observable way to do this
    let currentUser = this._authenticationService.getLoggedInUser();
    //if(currentUser) {
      this._currentUser = currentUser;
      this._error.msg = null;
    //} else { }
    // Logged in or not fetch posts immidiately
    this._loadButtonState = { show: true, buzyLoadingPosts: false, reachedLastPost: false, postListHasNoPosts: false }
    this.getPostsInGroup(this._super_group_name, this._group_name, true);

    // Sticky header. Ref: Geo-filter component for details
    //window.addEventListener("scroll", this.myEfficientFn);
    window.addEventListener("scroll", this._scrollListener.bind(this));
  }   // !ngOnInit
/*
  myEfficientFn = this.debounce( () => {
	  // All the taxing stuff you do
    this._sticky = window.scrollY > 60;
    //console.log(this._sticky)
  }, 0, false);   // 100ms
  debounce(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    }
  }
*/
  _scrollListener() {
    this._sticky = window.scrollY > 60;
  }

  /**
   * Fetches posts in given supergroup/group
   */
  getPostsInGroup( super_group_name: string, group_name: string, startOver?: boolean ) {

    let lastPostId = -1 // -1 == get the newest post
    if ( this.groupPosts && this.groupPosts.length > 0 && !startOver ) {
      lastPostId = Math.min.apply(Math, this.groupPosts.map( post => post.id ) );
    }

    this._loadButtonState.buzyLoadingPosts = true;
    this._groupService.getPostsInGroup( super_group_name, group_name, lastPostId )
      .subscribe(
        groupAndPostList => {
          //console.log(groupAndPostList)
          this._error.msg = null;
          this.group = groupAndPostList.group;
          this._super_group = this.group.supergroup;
          this._hyper_group = this._super_group.type;
          if ( this._super_group.type == 'international' ) {
            if ( this._currentUser && this._currentUser.national.find( group => group.id === this._super_group.id ) ) {
              this._hyper_group = 'national'
            }
          }
          //this.groupPosts = groupAndPostList.postList;
          if ( startOver ) {
            this.groupPosts = groupAndPostList.postList;
          } else {
            this.groupPosts = this.groupPosts.concat( groupAndPostList.postList );
          }

          this._loadButtonState.reachedLastPost = groupAndPostList.postList.length == 0
          this.groupPostsSticky = groupAndPostList.postListSticky;

          if( this.groupPosts.length + this.groupPostsSticky.length < 1 ) {
            if ( this.group.non_members_can_view || this.group.isCurrentUserSubscribed ) {
              this._error.msg = "This group does not have any posts yet. You can help by creating the first post!"
              this._loadButtonState.postListHasNoPosts = true;
            } else {
              this._error.msg = "This group is private. Non members can not view posts in this group."
            }
          }

          // Update user's score
          if ( this._currentUser && this._currentUser.id ) {
            let temp = {};
            temp[this._currentUser.id] = groupAndPostList.currentUserScore;
            this._authenticationService.updateCurrentUsersScore( temp );
          }

          this._loadButtonState.buzyLoadingPosts = false;
        },
        error => {
          console.log(error);
          console.log(typeof error);
          //this._error.msg = error;
          this._error = { type: 'danger', msg: error };
          console.log(this._error)
          this._loadButtonState.show = false;
          this._loadButtonState.buzyLoadingPosts = false;
          this._loadButtonState.reachedLastPost = false;
        });
  }

  loadMoreClicked( noop ) {
    if ( this._loadButtonState.buzyLoadingPosts || this._loadButtonState.reachedLastPost ) return;
    this.getPostsInGroup( this._super_group_name, this._group_name, false )
  }


  /***************************************
   * SYNC WITH super_group-sidebar.component
   *
   ***************************************/

  /**
   * Subscribe current user to this group
   */
  subscribeToThisGroup() {
    if(!this.group.id) return;
    if(!this._currentUser || !this._currentUser.id) {
      //this._errorMsg = "User must be logged in to join a group.";
      this._appService.createNotification( { text: "User must be logged in to join a group.", type: 'danger' } );
      return;
    }
    this._groupService.subscribeCurrentUserToGroup(this.group.id).subscribe(
      updatedUser => {
        //console.log("SUCCESS SUBS", res);
        // If group membership needs approval, then server wourld have added
        // the user to waiting list or else would have directly subscribed
        if(this.group.membership_needs_approval) {
          this.group.isCurrentUsersMembershipPending = true;
        } else {
          this.group.isCurrentUserSubscribed = true;
        }
        //this._authenticationService.updateCurrentUser(updatedUser); // <-- NOT NEEDED HERE
        this._appService.createNotification( { text: "Joined group '" + this._super_group.name + "/" + this.group.name + "'", type: 'success' } );
      },
      error => {
        //this._errorMsg = error;
        this._appService.createNotification( { text: error, type: 'danger' } );
        //console.log("ERROR", error);
      })
  }

  /**
   * Unsubscirbe current user from this group
   */
  unSubscribeFromThisGroup() {
    //console.log("Un subscribing")
    if(!this.group.id) return;
    // if(!this._currentUser || !this._currentUser.id) return;
    if(!this._currentUser || !this._currentUser.id) {
      this._appService.createNotification( { text: "User must be logged in to leave groups.", type: 'danger' } );
      return;
    }

    this._groupService.unSubscribeCurrentUserFromGroup(this.group.id).subscribe(
      updatedUser => {
        //console.log("SUCCESS UN SUBS", res);
        this.group.isCurrentUserSubscribed = false;
        //this._authenticationService.updateCurrentUser(updatedUser); // <-- NOT NEEDED HERE
        this._appService.createNotification( { text: "Left the group '" + this._super_group.name + "/" + this.group.name + "'", type: 'success' } );
      },
      error => {
        //this._errorMsg = error;
        this._appService.createNotification( { text: error, type: 'danger' } );
        //console.log("ERROR", error);
      })
  }

  /**
   * Cancel the logged in users pending membership to a group that requires approval
   */
  cancelPendingGroupMembership() {
    //console.log("Cancelling pending membership")
    if(!this.group.id) return;
    //if(!this._currentUser || !this._currentUser.id) return;
    if(!this._currentUser || !this._currentUser.id) {
      this._appService.createNotification( { text: "User must be logged in..", type: 'danger' } );
      return;
    }

    this._groupService.cancelCurrentUsersPendingMembership(this.group.id).subscribe(
      updatedUser => {
        //console.log("SUCCESS UN SUBS pending meme", res);
        this.group.isCurrentUsersMembershipPending = false;
        //this._authenticationService.updateCurrentUser(updatedUser); // <-- NOT NEEDED HERE
        this._appService.createNotification( { text: "Cancelled pending memebership for '" + this._super_group.name + "/" + this.group.name + "'", type: 'success' } );
      },
      error => {
        //this._errorMsg = error;
        this._appService.createNotification( { text: error, type: 'danger' } );
        //console.log("ERROR", error);
      })

  }

  ngOnDestroy() {
    this._loggedInUserSubcription.unsubscribe();
    //window.removeEventListener("scroll", this.myEfficientFn);
    window.removeEventListener("scroll", this._scrollListener);
  }

  goBack() {
    window.history.back();
  }

  gotoNewPostForm() {
    this._router.navigate(['NewPost', {super_group_name: this.group.supergroup.name, group_name: this.group.name}]);
  }

}

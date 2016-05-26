import {Component, OnInit, OnDestroy} from '@angular/core';
import {Router, RouteParams} from '@angular/router-deprecated';
import {Post} from '../post/post';
import {User} from '../user/user';
import {AppService} from '../app.service';
import {PostService} from '../post/post.service';
import {PostListComponent} from '../post/post-list.component';
import {PostTemplateType} from '../post/post-template-types';
import {SuperGroup} from '../super_group/super_group';
import {GeoFilterComponent} from '../post/geo-filter.component';
import {AuthenticationService} from '../authentication/authentication.service';
import {ErrorComponent} from '../misc/error.component';
import {FabButtonComponent} from '../misc/fab-button.component';

@Component({
  selector: 'my-hyper_group-post-list-loader',
  template: `
    <div class="my-hyper_group-post-list-loader">

      <my-geo-filter [geoSelection]="_geoSelection" [superGroupList]="_superGroupList"></my-geo-filter>

      <my-error [_errorMsg]="_errorMsg"></my-error>

      <my-post-list [posts]="posts" [postTemplateType]="postTemplateType" [currentUser]="_currentUser"></my-post-list>

      <div class="fab-button">
        <my-fab-button (clicked)='gotoNewPostForm($event)'></my-fab-button>
      </div>

    </div>
  `,
  styles: [`
    .my-hyper_group-post-list-loader {

    }
    .pre-post-list-outer-div {
      clear: both;
    }
  `],
  directives: [PostListComponent, GeoFilterComponent, ErrorComponent, FabButtonComponent]
})
export class HyperGroupPostListLoaderComponent implements OnInit, OnDestroy {

  private posts: Post[];
  private postTemplateType: PostTemplateType;
  //private parent_gorup: Group_Of_Groups;
  private _geoSelection: string = 'national';
  private _superGroupList: SuperGroup[];
  private _errorMsg = null;
  private _showUserControls: boolean = false;
  private _currentUser: User = null;
  private _loggedInUserSubcription = null;


  constructor(
    private _appService: AppService,
    private _authenticationService: AuthenticationService,
    private _postService: PostService,
    private _router: Router,
    private _routeParams: RouteParams
  ) { }

  ngOnInit() {

    this.postTemplateType = PostTemplateType.List;

    this._geoSelection = this._routeParams.get('geo') || this._appService.getGeoSelection() || this._geoSelection;
    this._appService.setGeoSelection(this._geoSelection);

    // Only logged in uses view posts
    this._loggedInUserSubcription = this._authenticationService.loggedInUser$.subscribe(
      currentUser => {
        if(currentUser) {
          this._currentUser = currentUser;
          this._errorMsg = null;
          this.getPostsByHypergroup(this._geoSelection);
        } else {
          this.getPostsByHypergroup(this._geoSelection);
        }
      });
    // Only logged in uses view post (init version)
    // TODO:: Find the Observable way to do this
    let currentUser = this._authenticationService.getLoggedInUser();
    if(currentUser) {
      this._currentUser = currentUser;
      this._errorMsg = null;
    } else { }
    // Logged in or not fetch posts immidiately
    this.getPostsByHypergroup(this._geoSelection);


  }   // !ngOnInit()

  /**
   * Fetches posts by hypergroup
   */
  getPostsByHypergroup(geoSelection: any) {
    this._postService.getPostsByHyperGroup(geoSelection).subscribe(
      resp => {
        //console.log(resp)
        this.posts = resp.posts;
        if(this.posts.length < 1) {
          this._errorMsg = "Your '" + this._geoSelection.toUpperCase() + "' groups do not have any posts yet. " +
                           "Please visit your profile to subscribe to some more active groups, or create a new post yourself."
        }

        this._superGroupList = resp.superGroupList;
        if(this._superGroupList.length < 1) {
          this._errorMsg = "You have not subscibed to any groups in '" + this._geoSelection.toUpperCase() + "'. " +
                           "Please visit your profile to subscribe to groups."
        }
      },
      error => {
        //console.log(error);
        this._errorMsg = error;
      });
  }

  ngOnDestroy() {
    this._loggedInUserSubcription.unsubscribe();
  }

  gotoNewPostForm() {
    this._router.navigate(['NewPost']);
  }
}

import {Component, OnInit} from '@angular/core';
import {RouteParams, Router} from '@angular/router-deprecated';
import {AppService} from '../app.service';
import {Post} from './post';
import {Group} from '../group/group';
import {PostService} from './post.service';
import {AuthenticationService} from '../authentication/authentication.service';
import {GroupService} from '../group/group.service';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {ErrorComponent} from '../misc/error.component';

@Component({
  selector: 'my-edit-post',
  template: `
  <div class="my-edit-post">

    <div *ngIf="_readyToEdit">     <!--  *ng If="!_errorMsg" -->

      <form #postForm="ngForm" class="form-horizontal" novalidate>

        <div class="post-select form-group">
          <div class="col-xs-12 col-sm-offset-2 col-sm-10">
            <h3>Edit Post</h3>
          </div>
        </div>

        <div class="post-select form-group">
          <label for="type" class="col-sm-2 control-label">Post Type</label>
          <div class="col-sm-10">
            <span *ngFor="let postType of _postTypes">
              <label class="radio-inline">
                <input type="radio" name="type" (click)="_model.type = postType" [checked]="postType === _model.type"> {{postType | uppercase}} &nbsp;&nbsp;
              </label>
            </span>
          </div>
        </div>

        <div class="post-text form-group">
          <label for="title" class="col-sm-2 control-label">Title</label>
          <div class="col-sm-10">
            <input id="title" type="text" class="form-control" required
              [(ngModel)] = "_model.title" placeholder="Post title"
              ngControl = "title" #title="ngForm"
            >
            <div [hidden]="title.valid || title.pristine" class="alert alert-danger">
              Title is required
            </div>
          </div>
        </div>

        <div *ngIf="_model.type == 'link'">
          <div class="post-text form-group">
            <label for="link" class="col-sm-2 control-label">Link</label>
            <div class="col-sm-10">

              <div class="row">
                <div class="col-xs-12">
                  <input id="link" type="url" class="form-control" required
                    [(ngModel)] = "_model.link" placeholder="Paste a URL here ( e.g. http://example.com/xyz )"
                    ngControl = "link" #link="ngForm" (change)="searchImagesFromUrl(_model.link)"
                  >
                  <div [hidden]="link.valid || link.pristine" class="alert alert-danger">
                    Link is required
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col-sm-12">
                  <div class="post-images-message" *ngIf="_post_images_message">{{_post_images_message}}</div>
                  <div class="post-images" *ngFor="let image of _imageList; let i = index" (click)="selectPostImage(i)">
                    <div class="post-image pull-left" [ngClass]="{ 'post-image-selected' : image.selected }">
                      <img src={{image.src}} class="img-responsive img-rounded" alt="image loading">
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        <div class="post-image-text form-group">
          <label for="post-image-text" class="col-sm-2 control-label">Image URL</label>
          <div class="col-sm-10">
            <input type="text" class="form-control"
              [(ngModel)] = "_model.image" placeholder="Image to be displayed with the post. (Optional)"
              ngControl = "post_image" #post_image="ngForm"
            >
            <div [hidden]="post_image.valid || post_image.pristine" class="alert alert-danger">
              Invalid Image URL.
            </div>
          </div>
        </div>

        <div class="post-textarea form-group">
          <label for="text" class="col-sm-2 control-label">Text</label>
          <div class="col-sm-10">
            <textarea type="text" class="form-control" rows="20"
              [(ngModel)] = "_model.text" placeholder="Post text"
              ngControl = "text" #text="ngForm"
            ></textarea>
            <div [hidden]="text.valid || text.pristine" class="alert alert-danger">
              Text is required
            </div>
          </div>
        </div>

        <div class="form-group hidden">
          <label class="col-sm-2 control-label">Group</label>
          <div class="col-sm-10">
            <div class="">
              <p class="form-control-static">
                <span *ngIf="_model.group">
                  {{_model.group.supergroup.name | uppercase}}/{{_model.group.name}}
                </span>
                <span *ngIf="!_model.group"><i>No Group Selected</i></span>
              </p>
              <input id="group" type="text" class="hidden" required
                [(ngModel)] = "_model.group"
                ngControl = "group" #group="ngForm">
              <div [hidden]="group.valid || !postForm.form.submitted" class="alert alert-danger">
                Group is required
              </div>
            </div>

            <div class="row" *ngIf="_showGroupSearchBox">
              <div class="col-xs-12">
                <div class="post-text form-group1">
                  <label for="group-search" class="search-group-label">Search Groups (and click on the name to select)</label>
                </div>
              </div>
              <div class="col-sm-12">
                <input id="group-search" type="text" class="form-control"
                  ngControl = "searchGroupTmp" #searchGroupTmp="ngForm" [(ngModel)]="_searchString"
                  (keyup)="search(searchGroupTmp.value)">
              </div>
              <div class="col-sm-12">
                <button class="btn btn-sm btn-default search-results" *ngFor="let item of items | async" (click)="selectSuperGroupSlashGroup(item)">
                  {{item.supergroup.name}}/{{item.name}}
                </button>
              </div>
            </div>      <!-- ! row -->

          </div>    <!-- col-sm-10 -->
        </div>      <!-- ! form-group -->

        <div class="post-as-anon form-group hidden">
          <label for="post-as-anon" class="col-sm-2 control-label">Post As Anonymous</label>
          <div class="col-sm-10">
            <label  class="radio-inline">
              <input type="radio" name="post-as-anon" (click)="_model.post_as_anon = 1"  [checked]="_model.post_as_anon === 1"> Yes
            </label>
            <label  class="radio-inline">
              <input type="radio" name="post-as-anon" (click)="_model.post_as_anon = 0" [checked]="_model.post_as_anon === 0"> No
            </label>
          </div>
        </div>

        <div *ngIf="_model.postedby && _model.group">
          <div class="sticky-post form-group" [ngClass]="{ hidden: _model.group.owner !== _model.postedby.id }">
            <label for="sticky-post" class="col-sm-2 control-label">Sticky Post</label>
            <div class="col-sm-10">
              <label  class="radio-inline">
                <input type="radio" name="sticky-post" (click)="_model.sticky_post = 1"  [checked]="_model.sticky_post === 1"> Yes
              </label>
              <label  class="radio-inline">
                <input type="radio" name="sticky-post" (click)="_model.sticky_post = 0" [checked]="_model.sticky_post === 0"> No
              </label>
            </div>
          </div>
        </div>

        <div class="post-select form-group">
          <div class="col-xs-12 col-sm-offset-2 col-sm-10">
            <my-error [_error]="_error"></my-error>
          </div>
        </div>

        <div class="form-group">
          <div class="col-sm-offset-2 col-sm-10">
            <button (click)="onSubmit($event)" class="btn btn-default" [disabled]="!postForm.form.valid">Update Post</button>
            <button (click)="goBack()" class="btn btn-default">Back</button>
          </div>
        </div>
      </form>
    </div>

  </div>
  `,
  styles: [`
    .my-edit-post .ng-valid[required] {
      border-left: 5px solid #42A948; /* green */
    }
    .my-edit-post .ng-invalid {
      border-left: 5px solid #a94442; /* red */
    }
    .my-edit-post form {
      min-width: 250px;
    }
    .my-edit-post .post-textarea textarea{
      width: 100%;
    }
    .my-edit-post .post-text input{
      width: 100%;
    }
    .my-edit-post .post-select select{
      width: 100%;
    }
    .my-edit-post .search-group-label {
      color: rgba(0, 0, 0, 0.4);
    }
    .my-edit-post .search-results {
       margin: 10px 10px 0 0;
     }
     .my-edit-post .post-images-message {
       margin-top: 20px;
       margin-bottom: 20px;
       font-weight: bold;
       font-style: italic;
     }
     .my-edit-post .post-image {
      max-width: 150px;
      margin-right: 15px;
      margin-bottom: 15px;
      padding: 5px;
     }
     .my-edit-post .post-image-selected {
       /* border: 1px solid #337ab7; */
       border-radius: 6px;
       background-color: #ff5e5e;
     }
  `],
  inputs: ['post'],
  directives: [ErrorComponent]
})
export class EditPostComponent {

  private _postTypes          = ['text', 'link'];
  private _model              = null;
  private _error              = { msg: null, type: null };
  private _showGroupSearchBox = true;
  //private _searchGroup      = '';
  private _loggedInUserSubcription = null;
  private _searchString       = '';
  private _post = null;
  private _readyToEdit = false;
  private _currentUser = null;
  private _imageList          = [];
  private _post_images_message = null;

  constructor(
    private _postService           : PostService,
    private _routeParams           : RouteParams,
    private _authenticationService : AuthenticationService,
    private _groupService          : GroupService,
    private _router                : Router,
    private _appService            : AppService
  )
  { }

  ngOnInit() {

    let postId = this._routeParams.get('postid') || null;

    if( postId ) {
      this._postService.getPost(postId).subscribe(
        post => {
          this._model = post;
          this._model.post_as_anon = 0;
          this._model.sticky_post = this._model.sticky_level ? 1 : 0     // 1 for group, 0 for no sticky
          if ( this._currentUser ) {
            this.searchImagesFromUrl(this._model.link)  // since user is also needed
            this._readyToEdit = true;
          }
        },
        error => {
          this._error.msg = error;
        })     // !subscribe
    }

    // Only logged in uses can post
    this._loggedInUserSubcription = this._authenticationService.loggedInUser$.subscribe(currentUser => {
      if(currentUser) {
        this._currentUser = currentUser;
        this._error.msg = null;
        if ( this._model ) {
          this.searchImagesFromUrl(this._model.link)
          this._readyToEdit = true;
        }
      } else {
        this._error.msg = "User must be logged in to edit posts.";
        this._readyToEdit = false;
      }
    });
    // Only logged in uses can post (init version)
    // TODO:: Find the Observable way to do this
    let currentUser = this._authenticationService.getLoggedInUser();
    if( currentUser ) {
      this._currentUser = currentUser;
      this._error.msg = null;
      if ( this._model ) this._readyToEdit = true;
    } else {
      this._error.msg = "User must be logged in to edit posts.";
      this._readyToEdit = false;
    }

  }

  /**
   * Auto complete super_group/group
   */
  // Final version
  private _searchTermStream = new Subject<string>();
  search(term: string) {
    this._searchTermStream.next(term);
  }
  items:Observable<string> = this._searchTermStream
    .debounceTime(500)
    .distinctUntilChanged()
    .switchMap((term:string) => this._groupService.searchGroups(term));

  /**
   * User clicked on a gog/group from the autocomplete dropdown list
   */
  selectSuperGroupSlashGroup(item) {
    this._model.group = item;
    //this.model.superGroupSlashGroup = item.supergroup.name+'/'+item.name;
  }


  /**
   * User posted a url in link type post
   */
  searchImagesFromUrl( url : string ) {
    //console.log( "ONCHANE", url )
    this._post_images_message = "Loading images from the Link..."
    this._postService.fetchPostImagesFromUrl( url ).subscribe(
      imageList => {
        //console.log( imageList );
        this._imageList = imageList.imageList;
        if ( this._imageList.length > 0 ) {
          this._post_images_message = this._imageList.length + " images found. Click to select a suitable image for the post."
          this._post_images_message = "Click to select a suitable image for the post."
        } else {
          this._post_images_message = "No images found."
        }
        //this._router.navigate(['ViewPost', {postid: post.id}]);
      },
      error => {
        this._post_images_message = "Error loading images."
        // this._error.msg = error;
        // console.log(error);
      });
  }
  /**
   * User clicked on an image form the image list
   */
  selectPostImage( index: any ) {
    //console.log( index, this._imageList )

    this._imageList.forEach( (image, ind, arr) => {
      if ( ind != index)
        arr[ind].selected = false;
    })

    if ( this._imageList[ index ].selected == true ) {
      this._imageList[ index ].selected = false;
      this._model.image = null;
    } else {
      this._imageList[ index ].selected = true;
      this._model.image = this._imageList[ index ].src;
    }

  }

  /**
   * Submit the new post form
   */
  onSubmit(event) {

    event.preventDefault();

    if( !this._model.group || !this._model.postedby ) return;

    let properModel = {
      id       : this._model.id,
      title    : this._model.title,
      link     : this._model.link || null,
      text     : this._model.text || null,
      type     : this._model.type,
      image    : this._model.image || null,
      postedby : this._model.postedby.id,
      group    : this._model.group.id,
      post_as_anon : this._model.post_as_anon ? true : false,
      sticky_level : this._model.sticky_post ? 1 : 0     // 1 for group, 0 for no sticky
    }

    //console.log(properModel);

    this._postService.editPost(properModel).subscribe(
      post => {
        //console.log(post);
        this._router.navigate(['ViewPost', {postid: post.id}]);
      },
      error => {
        this._error.msg = error;
        // console.log(error);
      });
  }

  ngOnDestroy() {
    this._loggedInUserSubcription.unsubscribe();
  }

  goBack() {
    window.history.back();
  }

}

import {Component, OnInit} from '@angular/core';
import {PostComponent} from './post.component';

@Component({
  selector: 'my-post-list',
  template: `
    <div class="my-post-list">
      <div *ngFor="let post of posts">
        <my-post [post]="post" [type]="postTemplateType" [currentUser]="currentUser"></my-post>
      </div>
    </div>
  `,
  directives: [PostComponent],
  inputs: ["posts",  "postTemplateType", "currentUser"]

})
export class PostListComponent implements OnInit {

  private posts = null;

  constructor() {}

  ngOnInit() { }

}

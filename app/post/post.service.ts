import {Post} from './post';
import {MOCK_POSTS} from './mock-posts';
import {Injectable} from 'angular2/core';
import {GroupService} from '../group/group.service';

@Injectable()
export class PostService {
  
  constructor(
    private _groupService: GroupService
  ) {
    
  }
  
  getPosts() {
    return Promise.resolve(MOCK_POSTS);
  }
  
  // See the "Take it slow" appendix
  getPostsSlowly() {
    return new Promise<Post[]>(resolve =>
      setTimeout(()=>resolve(MOCK_POSTS), 2000) // 2 seconds
    );
  }
  
  getPost(id: number) {
    return Promise.resolve(MOCK_POSTS).then(
      posts => posts.filter(post => post.id === id)[0]
    );
  }
  
  getPostsByGroupOfGroups(gog_names: string[]) {
    return Promise.resolve(MOCK_POSTS).then(
      //posts => posts.filter(post => post.group.parent_group.name === gog_names)
      posts => posts.filter(post => gog_names.indexOf(post.group.parent_group.name) > -1)
    );
  }
  
  createNewPost(newPost: any) {
    // Serve should handle these things
    let lastPost:Post = MOCK_POSTS.reduceRight((left, right) => {
                    if(left.id > right.id) return left
                      else return right;
                  });

    return this._groupService.getGroup(newPost.group_of_groups, newPost.group).then(
      group => {
        let newProperPost = {
          id: +lastPost.id + 1,
          upvotes: 0,
          downvotes: 0,
          title: newPost.title,
          text: newPost.text,
          type: newPost.type,
          comments: [],
          postedby: newPost.postedby,
          group: group
        }
        MOCK_POSTS.push(newProperPost);
        return newProperPost;
      }
    )
  }
  
  upVotePost(id: number) {
    return true
  }
  
  downVotePost(id: number) {
    return true
  }
  
}
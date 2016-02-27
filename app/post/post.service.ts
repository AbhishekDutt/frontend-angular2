import {Post} from './post';
import {POSTS} from './mock-posts';
import {Injectable} from 'angular2/core';

@Injectable()
export class PostService {
  
  getPosts() {
    return Promise.resolve(POSTS);
  }
  
  // See the "Take it slow" appendix
  getPostsSlowly() {
    return new Promise<Post[]>(resolve =>
      setTimeout(()=>resolve(POSTS), 2000) // 2 seconds
    );
  }
  
  getPost(id: number) {
    return Promise.resolve(POSTS).then(
      posts => posts.filter(post => post.id === id)[0]
    );
  }

}

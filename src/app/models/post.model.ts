export interface Post {
  postId: string;
  postTitle: string;
  postContent: string;
  postImageUrl: string;
  postedById: string;
  postedBy: string;
  postedBySurname: string;
  postedByPhoto: string;
  postOrgId: string;
  postLikes: string[],
  postComments: string[],
  createdAt: number;
  editedBy: string;
}

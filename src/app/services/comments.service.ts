import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { LoadingController, PopoverController, ToastController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Comments } from '../models/comments';

@Injectable({
  providedIn: 'root'
})
export class CommentsService {
  commentCol: AngularFirestoreCollection<Comments>;
  commentDoc: AngularFirestoreDocument<Comments>;
  comments: Observable<Comments[]>;
  comment: Observable<Comments>;

  commentId = "";

  constructor(
    private afs: AngularFirestore,
    private loadingCtrl: LoadingController,
    private popOverCtrl: PopoverController,
    private toaster: ToastController
  )
  { }//

  getCommentId(comment) {
    this.commentId = comment;
    this.filterData();
  }

  filterData() {
    this.commentCol = this.afs.collection("comment", ref => ref.orderBy("createdAt", "desc").where("postId", "==", this.commentId));
    console.log("Post ID " + this.commentId);

    this.comments = this.commentCol.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Comments;
          data.commentId = a.payload.doc.id;
          return data;
        })
      })
    );
  }

  getComments() {
    return this.comments;
  }


  async addComment(commentId, userId, userName, userPhoto, postId, commentContent) {
    const loading = await this.loadingCtrl.create({
      message: 'Creating Comment',
      spinner: 'crescent',
      showBackdrop: true
    });

    loading.present();

    this.afs.collection('comment').doc(commentId).set({
      'commentId': commentId,
      'userId': userId,
      'userName': userName,
      'userPhoto': userPhoto,
      'postId': postId,
      'commentContent': commentContent,
      'createdAt': Date.now()
    }).then(() => {
      loading.dismiss();
      this.toast('New Comment Added', 'success');
    }).catch(error => {
      loading.dismiss();
      this.toast(error.message, 'danger');
    });
   }

   closePopOver(){
    this.popOverCtrl.dismiss();
  }//

  async deleteComment(commentId) {
    const loading = await this.loadingCtrl.create({
      message: `Deleting comment. Please Wait`,
      spinner: 'crescent',
      showBackdrop: true
    });

    loading.present();

    this.afs.collection('comment').doc(commentId).delete()
    .then(() => {
      loading.dismiss();
      this.toast('Delete successfully', 'success');
    }).catch(error => {
      loading.dismiss();
      this.toast(error.message, 'danger');
    });
   }

   async toast(message, status){
    const toast = await this.toaster.create({
      message: message,
      color: status,
      position: 'top',
      duration: 2000
    });

    toast.present();
  }//
}

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

  size = 0;

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
    this.commentCol = this.afs
    .collection("comment", ref => ref.orderBy("createdAt", "desc").where("postId", "==", this.commentId));

    this.commentCol.get().toPromise().then(snap => { //fix counting comments
      console.log(snap.size);
      this.size = snap.size;
      console.log("size: " + this.size);

    });
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

  getComment(commentId) {
    this.commentDoc = this.afs.doc<Comments>(`comment/${commentId}`);
    return this.comment = this.commentDoc.valueChanges();
  }

  getCommentCounter() {
    return this.size;
  }


  async addComment(commentId, userId, userName, userSurname, userPhoto, postId, commentContent) {
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
      'userSurname': userSurname,
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

  async updateComment(commentId, content) {
    const loading = await this.loadingCtrl.create({
      message: 'Updating comment',
      spinner: 'crescent',
      showBackdrop: true
    });

    loading.present();

    this.afs.collection('comment').doc(commentId).update({
      'commentContent': content,
      'editedAt': Date.now()
    }).then(() => {
      loading.dismiss();
      this.toast('Comment successfully updated', 'success');
    }).catch(error => {
      loading.dismiss();
      this.toast(error.message, 'danger');
    });
   }

   async flagComment(commentId, status, report, orgName, reportedBy) {
    const loading = await this.loadingCtrl.create({
      message: 'Reporting comment',
      spinner: 'crescent',
      showBackdrop: true
    });

    loading.present();

    this.afs.collection('comment').doc(commentId).update({
      'status': status,
      'report': report,
      'orgName': orgName,
      'reportedBy': reportedBy
    }).then(() => {
      loading.dismiss();
      this.toast('Comment successfully reported', 'success');
    }).catch(error => {
      loading.dismiss();
      this.toast(error.message, 'danger');
    });
   }

  async rejectReport(commentId) {
    const loading = await this.loadingCtrl.create({
      message: 'Wait',
      spinner: 'crescent',
      showBackdrop: true
    });

    loading.present();

    this.afs.collection('comment').doc(commentId).update({
      'status': "safe"
    }).then(() => {
      loading.dismiss();
      this.toast('Done', 'success');
    }).catch(error => {
      loading.dismiss();
      this.toast(error.message, 'danger');
    });
  }

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

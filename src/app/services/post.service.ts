import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { LoadingController, ModalController, PopoverController, ToastController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Post } from '../models/post.model';
import { NotificationsService } from './notifications.service';

import firebase from 'firebase/app';
import 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  postCol: AngularFirestoreCollection<Post>;
  postDoc: AngularFirestoreDocument<Post>;
  posts: Observable<Post[]>;
  post: Observable<Post>;

  post$: any;

  orgIds = "";

  constructor(
    private afs: AngularFirestore,
    private loadingCtrl: LoadingController,
    private popOverCtrl: PopoverController,
    private toaster: ToastController,
    private notifService: NotificationsService,
    private modalCtrl: ModalController
    ) {}//

  getOrgId(idParameter) {
    this.orgIds = idParameter;
    this.filterData();
  }

  filterData() {
    this.postCol = this.afs.collection("post", ref => ref.orderBy("createdAt", "desc").where("postOrgId", "==", this.orgIds));
    //this.postCol = this.afs.collection("post", ref => ref.where("postOrgId", "==", this.orgIds));

    console.log("Org ID " + this.orgIds);

    this.posts = this.postCol.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Post;
          data.postId = a.payload.doc.id;
          return data;
        })
      })
    );
  }

  getPosts() {
     return this.posts;
  }

  getPost(postId) {
    this.postDoc = this.afs.doc<Post>(`post/${postId}`);
    return this.post = this.postDoc.valueChanges();
  }

   async addPosts(postId, title, content, image, userId, userName, surname, userPhoto, orgId) {
    const loading = await this.loadingCtrl.create({
      message: 'Creating Post',
      spinner: 'crescent',
      showBackdrop: true
    });

    loading.present();

    this.afs.collection('post').doc(postId).set({
      'postId': postId,
      'postTitle': title,
      'postContent': content,
      'postImageUrl': image,
      'postLikes': [],
      'postComments': [],
      'postedById': userId,
      'postedBy': userName,
      'postedBySurname': surname,
      'postedByPhoto': userPhoto,
      'postOrgId': orgId,
      'createdAt': Date.now()
    }).then(() => {
      loading.dismiss();
      this.toast('New Post Added', 'success');
      this.notifService.sendNotif(userId, userName, surname, userPhoto, orgId, "added a post", image, postId, content, title, "", "", "", "");
      this.closeModal();
    }).catch(error => {
      loading.dismiss();
      this.toast(error.message, 'danger');
    });
   }

   async updatePosts(postId, title, content, image) {
    const loading = await this.loadingCtrl.create({
      message: 'Updating Post',
      spinner: 'crescent',
      showBackdrop: true
    });

    loading.present();

    this.afs.collection('post').doc(postId).update({
      'postTitle': title,
      'postContent': content,
      'postImageUrl': image,
      'editedAt': Date.now()
    }).then(() => {
      loading.dismiss();
      this.toast('Post successfully updated', 'success');
      this.closePopOver();
    }).catch(error => {
      loading.dismiss();
      this.toast(error.message, 'danger');
    });
   }

   //Update Post w/o Image
   async updatePostsText(postId, title, content) {
    const loading = await this.loadingCtrl.create({
      message: 'Updating Post',
      spinner: 'crescent',
      showBackdrop: true
    });

    loading.present();

    this.afs.collection('post').doc(postId).update({
      'postTitle': title,
      'postContent': content,
      'editedAt': Date.now()
    }).then(() => {
      loading.dismiss();
      this.toast('Post successfully updated', 'success');
      this.closePopOver();
    }).catch(error => {
      loading.dismiss();
      this.toast(error.message, 'danger');
    });
   }

   async editedBy(postId, editedBy) {
    this.afs.collection('post').doc(postId).update({
      'editedBy': "Edited by: " + editedBy,
      'editedAt': Date.now()
    }).then(() => {
      this.closePopOver();
    }).catch(error => {
      this.toast(error.message, 'danger');
    });
   }

   async deletePost(postId) {
    const loading = await this.loadingCtrl.create({
      message: `Deleting post. Please Wait`,
      spinner: 'crescent',
      showBackdrop: true
    });

    loading.present();

    this.deleteNotif(postId);

    this.afs.collection('post').doc(postId).delete()
    .then(() => {
      loading.dismiss();
      this.toast('Delete successfully', 'success');
    }).catch(error => {
      loading.dismiss();
      this.toast(error.message, 'danger');
    });
   }

   async deleteNotif(postId) {
    try {
      const batch = this.afs.firestore.batch();
      const notifRef = firebase.firestore()
        .collection('notification').doc(postId)
        batch.delete(notifRef);
        await batch.commit();
    } catch (error) {
      console.log(error);
    }

  }

   closePopOver(){
    this.popOverCtrl.dismiss();
  }//

  closeModal(){
    this.modalCtrl.dismiss();
  }//

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

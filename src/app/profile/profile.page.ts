import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { AlertController, PopoverController } from '@ionic/angular';
import { Observable, Subscription } from 'rxjs';
import firebase from 'firebase/app';
import 'firebase/auth';

import { AuthService } from '../services/auth.service';
import { UpdatePasswordComponent } from '../update-password/update-password.component';
import { UpdateProfileComponent } from '../update-profile/update-profile.component';
import { UpdatePostComponent } from '../posts/update-post/update-post.component';
import { PostService } from '../services/post.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit, OnDestroy {

  user: any;
  userPhoto: any;
  profileSub: Subscription;
  cUser: any;

  posts: Observable<any[]>;
  postsRef: AngularFirestoreCollection;

  constructor(private authService: AuthService,
              private popoverCtrl: PopoverController,
              private storage: AngularFireStorage,
              private afs: AngularFirestore,
              private alertCtrl: AlertController,
              private postService: PostService)
  {
    if (firebase.auth().currentUser !== null) {
      console.log('user id: ' + firebase.auth().currentUser.uid);
      this.cUser = firebase.auth().currentUser.uid;
    }

    this.postsRef = this.afs.collection('post', ref => ref.orderBy("createdAt", "desc").where("postedById", "==", this.cUser));
    this.posts = this.postsRef.valueChanges();

  }

  ngOnInit() {
    this.profileSub = this.authService.user$.subscribe(async user => {
      this.user = user;

      try {
        this.userPhoto = user.userPhoto;
      } catch (error) {
        console.log('No User Photo');
      }
    });
  }

  async updatePassword(ev: any){
    const popover = await this.popoverCtrl.create({
      component: UpdatePasswordComponent,
      event: ev,
      animated: true,
      showBackdrop: true,
      cssClass: 'contact-popover',
      mode: 'md'
    });
    return await popover.present();
  }

  async updateProfile(ev: any){
    const popover = await this.popoverCtrl.create({
      component: UpdateProfileComponent,
      event: ev,
      animated: true,
      showBackdrop: true,
      cssClass: 'contact-popover',
      mode: 'md'
    });
    return await popover.present();
  }

  async editPostForm(ev: any, postId) {

    const popover = await this.popoverCtrl.create({
      component: UpdatePostComponent,
      event: ev,
      animated: true,
      mode: 'md',
      cssClass: 'contact-popover',
      componentProps: {
        editPostId: postId
      }
    });
    return await popover.present();
  }//

  async deletePostForm(postid) {
    const alert = await this.alertCtrl.create({
      header: 'Confirm',
      message: 'Delete this post?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Confirm',
          handler: () => {
            console.log('Confirm Okay');
            this.postService.deletePost(postid);
          }
        }
      ]
    });

    await alert.present();
  }//

  ngOnDestroy(){
    if (this.profileSub) {
      this.profileSub.unsubscribe();
    }
  }



}

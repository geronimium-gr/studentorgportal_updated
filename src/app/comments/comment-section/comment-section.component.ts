import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AlertController, IonItemSliding, LoadingController, ModalController, NavParams, PopoverController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import firebase from 'firebase/app';
import 'firebase/auth';

import { Comments } from '../../models/comments';
import { AuthService } from '../../services/auth.service';
import { CommentsService } from '../../services/comments.service';
import { PostService } from '../../services/post.service';

@Component({
  selector: 'app-comment-section',
  templateUrl: './comment-section.component.html',
  styleUrls: ['./comment-section.component.scss'],
})
export class CommentSectionComponent implements OnInit, OnDestroy {

  commentSub: Subscription;
  loadedComment: any;
  loadedCommentDetails: any;
  commentCon: any;

  userId: any;
  user: any;
  userName: any;
  userPhoto: any;

  cUser: string;

  comments: Comments[];
  isLoading = false;

  constructor(public modalContoller: ModalController,
              private authService: AuthService,
              private navParams: NavParams,
              private postService: PostService,
              private loadingCtrl: LoadingController,
              private alertCtrl: AlertController,
              private commentService: CommentsService,
              private afs: AngularFirestore,
              private popoverCtrl: PopoverController) {

      if (firebase.auth().currentUser !== null) {
        console.log("user id: " + firebase.auth().currentUser.uid);
        this.cUser =  firebase.auth().currentUser.uid;
      }

      this.commentSub = this.authService.user$.subscribe(async user => {
        try {
          this.user = user;
          this.userName = user.userName;
          this.userId = user.userId;
          this.userPhoto = user.userPhoto;
        } catch (error) {
          console.log('No User Photo');
        }
      });//

      this.loadedComment = this.navParams.get('postIdComment');
      console.log(this.loadedComment);

      this.commentService.getCommentId(this.loadedComment);
    }

  ngOnInit() {
    this.isLoading = true;

    this.commentSub = this.commentService.getComments().subscribe(comment => {
      this.isLoading = false;
      this.comments = comment;
    });

  }

  ionViewWillEnter() {
    this.loadCommentDetails();
  }

  async loadCommentDetails() {
    const loading = await this.loadingCtrl.create({
      message: 'Loading...',
      spinner: 'crescent',
      showBackdrop: true
    });

    loading.present();

    this.commentSub = this.postService.getPost(this.loadedComment).subscribe(async comment => {

      try {
        this.loadedCommentDetails = comment;
        loading.dismiss();
      } catch (error) {
        console.log(error);
        loading.dismiss();
      }
    }, async error => {
      const alert = await this.alertCtrl.create({
        header: 'Error Occured!',
        message: 'Something went wrong. Try again.',
        buttons: [
          {
            text: 'Close',
            role: 'cancel',
            handler: () => {
              console.log("Close")
            }
          }
        ]
      });
      alert.present();
      // loading.dismiss();
    });
  }//

  addComment() {
    const commentId = this.afs.createId();
    this.commentService.addComment(commentId, this.userId, this.userName, this.userPhoto, this.loadedCommentDetails.postId, this.commentCon);
    this.commentCon = "";
  }

  async deleteComment(commentId: string, slidingComment: IonItemSliding) {
    const alert = await this.alertCtrl.create({
      header: 'Confirm!',
      message: 'Delete this comment?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
            slidingComment.close();
          }
        }, {
          text: 'Confirm',
          handler: () => {
            this.commentService.deleteComment(commentId);
            slidingComment.close();
          }
        }
      ]
    });

    await alert.present();
  }

  closeModal() {
    this.modalContoller.dismiss();
  }

  ngOnDestroy() {
    if (this.commentSub) {
      this.commentSub.unsubscribe();
    }
  }

}

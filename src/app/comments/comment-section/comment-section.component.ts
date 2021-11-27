import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { AlertController, IonItemSliding, LoadingController, ModalController, NavParams } from '@ionic/angular';
import { Observable, Subscription } from 'rxjs';
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
  commentCounter: any;

  loadedOrgName: any;

  userId: any;
  user: any;
  userName: any;
  userSurname: any;
  userPhoto: any;

  cUser: string;

  comments: Comments[];
  isLoading = false;

  commentRef: AngularFirestoreCollection;
  commentsList: Observable<any[]>;

  constructor(public modalContoller: ModalController,
              private authService: AuthService,
              public auth: AuthService,
              private navParams: NavParams,
              private postService: PostService,
              private loadingCtrl: LoadingController,
              private alertCtrl: AlertController,
              private commentService: CommentsService,
              private afs: AngularFirestore) {

      if (firebase.auth().currentUser !== null) {
        console.log("user id: " + firebase.auth().currentUser.uid);
        this.cUser =  firebase.auth().currentUser.uid;
      }

      this.commentSub = this.authService.user$.subscribe(async user => {
        try {
          this.user = user;
          this.userName = user.userName;
          this.userSurname = user.userSurname;
          this.userId = user.userId;
          this.userPhoto = user.userPhoto;
        } catch (error) {
          console.log('No User Photo');
        }
      });//

      this.loadedComment = this.navParams.get('postIdComment');
      this.loadedOrgName = this.navParams.get('orgNameProp');
      console.log(this.loadedComment + " " + this.loadedOrgName);

      this.commentService.getCommentId(this.loadedComment);
    }

  ngOnInit() {
    this.isLoading = true;

    this.commentSub = this.commentService.getComments().subscribe(comment => {
      this.isLoading = false;
      this.commentCounter = this.commentService.getCommentCounter();
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

  async addComment() {
    const loading = await this.loadingCtrl.create({
      message: 'Creating Comment',
      spinner: 'crescent',
      showBackdrop: true
    });

    loading.present();
    const commentId = this.afs.createId();
    this.commentService.addComment(commentId, this.userId, this.userName, this.userSurname, this.userPhoto, this.loadedCommentDetails.postId, this.commentCon);
    loading.dismiss();
    this.commentCon = "";
  }

  async updateComment(id, content) {
    const alert = await this.alertCtrl.create({
      header: 'Edit Comment',
      inputs: [
        {
          name: 'commentInput',
          id: 'paragraph',
          type: 'textarea',
          value: content,
          placeholder: 'Comment Content'
        }
      ],
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
          handler: contentCom => {
            if (contentCom.commentInput) {
              this.commentService.updateComment(id, contentCom.commentInput);
            } else {
              this.alertController("Input Required", "Enter Comment Content", "Try Again");
              return false;
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async flagComment(id) {
    const alert = await this.alertCtrl.create({
      cssClass: 'flag-alert',
      header: 'Report Comment',
      message: 'Why are you <strong>reporting</strong> this comment?',
      inputs: [
        {
          name: 'radio1',
          type: 'radio',
          label: 'It contains harassment or abuse.',
          value: 'It contains harassment or abuse.'
        },
        {
          name: 'radio2',
          type: 'radio',
          label: 'It\'s unfriendly or unkind.',
          value: 'It\'s unfriendly or unkind.'
        },
        {
          name: 'radio3',
          type: 'radio',
          label: 'This comment is not relevant to this post.',
          value: 'This comment is not relevant to this post.'
        },
        {
          name: 'radio4',
          type: 'radio',
          label: 'Something else.',
          value: 'smthg'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Ok',
          handler: (result) => {
            if (result == 'smthg') {
              console.log('Something else.');
              this.somethingElseInput(id, "danger", this.loadedOrgName, this.userName + " " + this.userSurname);
            } else {
              console.log(result);

              this.commentService.flagComment(id, "danger", result, this.loadedOrgName, this.userName + " " + this.userSurname);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async somethingElseInput(id, report, orgName, user) {
    const alert = await this.alertCtrl.create({
      header: 'Something else.',
      message: 'Try to be specific as possible.',
      inputs: [
        {
          name: 'reportInput',
          id: 'paragraph',
          type: 'textarea',
          placeholder: 'Type here...'
        }
      ],
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
          handler: contentCom => {
            if (contentCom.reportInput) {
              console.log(contentCom.reportInput);
              this.commentService.flagComment(id, report, contentCom.reportInput, orgName, user);
            } else {
              this.alertController("Input Required", "Enter Content", "Try Again");
              return false;
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async alertController(header, message, button){
    let alert = await this.alertCtrl.create({
      header: header,
      message: message,
      buttons: [ button ]
    });
    alert.present();
  }//

  async deleteComment(commentId: string) {
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
          }
        }, {
          text: 'Confirm',
          handler: () => {
            this.commentService.deleteComment(commentId);
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

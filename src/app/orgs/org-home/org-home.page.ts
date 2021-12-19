import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertController, LoadingController, ModalController, PopoverController, ToastController } from '@ionic/angular';
import { Observable, Subscription } from 'rxjs';
import firebase from 'firebase/app';
import 'firebase/auth';
import { AngularFireStorage } from '@angular/fire/storage';


import { AuthService } from '../../services/auth.service';
import { Organization } from '../../models/organization.model';
import { OrganizationService } from '../../services/organization.service';
import { UpdateOrgComponent } from '../update-org/update-org.component';
import { Post } from '../../models/post.model';
import { PostService } from '../../services/post.service';
import { AddPostComponent } from '../../posts/add-post/add-post.component';
import { AddEventsComponent } from '../../eventz/add-events/add-events.component';
import { FilestorageComponent } from '../../files-storage/filestorage/filestorage.component';
import { Eventz } from '../../models/eventz.model';
import { EventzService } from '../../services/eventz.service';
import { OptionButtonComponent } from '../../posts/option-button/option-button.component';
import { CommentSectionComponent } from '../../comments/comment-section/comment-section.component';
import { CommentsService } from '../../services/comments.service';
import { EventPendingComponent } from '../../event-pending/event-pending/event-pending.component';
import { ChatsComponent } from '../../chat/chats/chats.component';
import { NotificationComponent } from '../../notifs/notification/notification.component';
import { ViewportScroller } from '@angular/common';

@Component({
  selector: 'app-org-home',
  templateUrl: './org-home.page.html',
  styleUrls: ['./org-home.page.scss'],
})
export class OrgHomePage implements OnInit, OnDestroy {

  loadOrganization: Organization;
  orgId: any;

  userId: any;
  user: any;
  userName: any;
  userPhoto: any;

  commentCounter: any;

  cUser: string;

  orgName: any;
  orgDesc: any;
  orgType: any;

  orgSub: Subscription;

  segmentModel: string = "post";
  selectedSegmentModel: string;
  posts: Post[];
  loadedPost: Post;
  isLoading = false;

  //Public Post
  publicPosts: Observable<any[]>;
  postsRef: AngularFirestoreCollection;

  //reaction
  heartType: string = "heart-outline";

  //check this
  postTitle: any;
  postContent: any;

  postIds: any;

  eventsList: Eventz[];

  isReadMore = true;

  constructor(private orgService: OrganizationService,
    private afs: AngularFirestore,
    private loadingCtrl: LoadingController,
    private toaster: ToastController,
    private router: Router,
    private activateRoute: ActivatedRoute,
    private alertCtrl: AlertController,
    private authService: AuthService,
    public auth: AuthService,
    private storage: AngularFireStorage,
    private popoverCtrl: PopoverController,
    private postService: PostService,
    private modalCtrl: ModalController,
    private eventService: EventzService,
    private commentService: CommentsService,
    private viewportScroller: ViewportScroller) {

    if (firebase.auth().currentUser !== null) {
      console.log("user id: " + firebase.auth().currentUser.uid);
      this.cUser =  firebase.auth().currentUser.uid;
    }

    this.orgSub = this.authService.user$.subscribe(async user => {
      try {
        this.user = user;
        this.userName = user.userName;
        this.userId = user.userId;
        this.userPhoto = user.userPhoto;
      } catch (error) {
        console.log('No User Photo');
      }
    });//

    this.orgId = this.activateRoute.snapshot.params['orgID'];
    console.log(this.orgId);

    this.postService.getOrgId(this.orgId);
    this.eventService.getOrgId(this.orgId);


    this.postsRef = this.afs.collection("post", ref => ref.orderBy("createdAt", "desc").where("postOrgId", "==", "public"));
    this.publicPosts = this.postsRef.valueChanges();
  }//

  ngOnInit() {
    this.isLoading = true;

    this.orgSub = this.postService.getPosts().subscribe(posts => {
      this.isLoading = false;
      this.posts = posts;
    });

    this.orgSub = this.eventService.getEvents().subscribe(events => {
      this.isLoading = false;
      this.eventsList = events;
    });

    // this.commentCounter = this.commentService.getCommentCounter();
    // console.log(this.commentCounter);


    // this.postReference = this.afs.doc(`post/${this.postIds}`);
    // this.sub = this.postReference.valueChanges().subscribe(val => {
    //   this.heartType = val.likes.includes(this.userId) ? 'heart' : 'heart-outline';
    // });
  }

  showText() {
    this.isReadMore = !this.isReadMore;
  }

  ionViewWillEnter() {
    this.loadOrgDetails();
    const fragment: string = this.activateRoute.snapshot.fragment;
  }

  toggleHeart(postid) {
    this.postIds = postid;
    this.heartType = this.heartType == "heart" ? "heart-outline" : "heart";
  }

  async openChat() {
    const modal = await this.modalCtrl.create({
      component: ChatsComponent,
      componentProps: {
        orgId: this.orgId,
        orgName: this.orgName,
        orgPhoto: this.loadOrganization.imageUrl,
        userId: this.cUser,
        userInfo: this.user
      }
    });
    return await modal.present();
  }

  async openNotifs() {
    const modal = await this.modalCtrl.create({
      component: NotificationComponent,
      componentProps: {
        orgId: this.orgId,
        orgName: this.orgName,
        orgPhoto: this.loadOrganization.imageUrl,
        userId: this.cUser,
        userInfo: this.user
      }
    });
    return await modal.present();
  }

  async openCommentSection(postId) {
    const modal = await this.modalCtrl.create({
      component: CommentSectionComponent,
      componentProps: {
        postIdComment: postId,
        orgNameProp: this.orgName
      }
    });
    return await modal.present();
  }

  async openPendingEvents() {
    const modal = await this.modalCtrl.create({
      component: EventPendingComponent,
      componentProps: {
        orgId: this.orgId
      }
    });
    return await modal.present();
  }

  async loadOrgDetails() {
    const loading = await this.loadingCtrl.create({
      message: 'Loading...',
      spinner: 'crescent',
      showBackdrop: true
    });

    loading.present();

    this.orgSub = this.orgService.getOrganization(this.orgId).subscribe(async org => {

      try {
        this.loadOrganization = org;
        this.orgName = org.orgName;
        this.orgDesc = org.description;
        this.orgType = org.orgType;

        loading.dismiss();
      } catch (error) {
        this.router.navigate(['/page-not-found']);
        loading.dismiss();
      }
    }, async error => {
      const alert = await this.alertCtrl.create({
        header: 'Error Occured!',
        message: 'Something went wrong. Try again.',
        buttons: [
          {
            text: 'Back to User Page',
            handler: () => {
              this.router.navigate(['/home']);
            }
          }
        ]
      });
      alert.present();
      // loading.dismiss();
    });
  }//

  //Edit Organizations
  async editOrgForm(ev: any) {
    const popover = await this.popoverCtrl.create({
      component: UpdateOrgComponent,
      event: ev,
      animated: true,
      mode: 'md',
      cssClass: 'contact-popover',
      componentProps: {
        editOrgId: this.loadOrganization
      }
    });
    return await popover.present();
  }

  //Edit Post
  async editPost(ev: any, postId) {
    const popover = await this.popoverCtrl.create({
      component: OptionButtonComponent,
      event: ev,
      animated: true,
      mode: 'md',
      cssClass: 'option-popover',
      componentProps: {
        editPostId: postId,
        postInd: this.segmentModel,
        orgIds: this.orgId
      }
    });
    return await popover.present();
  }


  async deleteOrg() {
    const alert = await this.alertCtrl.create({
      header: 'Are you absolutely sure?',
      cssClass: 'deleteAlert',
      subHeader: 'Unexpected bad things will happen if you don’t read this!',
      message: `This action cannot be undone. This will permanently delete the
                organization <strong>${this.orgName}</strong>. <br> <br>
                Please type <strong>your password</strong> to confirm.`,
      inputs: [
        {
          name: 'orgNameText',
          type: 'password',
          placeholder: 'Type password here...',
          attributes: {
            minLength: 6,
            inputmode: 'decimal'
          }
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Delete the org',
          handler: async data => {
            const loading = await this.loadingCtrl.create({
              message: 'Wait...',
              spinner: 'crescent',
              showBackdrop: true
            });

            loading.present();

            const currentUser = firebase.auth().currentUser;

            const credentials = firebase.auth.EmailAuthProvider.credential(
              currentUser.email , data.orgNameText
            );

            currentUser.reauthenticateWithCredential(credentials)
              .then(success => {
                if (data.orgNameText.length < 6) {
                  loading.dismiss();
                  console.log('Fill Up Password');
                } else {
                  loading.dismiss();
                  console.log('Deleted.');
                  this.orgService.deleteOrganization(this.orgId, this.orgName);
                }
              },
              error => {
                console.log(error);
                if (error.code === "auth/wrong-password") {
                  loading.dismiss();
                  this.alertController('Wrong Password', error.message);
                } else {
                  loading.dismiss();
                  this.alertController('Wrong Password', error.message);
                }//if
              }).catch(error => {
                loading.dismiss();
                console.log(error);
              });
          }//async data
        }
      ]
    });

    await alert.present();
  }

  async openFileSystem() {
    const modal = await this.modalCtrl.create({
      component: FilestorageComponent,
      cssClass: 'my-custom-class',
      componentProps: {
        fileByOrgs: this.orgId,
        orgName: this.orgName,
        userId: this.cUser
      }
    });
    return await modal.present();
  }

  async alertController(header, message){
    let alert = await this.alertCtrl.create({
      header: header,
      message: message,
      buttons: [
        {
          text: 'OK',
          handler: () => {
            this.deleteOrg();
          }
        }
       ]
    });
    alert.present();
  }//

  // //Posts
  // async addPost() {
  //   if (!this.formGroup.valid) {
  //     console.log("Fill up.");
  //     return;
  //   }
  //   const postId = this.afs.createId();

  //   const title = this.formGroup.value.postTitle;
  //   const content = this.formGroup.value.postContent;
  //   const image = '';

  //   this.postService.addPosts(postId, title, content, image, this.userId, this.userName, this.userPhoto, this.loadOrganization.orgId);
  //   this.formGroup.reset();
  // }

  async addPost(ev: any) {
    const popover = await this.popoverCtrl.create({
      component: AddPostComponent,
      event: ev,
      animated: true,
      mode: 'md',
      cssClass: 'contact-popover',
      componentProps: {
        editOrgId: this.loadOrganization
      }
    });
    return await popover.present();
  }

  async addEvent(ev: any) {
    const popover = await this.popoverCtrl.create({
      component: AddEventsComponent,
      event: ev,
      animated: true,
      mode: 'md',
      cssClass: 'contact-popover',
      componentProps: {
        editOrgId: this.loadOrganization
      }
    });
    return await popover.present();
  }

  onSegmentChange() {
    if (this.segmentModel === 'post') {
      this.segmentModel = 'post';
      console.log(this.segmentModel);
    } else if (this.segmentModel === 'event') {
      this.segmentModel = 'event';
      console.log(this.segmentModel);
    }
  }

  ngOnDestroy() {
    if (this.orgSub) {
      this.orgSub.unsubscribe();
    }
  }

}

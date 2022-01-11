import { Component, OnDestroy, OnInit } from '@angular/core';
import { AlertController, IonItemSliding, LoadingController, ModalController, NavParams } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { MembershipService } from '../../services/membership.service';
import { OrganizationService } from '../../services/organization.service';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';

import firebase from 'firebase/app';
import 'firebase/firestore'

@Component({
  selector: 'app-members-list',
  templateUrl: './members-list.component.html',
  styleUrls: ['./members-list.component.scss'],
})
export class MembersListComponent implements OnInit, OnDestroy {

  segmentModel = "members";
  public userList: any[];
  public loadedUserList: any[];

  public memberList: string[];
  public memberInfo = [];

  memberSub: Subscription;
  isLoading = false;
  show = false;

  cUser: any;
  orgId: any;
  user: any

  constructor(public modalCtrl: ModalController,
              private userService: UserService,
              private navParams: NavParams,
              private memberService: MembershipService,
              private orgService: OrganizationService,
              private loadingCtrl: LoadingController,
              private alertCtrl: AlertController,
              private authService: AuthService,
              public auth: AuthService)

  {
    this.orgId = this.navParams.get("orgId");
    this.cUser = this.navParams.get("cUser");



  }

  ngOnInit() {
    this.isLoading = true;
    this.memberSub = this.userService.getUsers().subscribe(members => {
      this.userList = members;
    });
    this.isLoading = false;

    this.memberSub = this.authService.user$.subscribe(async users => {
      this.user = users;
    });

  }

  ionViewWillEnter() {
    this.loadMembers();
  }

    loadMembers() {

    this.memberSub = this.orgService.getOrganization(this.orgId).subscribe(org => {
      this.memberList = org.userList;
      this.memberInfo = [];

      this.memberList.forEach(uid => {
        const docRef = firebase.firestore().collection("user").doc(uid);

        docRef.get().then((doc) => {
            if (doc.exists) {
              if (!this.memberInfo.some(e => e.userId === doc.data().userId)) {
                this.memberInfo.push({
                 userId: doc.data().userId,
                 userName: doc.data().userName,
                 userSurname: doc.data().userSurname,
                 userPhoto: doc.data().userPhoto,
                 roleName: doc.data().roleName,
                 organizationId: doc.data().organizationId
               });
              }

              this.memberInfo.sort((a, b) => (a.userName > b.userName) ? 1 : -1);
            } else {
                // doc.data() will be undefined in this case
                console.log("No such document!");
            }
        }).catch((error) => {
            console.log("Error getting document:", error);
        });
      });//
    });

  }

  addMember(userId, sliding: IonItemSliding) {
    this.memberService.addUserInOrg(this.orgId, userId);
    sliding.close();
    //this.onClose();
  }

  onSegmentChange() {
    if (this.segmentModel === 'members') {
      this.segmentModel = 'members';
      console.log(this.segmentModel);
    } else if (this.segmentModel === 'add member') {
      this.segmentModel = 'add member';
      console.log(this.segmentModel);
    }
  }

  async removeMember(userId, sliding: IonItemSliding) {
    const alert = await this.alertCtrl.create({
      header: 'Confirm!',
      message: 'Remove member?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
            sliding.close();
          }
        }, {
          text: 'Confirm',
          handler: () => {
            console.log('Confirm Okay');
            this.memberService.removeUserInOrg(this.orgId, userId);
            sliding.close();
            this.onClose();
          }
        }
      ]
    });

    await alert.present();
  }

  onClose() {
    this.modalCtrl.dismiss();
  }

  ngOnDestroy(){
    if (this.memberSub) {
      this.memberSub.unsubscribe();
    }
  }


}

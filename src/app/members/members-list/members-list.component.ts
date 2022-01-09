import { Component, OnDestroy, OnInit } from '@angular/core';
import { AlertController, IonItemSliding, LoadingController, ModalController, NavParams } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { MembershipService } from 'src/app/services/membership.service';
import { OrganizationService } from 'src/app/services/organization.service';
import { UserService } from '../../services/user.service';

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

  cUser: any;
  orgId: any;

  constructor(public modalCtrl: ModalController,
              private userService: UserService,
              private navParams: NavParams,
              private memberService: MembershipService,
              private orgService: OrganizationService,
              private loadingCtrl: LoadingController,
              private alertCtrl: AlertController)

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
    
  }

  ionViewWillEnter() {
    this.loadMembers();
  }

   async loadMembers() {
    const loading = await this.loadingCtrl.create({
      message: 'Wait...',
      spinner: 'crescent',
      showBackdrop: true
    });

    loading.present();

    this.memberSub = this.orgService.getOrganization(this.orgId).subscribe(org => {
      this.memberList = org.userList;

      this.memberList.forEach(uid => {
        const docRef = firebase.firestore().collection("user").doc(uid);

        docRef.get().then((doc) => {
            if (doc.exists) {
               this.memberInfo.push({ 
                userId: doc.data().userId, 
                userName: doc.data().userName, 
                userSurname: doc.data().userSurname,
                userPhoto: doc.data().userPhoto,
                roleName: doc.data().roleName,
                organizationId: doc.data().organizationId
              });
              loading.dismiss();
            } else {
                // doc.data() will be undefined in this case
                console.log("No such document!");
                loading.dismiss();
            }
        }).catch((error) => {
            console.log("Error getting document:", error);
            loading.dismiss();
        });
      });//
    });
  }

  addMember(userId, sliding: IonItemSliding) {
    this.memberService.addUserInOrg(this.orgId, userId);
    sliding.close();
    this.onClose();
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

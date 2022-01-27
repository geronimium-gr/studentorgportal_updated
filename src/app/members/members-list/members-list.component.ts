import { Component, OnDestroy, OnInit } from '@angular/core';
import { AlertController, IonItemSliding, LoadingController, ModalController, NavParams, PopoverController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { MembershipService } from '../../services/membership.service';
import { OrganizationService } from '../../services/organization.service';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { EditMembersComponent } from '../edit-members/edit-members.component';

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
  public requestList: string[];

  //Member
  public memberInfo = [];
  public loadedMemberInfo = [];

  //Member Request
  public memberReqInfo = [];
  public loadedMemberReqInfo = [];

  //Org Type
  orgType: any;

  rowArray = [];

  memberSub: Subscription;
  isLoading = false;
  show = false;

  cUser: any;
  orgId: any;
  orgName: any;
  user: any;

  constructor(public modalCtrl: ModalController,
              private userService: UserService,
              private navParams: NavParams,
              private memberService: MembershipService,
              private orgService: OrganizationService,
              private loadingCtrl: LoadingController,
              private alertCtrl: AlertController,
              private authService: AuthService,
              public auth: AuthService,
              private popOverCtrl: PopoverController)

  {
    this.orgId = this.navParams.get("orgId");
    this.cUser = this.navParams.get("cUser");
    this.orgName = this.navParams.get("orgName");
    this.orgType = this.navParams.get("orgType");
  }

  ngOnInit() {
    this.isLoading = true;
    this.memberSub = this.userService.getUsers().subscribe(members => {
      this.userList = members;
      this.loadedUserList = members;
    });
    this.isLoading = false;

    this.memberSub = this.authService.user$.subscribe(async users => {
      this.user = users;
    });

  }

  initializeItems() {
    this.memberInfo = this.loadedMemberInfo;
    this.userList = this.loadedUserList;
  }

  ionViewWillEnter() {
    this.loadMembers();
    this.loadMemberRequest();
  }

    loadMemberRequest() {
      this.memberSub = this.orgService.getOrganization(this.orgId).subscribe(org => {
        this.requestList = org.pendingMembers;

        this.memberReqInfo = [];
        this.loadedMemberReqInfo = [];

        this.requestList.forEach(uid => {
          const docRef = firebase.firestore().collection("user").doc(uid);

          docRef.get().then((doc) => {
              if (doc.exists) {
                if (!this.memberReqInfo.some(e => e.userId === doc.data().userId)) {
                  this.memberReqInfo.push({
                   userId: doc.data().userId,
                   userName: doc.data().userName,
                   userSurname: doc.data().userSurname,
                   userPhoto: doc.data().userPhoto,
                   roleName: doc.data().roleName,
                   organizationId: doc.data().organizationId,
                   userEmail: doc.data().userEmail,
                   userSchoolId: doc.data().userSchoolId
                 });
                }

                if (!this.loadedMemberReqInfo.some(e => e.userId === doc.data().userId)) {
                  this.loadedMemberReqInfo.push({
                    userId: doc.data().userId,
                    userName: doc.data().userName,
                    userSurname: doc.data().userSurname,
                    userPhoto: doc.data().userPhoto,
                    roleName: doc.data().roleName,
                    organizationId: doc.data().organizationId,
                    userEmail: doc.data().userEmail,
                    userSchoolId: doc.data().userSchoolId
                  });
                }

                this.memberReqInfo.sort((a, b) => (a.userName > b.userName) ? 1 : -1);
                this.loadedMemberReqInfo.sort((a, b) => (a.userName > b.userName) ? 1 : -1);
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

    loadMembers() {

    this.memberSub = this.orgService.getOrganization(this.orgId).subscribe(org => {
      this.memberList = org.userList;

      this.memberInfo = [];
      this.loadedMemberInfo = [];

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
                 organizationId: doc.data().organizationId,
                 userEmail: doc.data().userEmail,
                 userSchoolId: doc.data().userSchoolId
               });
              }

              if (!this.loadedMemberInfo.some(e => e.userId === doc.data().userId)) {
                this.loadedMemberInfo.push({
                  userId: doc.data().userId,
                  userName: doc.data().userName,
                  userSurname: doc.data().userSurname,
                  userPhoto: doc.data().userPhoto,
                  roleName: doc.data().roleName,
                  organizationId: doc.data().organizationId,
                  userEmail: doc.data().userEmail,
                  userSchoolId: doc.data().userSchoolId
                });
              }

              this.memberInfo.sort((a, b) => (a.userName > b.userName) ? 1 : -1);
              this.loadedMemberInfo.sort((a, b) => (a.userName > b.userName) ? 1 : -1);
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
      header: 'Confirm',
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

  async editMember(ev, userId, sliding: IonItemSliding) {
    const popOver = await this.popOverCtrl.create({
      component: EditMembersComponent,
      event: ev,
      animated: true,
      showBackdrop: true,
      cssClass: 'contact-popover',
      mode: 'md',
      componentProps: {
        userId: userId
      }
    });
    sliding.close();
    return await popOver.present();
  }

  filterListMembers(evt) {
    this.initializeItems();

    const searchTerm = evt.srcElement.value;

    if (!searchTerm) {
      return;
    }

    this.memberInfo = this.memberInfo.filter(currentItem => {
      if (currentItem.userName.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1 || currentItem.userSurname.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1) {
        return true;
      }
      return false;
    })
  }

  filterListUsers(evt) {
    this.initializeItems();

    const searchTerm = evt.srcElement.value;

    if (!searchTerm) {
      return;
    }

    this.userList = this.userList.filter(currentItem => {
      if (currentItem.userName.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1 || currentItem.userSurname.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1) {
        return true;
      }
      return false;
    })
  }

  exportCSV() {
    //Author: Christian Ching
    this.rowArray.push(["Surname","Firstname", "SchoolID", "Email"]);

    this.memberInfo.sort((a, b) => (a.userSurname > b.userSurname) ? 1 : -1);

    this.memberInfo.forEach((u) => {
      this.rowArray.push([u.userSurname, u.userName, u.userSchoolId, u.userEmail]);
    });

    const csvData = this.rowArray.map((r) => r.join(",")).join("\n");
    const csvContent = "data:text/csv;charset=utf-8," + csvData;

    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${this.orgName}_${ new Date().getTime() }.csv`);
    document.body.appendChild(link);

    link.click();
  }

  acceptUser(userId) {
    this.memberService.addUserInOrg(this.orgId, userId);
  }

  rejectUser(userId) {
    this.memberService.cancelJoinOrganization(this.orgId, userId);
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

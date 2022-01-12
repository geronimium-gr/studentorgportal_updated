import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { AlertController, LoadingController, NavParams, PopoverController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-edit-members',
  templateUrl: './edit-members.component.html',
  styleUrls: ['./edit-members.component.scss'],
})
export class EditMembersComponent implements OnInit, OnDestroy {
  customActionSheetOptions: any = {
    header: 'Update Role',
    subHeader: 'Select role'
  };

  selectRole: any;
  user: any;
  authUser: any;
  userId: any;
  editMemberSub: Subscription;

  roleMod: boolean = false;
  roleOfficer: boolean = false;
  roleStudent: boolean = false;

  roleHolder = "";

  constructor(private popOverCtrl: PopoverController,
              private loadingCtrl: LoadingController,
              private userService: UserService,
              private alertCtrl: AlertController,
              private navParams: NavParams,
              private router: Router,
              private afs: AngularFirestore,
              private toaster: ToastController,
              private authService: AuthService,
              public auth: AuthService) 
  { 
    this.userId = this.navParams.get('userId');
  }

  ngOnInit() {
    this.editMemberSub = this.authService.user$.subscribe(async users => {
      this.authUser = users;
    });
  }

  ionViewWillEnter() {
    this.loadUserDetails();
  }

  async loadUserDetails(){
    const loading = await this.loadingCtrl.create({
      message: 'Loading...',
      spinner: 'crescent',
      showBackdrop: true
    });

    loading.present();

    this.editMemberSub = this.userService.getUser(this.userId).subscribe(async user => {

      try {
        this.user = user;
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
              this.router.navigate(['/users']);
            }
          }
        ]
      });
      alert.present();
      loading.dismiss();
    });
  }//

  async updateRole() {
    const loading = await this.loadingCtrl.create({
      message: 'Updating...',
      spinner: 'crescent',
      showBackdrop: true
    });

    loading.present(); //profile or edit

    if (this.selectRole === "Moderator") {
      this.roleMod = true;
      this.roleHolder = "Moderator";
      console.log("Hello Mod");
    } else if (this.selectRole === "Student Officer") {
      this.roleOfficer = true;
      this.roleHolder = "Student Officer";
      console.log("Hello Officer");
    } else if (this.selectRole === "Student") {
      this.roleStudent = true;
      this.roleHolder = "Student";
      console.log("Hello Student");
    }

    this.afs.collection('user').doc(this.userId).update({
      'role' : {
        'moderator': this.roleMod,
        'officer': this.roleOfficer,
        'student': this.roleStudent
      },
      'roleName': this.roleHolder,
      'editedAt': Date.now()
    })
    .then(() => {
      loading.dismiss();
      this.toast('Update Success', 'success');
      this.onClose();
    })
    .catch(error => {
      loading.dismiss();
      this.toast(error.message, 'danger');
    })

  }

  async toast(message, status){
    const toast = await this.toaster.create({
      message: message,
      color: status,
      position: 'top',
      duration: 2000
    });

    toast.present();
  }

  onClose() {
    this.popOverCtrl.dismiss();
  }

  ngOnDestroy(){
    if (this.editMemberSub) {
      this.editMemberSub.unsubscribe();
    }
  }

}

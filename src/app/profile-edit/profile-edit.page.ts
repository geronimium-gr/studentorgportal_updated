import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { UserService } from '../services/user.service';

@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.page.html',
  styleUrls: ['./profile-edit.page.scss'],
})
export class ProfileEditPage implements OnInit, OnDestroy {

  userId: string;
  fname: string;
  studentId: string;
  sname: string;
  birthday: any;

  roleAdmin: boolean = false;
  roleMod: boolean = false;
  roleOfficer: boolean = false;
  roleStudent: boolean = false;

  roleHolder = "";

  userRole: any;
  selectRole: any;

  profileEditSub: Subscription;

  //EDITING PROFILE - ADMIN VIEW


  constructor(private userService: UserService,
              private afs: AngularFirestore,
              private loadingCtrl: LoadingController,
              private toaster: ToastController,
              private router: Router,
              private activateRoute: ActivatedRoute,
              private alertCtrl: AlertController) { }

  ngOnInit() {
    this.userId = this.activateRoute.snapshot.params['userID'];
  }

  ionViewWillEnter(){
    this.loadUserDetails();
  }

  async loadUserDetails(){
    const loading = await this.loadingCtrl.create({
      message: 'Loading...',
      spinner: 'crescent',
      showBackdrop: true
    });

    loading.present();

    this.profileEditSub = this.userService.getUser(this.userId).subscribe(async user => {

      try {
        this.userRole = user.roleName;
        this.fname = user.userName;
        this.studentId = user.userSchoolId;
        this.sname = user.userSurname;
        this.birthday = user.birthday;
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

  updateRole(role){
    //console.log(role);
    console.log(this.selectRole + role);
  }

  onSubmit(form: NgForm){
    if (!form.valid) {
      return;
    }

    const user = form.value.fname;
    const studentId = form.value.studentId;
    const surname = form.value.sname;
    const bday = form.value.birthdate;

    this.onUpdateUser(user, studentId, surname, bday);
  }//

  async onUpdateUser(name: string, studentNo: string, surname: string, bday: any){
    const loading = await this.loadingCtrl.create({
      message: 'Updating...',
      spinner: 'crescent',
      showBackdrop: true
    });

    loading.present(); //profile or edit

    if (this.selectRole === "Admin") {
      this.roleAdmin = true;
      this.roleHolder = "Admin";
      console.log("Hello Admin");
    } else if (this.selectRole === "Moderator") {
      this.roleMod = true;
      this.roleHolder = "Moderator";
      console.log("Hello Mod");
    } else if (this.selectRole === "Officer") {
      this.roleOfficer = true;
      this.roleHolder = "Student Officer";
      console.log("Hello Officer");
    } else if (this.selectRole === "Student") {
      this.roleStudent = true;
      this.roleHolder = "Student";
      console.log("Hello Student");
    }

    this.afs.collection('user').doc(this.userId).update({
      'userName': name,
      'userSchoolId': studentNo,
      'userSurname': surname,
      'birthday': bday,
      'role' : {
        'admin': this.roleAdmin,
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
      this.router.navigate(['/users']);
    })
    .catch(error => {
      loading.dismiss();
      this.toast(error.message, 'danger');
    })


  }//


  async toast(message, status){
    const toast = await this.toaster.create({
      message: message,
      color: status,
      position: 'top',
      duration: 2000
    });

    toast.present();
  }

  ngOnDestroy(){
    if (this.profileEditSub) {
      this.profileEditSub.unsubscribe();
    }
  }
}

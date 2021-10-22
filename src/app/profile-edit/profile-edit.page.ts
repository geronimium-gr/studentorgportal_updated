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

    this.onUpdateUser(user, studentId);
  }//

  async onUpdateUser(name: string, studentNo: string){
    const loading = await this.loadingCtrl.create({
      message: 'Updating...',
      spinner: 'crescent',
      showBackdrop: true
    });

    loading.present(); //profile or edit

    if (this.selectRole === "Admin") {
      this.afs.collection('user').doc(this.userId).update({
        'userName': name,
        'userSchoolId': studentNo, 
        'role' : {
          'admin': true,
          'moderator': false,
          'officer': false,
          'student': false
        },
        'roleName': this.selectRole,
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
    } else if (this.selectRole === "Moderator") {
      this.afs.collection('user').doc(this.userId).update({
        'userName': name,
        'userSchoolId': studentNo,
        'role' : {
          'admin': false,
          'moderator': true,
          'officer': false,
          'student': false
        },
        'roleName': this.selectRole,
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
    } else if (this.selectRole === "Student Officer") {
      this.afs.collection('user').doc(this.userId).update({
        'userName': name,
        'userSchoolId': studentNo,
        'role' : {
          'admin': false,
          'moderator': false,
          'officer': true,
          'student': false
        },
        'roleName': this.selectRole,
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
    } else if (this.selectRole === "Student") {
      this.afs.collection('user').doc(this.userId).update({
        'userName': name,
        'userSchoolId': studentNo,
        'role' : {
          'admin': false,
          'moderator': false,
          'officer': false,
          'student': true
        },
        'roleName': this.selectRole,
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
    }
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

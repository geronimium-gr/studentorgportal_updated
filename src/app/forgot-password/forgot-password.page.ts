import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {

  email: string;

  constructor(private afAuth: AngularFireAuth,
              private toaster: ToastController,
              private router: Router,
              private loadingCtrl: LoadingController) { }

  ngOnInit() {
  }

  async resetPassword(){
    if (this.email) {
      const loading = await this.loadingCtrl.create({
        message: 'Sending Password Reset Link',
        spinner: 'crescent',
        showBackdrop: true
      });
      loading.present();

      this.afAuth.sendPasswordResetEmail(this.email)
      .then(() => {
        loading.dismiss();
        this.toast('Success, check your email.', 'success');
        this.router.navigate(['/login']);
      })
      .catch((error) => {
        loading.dismiss();
        this.toast(error.message, 'danger');
      })
    } else {
      this.toast('Enter your email.', 'warning');
    }
  }

  async toast(message, status){
    const toast = await this.toaster.create({
      message: message,
      color: status,
      position: 'top',
      duration: 2000
    });

    toast.present();
  } // end of toast

}

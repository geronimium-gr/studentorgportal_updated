import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AuditTrailService } from '../services/audit-trail.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit, OnDestroy {

  showPassword = false;
  passwordToggleIcon = 'eye';

  userId: any;
  userName: any;
  userSurname: any;
  userEmail: any;
  userSchoolId: any;

  loginSub: Subscription;

  constructor(private toaster: ToastController,
              private authService: AuthService,
              private auditService: AuditTrailService)
  { }

  ngOnInit() {
  }

  //Author: https://youtu.be/oIcgaAV8FIk
  togglePassword(){
    this.showPassword = !this.showPassword;

    if (this.passwordToggleIcon == 'eye') {
      this.passwordToggleIcon = 'eye-off';
    } else {
      this.passwordToggleIcon = 'eye';
    }
  }// end of TogglePassword

  login(email: string, password: string){
    this.authService.signIn(email, password).then(() => {

      // this.loginSub = this.authService.user$.subscribe(async user => {
      //   try {
      //     this.userId = user.userId;
      //     this.userName = user.userName;
      //     this.userSurname = user.userSurname;
      //     this.userEmail = user.userEmail;
      //     this.userSchoolId = user.userSchoolId;
      //   } catch (error) {
      //     console.log('No User Photo');
      //   }
      // });
      // console.log(this.userName);

      // this.auditService.addAuditRecord(this.userId, this.userName, this.userSurname, this.userEmail, this.userSchoolId, "Login");
    });
  } //end of login

  async toast(message, status){
    const toast = await this.toaster.create({
      message: message,
      color: status,
      position: 'top',
      duration: 2000
    });

    toast.present();
  } // end of toast

  onSubmit(form: NgForm){
    if (!form.valid) {
      return;
    }

    const email = form.value.email;
    const pass = form.value.password;

    this.login(email, pass);
    form.reset();
  }// end of submit

  ngOnDestroy() {
    if (this.loginSub) {
      this.loginSub.unsubscribe();
    }
  }

}

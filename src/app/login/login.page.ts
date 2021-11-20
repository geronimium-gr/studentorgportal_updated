import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { NgForm } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AuditTrailService } from '../services/audit-trail.service';
import { AuthService } from '../services/auth.service';

import { Observable, Observer, fromEvent, merge } from 'rxjs';
import { map } from 'rxjs/operators';


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

  emailAdd = "";
  userInfo: any;

  loginSub: Subscription;
  connectionMsg: boolean;

  constructor(private toaster: ToastController,
              private authService: AuthService,
              private auditService: AuditTrailService,
              private afs: AngularFirestore)
  {
    this.createOnline$().subscribe(isOnline => {
      console.log(isOnline);
      if (isOnline == true) {
        this.connectionMsg = true;
      } else {
        this.connectionMsg = false;
      }
      console.log("Msg: " + this.connectionMsg);
    })
  }

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

  async login(email: string, password: string){
    this.authService.signIn(email, password);
  } //end of login

  createOnline$() {
    return merge<boolean>(
      fromEvent(window, 'offline').pipe(map(() => false)),
      fromEvent(window, 'online').pipe(map(() => true)),
      new Observable((sub: Observer<boolean>) => {
        sub.next(navigator.onLine);
        sub.complete();
      })
    );
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

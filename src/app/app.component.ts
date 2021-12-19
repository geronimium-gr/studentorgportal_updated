import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { AlertController, MenuController, ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { FlagsModuleComponent } from './flags/flags-module/flags-module.component';
import { AuditTrailService } from './services/audit-trail.service';
import { AuthService } from './services/auth.service';

import { Observable, Observer, fromEvent, merge } from 'rxjs';
import { map } from 'rxjs/operators';

const themes = {
  autumn: {
    primary: '#F78154',
    secondary: '#4D9078',
    tertiary: '#B4436C',
    light: '#FDE8DF',
    medium: '#FCD0A2',
    dark: '#B89876'
  },
  night: {
    primary: '#8CBA80',
    secondary: '#FCFF6C',
    tertiary: '#FE5F55',
    light: '#495867',
    medium: '#BCC2C7',
    dark: '#F7F7FF'
  }
};


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy{

  user: any;
  userId: any;
  userPhoto: any;
  appSub: Subscription;
  access: boolean;

  connectionMsg: boolean;

  // userRef;
  // user$;

  constructor(public authService: AuthService,
              private router: Router,
              private menu: MenuController,
              private alertController: AlertController,
              private auditService: AuditTrailService,
              private afs: AngularFirestore,
              private modalCtrl: ModalController) {

    this.appSub = this.authService.user$.subscribe(async user => {
      this.user = user;
      //this.userId = user.userId;

      try {
        this.userPhoto = user.userPhoto;
      } catch (error) {
        console.log('No User Photo');
      }
    });

    this.createOnline$().subscribe(isOnline => {
      console.log(isOnline);
      if (isOnline == true) {
        console.log("connection restored");
      } else {
        console.log("connection failed");

        let text = "Please check your connection.\nTry to reload the page.";

        if (confirm(text) == true) {
          window.location.reload();
        } else {
          window.location.reload();
        }
      }
    });
  }

  ngOnInit(){
    // this.afs.collection('user').doc(this.userId);
    // this.user$ = this.userRef.valueChanges();

  }

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

  enterUserList(){
    if (this.authService.canEdit(this.user)) {
      this.router.navigateByUrl('/users');
    } else {
      console.log("Access Denied");
    }

  }

  enterAuditTrail(){
    if (this.authService.canEdit(this.user)) {
      this.router.navigateByUrl('/audit-trail');
    } else {
      console.log("Access Denied");
    }

  }

  viewProfile() {
    this.router.navigateByUrl('/profile');
    this.menu.close();
  }

  async openFlags() {
    const modal = await this.modalCtrl.create({
      component: FlagsModuleComponent
    });
    return await modal.present();
  }

  onLogout(){
    this.auditService.addAuditRecord(this.user.userId, this.user.userName, this.user.userSurname, this.user.userEmail, this.user.userSchoolId, "Logout");
  }

  async reloadPage() {
    const alert = await this.alertController.create({
      header: 'Connection Lost',
      message: 'Try to <strong>reload</strong> the page.',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Reload',
          handler: () => {
            window.location.reload();
          }
        }
      ]
    });

    await alert.present();
  }


  ngOnDestroy(){
    if (this.appSub) {
      this.appSub.unsubscribe();
    }
  }

}

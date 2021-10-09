import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AuthService } from './services/auth.service';

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

  // userRef;
  // user$;

  constructor(public authService: AuthService,
              private router: Router,
              private menu: MenuController,
              private storage: AngularFireStorage) {

    this.appSub = this.authService.user$.subscribe(async user => {
      this.user = user;
      //this.userId = user.userId;
      try {
        this.userPhoto = user.userPhoto;
      } catch (error) {
        console.log('No User Photo');
      }
    });

  }

  ngOnInit(){
    // this.afs.collection('user').doc(this.userId);
    // this.user$ = this.userRef.valueChanges();
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

  changeTheme(){

  }

  viewProfile() {
    this.router.navigateByUrl('/profile');
    this.menu.close();
  }

  onLogout(){
    this.authService.signOut();
  }

  ngOnDestroy(){
    if (this.appSub) {
      this.appSub.unsubscribe();
    }
  }

}

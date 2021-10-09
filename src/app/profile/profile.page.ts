import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { PopoverController } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { UpdatePasswordComponent } from '../update-password/update-password.component';
import { UpdateProfileComponent } from '../update-profile/update-profile.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit, OnDestroy {

  user: any;
  userPhoto: any;
  profileSub: Subscription;

  constructor(private authService: AuthService,
              private popoverCtrl: PopoverController,
              private storage: AngularFireStorage) { }

  ngOnInit() {
    this.profileSub = this.authService.user$.subscribe(async user => {
      this.user = user;

      try {
        this.userPhoto = user.userPhoto;
      } catch (error) {
        console.log('No User Photo');
      }

    });
  }

  async updatePassword(ev: any){
    const popover = await this.popoverCtrl.create({
      component: UpdatePasswordComponent,
      event: ev,
      animated: true,
      showBackdrop: true,
      cssClass: 'contact-popover',
      mode: 'md'
    });
    return await popover.present();
  }

  async updateProfile(ev: any){
    const popover = await this.popoverCtrl.create({
      component: UpdateProfileComponent,
      event: ev,
      animated: true,
      showBackdrop: true,
      cssClass: 'contact-popover',
      mode: 'md'
    });
    return await popover.present();
  }

  ngOnDestroy(){
    if (this.profileSub) {
      this.profileSub.unsubscribe();
    }
  }



}

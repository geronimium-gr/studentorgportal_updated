import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { IonItemSliding, LoadingController, MenuController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { User } from '../models/user';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.page.html',
  styleUrls: ['./user-list.page.scss'],
})
export class UserListPage implements OnInit, OnDestroy {

  userList: User[];
  userSub: Subscription;

  userPhoto: any;

  isLoading = false;

  constructor(private userService: UserService,
              private router: Router,
              private loadingCtrl: LoadingController,
              private toaster: ToastController,
              private afs: AngularFirestore,
              private menu: MenuController) { }

  ngOnInit() {
    this.isLoading = true;
    this.userSub = this.userService.getUsers().subscribe(users => {
      this.userList = users;
      this.isLoading = false;
    });
  }

  editUser(memberid: string, sliding: IonItemSliding){
    this.router.navigate(['/users/edit/', memberid]);
    sliding.close();
  }//

  async deleteUser(memberid: string, sliding: IonItemSliding){
    const loading = await this.loadingCtrl.create({
      message: 'Deleting User...',
      spinner: 'crescent',
      showBackdrop: true
    });

    loading.present();

    this.afs.collection('user').doc(memberid).delete()
      .then(() => {
        loading.dismiss();
        this.toast('User Deleted', 'warning')
      })
      .catch((error) => {
        loading.dismiss();
        this.toast(error.message, 'danger')
      });
    sliding.close();
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

  openFirst(){
    this.menu.enable(true, 'm1');
  }

  openAddUser() {

  }

  ngOnDestroy(){
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }

}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { AlertController, IonItemSliding, LoadingController, MenuController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { User } from '../models/user';
import { UserService } from '../services/user.service';

import firebase from 'firebase/app';
import 'firebase/auth';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.page.html',
  styleUrls: ['./user-list.page.scss']
})
export class UserListPage implements OnInit, OnDestroy {

  userList: User[];
  userSub: Subscription;

  userPhoto: any;

  searchValue: string = "";
  results: any;
  hideList: boolean = false;

  selectCategory = "userName";

  cUser: any;

  isLoading = false;

  public resultList: any[];
  public loadedResultList: any[];

  constructor(private userService: UserService,
              private router: Router,
              private loadingCtrl: LoadingController,
              private toaster: ToastController,
              private afs: AngularFirestore,
              private menu: MenuController,
              private alertCtrl: AlertController
              )
  {
    if (firebase.auth().currentUser !== null) {
      console.log('user id: ' + firebase.auth().currentUser.uid);
      this.cUser = firebase.auth().currentUser.uid;
    }
  }

  ngOnInit() {
    this.isLoading = true;
    this.afs.collection('user', ref => ref.orderBy('createdAt', 'desc')).valueChanges().subscribe(results => {
      this.resultList = results;
      this.loadedResultList = results;

      this.isLoading = false;
    });
  }

  initializeItems() {
    this.resultList = this.loadedResultList;
  }

  editUser(memberid: string, sliding: IonItemSliding){
    this.router.navigate(['/users/edit/', memberid]);
    sliding.close();
  }//

  async deleteUser(memberid: string, sliding: IonItemSliding){
    const loading = await this.loadingCtrl.create({
      message: 'Deleting User Access...',
      spinner: 'crescent',
      showBackdrop: true
    });

    loading.present();

    this.afs.collection('user').doc(memberid).delete()
      .then(() => {
        loading.dismiss();
        this.toast('User Access Deleted', 'warning')
      })
      .catch((error) => {
        loading.dismiss();
        this.toast(error.message, 'danger')
      });
    sliding.close();
  }//

  async deleteUserAlert(memberid: string, sliding: IonItemSliding) {
    const alert = await this.alertCtrl.create({
      header: 'Confirm!',
      message: 'Remove user access?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Confirm',
          handler: () => {
            console.log('Confirm Okay');
            this.deleteUser(memberid, sliding);
          }
        }
      ]
    });

    await alert.present();
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

  openFirst(){
    this.menu.enable(true, 'm1');
  }

  // search() {
  //   let self = this;

  //   self.results = self.afs.collection('user', ref => ref
  //     .orderBy(this.selectCategory)
  //     .startAt(self.searchValue)
  //     .endAt(self.searchValue + "\uf8ff"))
  //     .valueChanges();
  // }

  //Source: https://youtu.be/VyGymr3WWEQ
  filterList(evt) {
    this.initializeItems();

    const searchTerm = evt.srcElement.value;

    if (!searchTerm) {
      return;
    }

    this.resultList = this.resultList.filter(currentItem => {
      if (this.selectCategory === "userName") {
        if (currentItem.userName && searchTerm) {
          if (currentItem.userName.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1) {
            return true;
          }
          return false;
        }//
      } else if (this.selectCategory === "userSurname") {
        if (currentItem.userSurname && searchTerm) {
          if (currentItem.userSurname.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1) {
            return true;
          }
          return false;
        }//
      } else if (this.selectCategory === "userSchoolId") {
        if (currentItem.userSchoolId && searchTerm) {
          if (currentItem.userSchoolId.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1) {
            return true;
          }
          return false;
        }//
      } else if (this.selectCategory === "roleName") {
        if (currentItem.roleName && searchTerm) {
          if (currentItem.roleName.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1) {
            return true;
          }
          return false;
        }//
      } else if (this.selectCategory === "userEmail") {
        if (currentItem.userEmail && searchTerm) {
          if (currentItem.userEmail.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1) {
            return true;
          }
          return false;
        }//
      } else if (this.selectCategory === "course") {
        if (currentItem.course && searchTerm) {
          if (currentItem.course.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1) {
            return true;
          }
          return false;
        }//
      }
    });
  }

  ngOnDestroy(){
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }

}

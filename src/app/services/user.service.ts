import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  AngularFirestoreDocument,
} from '@angular/fire/firestore';
import {
  LoadingController,
  PopoverController,
  ToastController,
} from '@ionic/angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore'

import { User } from '../models/user';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  userCol: AngularFirestoreCollection<User>;
  userDoc: AngularFirestoreDocument<User>;
  users: Observable<User[]>;
  user: Observable<User>;

  user$: any;

  cUser: string;

  constructor(
    private afs: AngularFirestore,
    private loadingCtrl: LoadingController,
    private popOverCtrl: PopoverController,
    private toaster: ToastController
  ) {
    if (firebase.auth().currentUser !== null) {
      console.log('user id: ' + firebase.auth().currentUser.uid);
      this.cUser = firebase.auth().currentUser.uid;
    }
    //this.userCol = this.afs.collection('user', ref => ref.orderBy('createdAt'));
    this.userCol = this.afs.collection('user', (ref) =>
      ref
        // .where('userId', '!=', this.cUser)
        // .orderBy('userId')
        .orderBy('createdAt', 'desc')
    );

    this.users = this.userCol.snapshotChanges().pipe(
      map((action) => {
        return action.map((a) => {
          const data = a.payload.doc.data() as User;
          data.userId = a.payload.doc.id;
          return data;
        });
      })
    );
  } //

  getUsers() {
    return this.users;
  } //

  getUser(userId) {
    this.userDoc = this.afs.doc<User>(`user/${userId}`);
    return (this.user = this.userDoc.valueChanges());
  } //

  async updateUser(userid, name, bio, image) {
    const loading = await this.loadingCtrl.create({
      message: 'Updating...',
      spinner: 'crescent',
      showBackdrop: true,
    });

    loading.present();

    this.afs
      .collection('user')
      .doc(userid)
      .update({
        userName: name,
        bio: bio,
        userPhoto: image,
        editedAt: Date.now(),
      })
      .then(() => {
        loading.dismiss();
        //this.updateAll(name);
        this.updatePhoto(image, name);
        this.toast('Update Success', 'success');
        this.closePopOver();
      })
      .catch((error) => {
        loading.dismiss();
        this.toast(error.message, 'danger');
      });
  }

  async updateUserText(userid, name, bio) {
    const loading = await this.loadingCtrl.create({
      message: 'Updating...',
      spinner: 'crescent',
      showBackdrop: true,
    });

    loading.present();

    this.afs
      .collection('user')
      .doc(userid)
      .update({
        userName: name,
        bio: bio,
        editedAt: Date.now(),
      })
      .then(() => {
        loading.dismiss();
        this.updateAll(name);
        this.toast('Update Success', 'success');
        this.closePopOver();
      })
      .catch((error) => {
        loading.dismiss();
        this.toast(error.message, 'danger');
      });
  } //

  async updateAll(username) {

    try {
      const batch = this.afs.firestore.batch();

      const userRef = firebase.firestore()
        .collection('post')
        .where('postedById', '==', this.cUser).get();
        (await userRef).forEach((element) => {
          if (element.exists) {
            batch.update(element.ref, {
              postedBy: username
          });
          }
        });

      const userRefEvent = firebase.firestore()
      .collection('eventz')
      .where('eventPostedById', '==', this.cUser).get();
      (await userRefEvent).forEach((element) => {
        if (element.exists) {
          batch.update(element.ref, {
            eventPostedBy: username
        });
        }
      });

      return batch.commit();
    } catch (error) {
      console.log(error);
    }
  }

  async updatePhoto(image, username) {
    try {
      const batch = this.afs.firestore.batch();

      const userRef = firebase.firestore()
        .collection('post')
        .where('postedById', '==', this.cUser).get();
        (await userRef).forEach((element) => {
          if (element.exists) {
            batch.update(element.ref, {
              postedBy: username,
              postedByPhoto: image
          });
          }
        });

      const userRefEvent = firebase.firestore()
      .collection('eventz')
      .where('eventPostedById', '==', this.cUser).get();
      (await userRefEvent).forEach((element) => {
        if (element.exists) {
          batch.update(element.ref, {
            eventPostedBy: username,
            eventPostedByPhoto: image
        });
        }
      });

      return batch.commit();
    } catch (error) {
      console.log(error);
    }
  }

  closePopOver() {
    this.popOverCtrl.dismiss();
  } //

  async toast(message, status) {
    const toast = await this.toaster.create({
      message: message,
      color: status,
      position: 'top',
      duration: 2000,
    });

    toast.present();
  } //
}

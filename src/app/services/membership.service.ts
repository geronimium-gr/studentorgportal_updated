import { Injectable } from '@angular/core';
import { LoadingController, ToastController } from '@ionic/angular';

import firebase from 'firebase/app';
import 'firebase/firestore'

@Injectable({
  providedIn: 'root'
})
export class MembershipService {

  constructor(private loadingCtrl: LoadingController,
              private toaster: ToastController) { }

  async addUserInOrg(orgId: string, userId: string) {

    const loading = await this.loadingCtrl.create({
      message: 'Adding member...',
      spinner: 'crescent',
      showBackdrop: true,
    });

    loading.present();

    const orgRef = firebase.firestore().collection('organization').doc(orgId);

    orgRef.update({
      userList: firebase.firestore.FieldValue.arrayUnion(userId)
    }).then(() => {

      const userRef = firebase.firestore().collection('user').doc(userId);

      userRef.update({
        organizationId: firebase.firestore.FieldValue.arrayUnion(orgId)
      });

      const orgRef = firebase.firestore().collection('organization').doc(orgId);

      orgRef.update({
        pendingMembers: firebase.firestore.FieldValue.arrayRemove(userId)
      });

      loading.dismiss();
      this.toast('New Member Added', 'success');
    }).catch(error => {
      loading.dismiss();
      this.toast('Error happens. Try Again Later', 'danger');
    });

  }

  async removeUserInOrg(orgId: string, userId: string) {

    const loading = await this.loadingCtrl.create({
      message: 'Removing member...',
      spinner: 'crescent',
      showBackdrop: true,
    });

    const orgRef = firebase.firestore().collection('organization').doc(orgId);

    orgRef.update({
      userList: firebase.firestore.FieldValue.arrayRemove(userId)
    }).then(() => {

      const userRef = firebase.firestore().collection('user').doc(userId);

      userRef.update({
        organizationId: firebase.firestore.FieldValue.arrayRemove(orgId)
      });

      loading.dismiss();
      this.toast('Member removed', 'success');

    }).catch(error => {
      loading.dismiss();
      this.toast('Error happens. Try Again Later', 'danger');
    });

  }

  joinOrganization(orgId: string, userId: string) {

    const orgRef = firebase.firestore().collection('organization').doc(orgId);

    orgRef.update({
      pendingMembers: firebase.firestore.FieldValue.arrayUnion(userId)
    });
  }

  cancelJoinOrganization(orgId: string, userId: string) {

    const orgRef = firebase.firestore().collection('organization').doc(orgId);

    orgRef.update({
      pendingMembers: firebase.firestore.FieldValue.arrayRemove(userId)
    });
  }

  async toast(message, status){
    const toast = await this.toaster.create({
      message: message,
      color: status,
      position: 'top',
      duration: 2000
    });

    toast.present();
  }//

}

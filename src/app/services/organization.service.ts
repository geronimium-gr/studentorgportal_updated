import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  AngularFirestoreDocument,
} from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { Router } from '@angular/router';
import {
  LoadingController,
  PopoverController,
  ToastController,
} from '@ionic/angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Organization } from '../models/organization.model';

@Injectable({
  providedIn: 'root',
})
export class OrganizationService {
  orgCol: AngularFirestoreCollection<Organization>;
  orgDoc: AngularFirestoreDocument<Organization>;
  orgs: Observable<Organization[]>;
  org: Observable<Organization>;

  org$: any;

  constructor(
    private afs: AngularFirestore,
    private loadingCtrl: LoadingController,
    private popOverCtrl: PopoverController,
    private toaster: ToastController,
    private router: Router,
    private storage: AngularFireStorage
  ) {
    this.orgCol = this.afs.collection('organization', ref => ref.orderBy("createdAt", "desc"));

    this.orgs = this.orgCol.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Organization;
          data.orgId = a.payload.doc.id;
          return data;
        })
      })
    );
  } //

  getOrganizations() {
    return this.orgs;
  }//

  getOrganization(organizationID) {
    this.orgDoc = this.afs.doc<Organization>(`organization/${organizationID}`);
    return this.org = this.orgDoc.valueChanges();
  }

  async addOrganization(orgId, orgName, orgDesc, image) {
    const loading = await this.loadingCtrl.create({
      message: 'Adding Event...',
      spinner: 'crescent',
      showBackdrop: true
    });

    loading.present();

    this.afs.collection('organization').doc(orgId).set({
      'orgId': orgId,
      'orgName': orgName,
      'description': orgDesc,
      'imageUrl': image,
      'createdAt': Date.now()
    }).then(() => {
      loading.dismiss();
      this.toast('New Organization Added', 'success');
      this.closePopOver();
    }).catch(error => {
      loading.dismiss();
      this.toast(error.message, 'danger');
    });
  }

  async updateOrganization(orgId, orgName, orgDesc) {
    const loading = await this.loadingCtrl.create({
      message: 'Updating...',
      spinner: 'crescent',
      showBackdrop: true
    });

    loading.present();

    this.afs.collection('organization').doc(orgId).update({
      'orgName': orgName,
      'description': orgDesc
    }).then(() => {
      loading.dismiss();
      this.toast('Update Success', 'success');
      this.closePopOver();
    }).catch(error => {
      loading.dismiss();
      this.toast(error.message, 'danger');
    });
  }

  async updateOrganizationwithImage(orgId, orgName, orgDesc, image) {
    const loading = await this.loadingCtrl.create({
      message: 'Updating...',
      spinner: 'crescent',
      showBackdrop: true
    });

    loading.present();

    this.afs.collection('organization').doc(orgId).update({
      'orgName': orgName,
      'description': orgDesc,
      'imageUrl': image
    }).then(() => {
      loading.dismiss();
      this.toast('Update Success', 'success');
      this.closePopOver();
    }).catch(error => {
      loading.dismiss();
      this.toast(error.message, 'danger');
    });
  }//

  async deleteOrganization(orgId, orgName) {
    const loading = await this.loadingCtrl.create({
      message: `Deleting ${orgName}. Please Wait`,
      spinner: 'crescent',
      showBackdrop: true
    });

    loading.present();

    this.afs.collection('organization').doc(orgId).delete()
    .then(() => {
      this.router.navigate(['/home']);
      loading.dismiss();
      this.toast('Delete Success', 'success');
    }).catch(error => {
      loading.dismiss();
      this.toast(error.message, 'danger');
    });
  }

  closePopOver(){
    this.popOverCtrl.dismiss();
  }//

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

import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { LoadingController, PopoverController, ToastController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuditTrail } from '../models/audit-trail';

@Injectable({
  providedIn: 'root'
})
export class AuditTrailService {

  auditCol: AngularFirestoreCollection<AuditTrail>;
  auditDoc: AngularFirestoreDocument<AuditTrail>;
  audits: Observable<AuditTrail[]>;
  audit: Observable<AuditTrail>;

  constructor(
    private afs: AngularFirestore,
    private loadingCtrl: LoadingController,
    private popOverCtrl: PopoverController,
    private toaster: ToastController
  ) { }

  filterData() {
    this.auditCol = this.afs.collection("audit", ref => ref.orderBy("createdAt", "desc"));
    //console.log("Post ID " + this.commentId);

    this.audits = this.auditCol.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as AuditTrail;
          data.auditId = a.payload.doc.id;
          return data;
        })
      })
    );
  }//

  getAudits() {
    return this.audits;
  }


  async addAuditRecord(auditId, userId, userName, userSurname, userEmail, action) {
    const loading = await this.loadingCtrl.create({
      spinner: 'crescent',
      showBackdrop: true
    });

    loading.present();

    this.afs.collection('audit').doc(auditId).set({
      'auditId': auditId,
      'userId': userId,
      'userName': userName,
      'userSurname': userSurname,
      'userEmail': userEmail,
      'action': action,
      'createdAt': Date.now()
    }).then(() => {
      loading.dismiss();
    }).catch(error => {
      loading.dismiss();
      console.log(error.message);
    });
   }
}

import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { LoadingController, PopoverController, ToastController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuditTrail } from '../models/audit-trail';
import { AuthService } from './auth.service';

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
    private toaster: ToastController,
    private authService: AuthService
  )
  {
    this.auditCol = this.afs.collection('audit', ref => ref.orderBy("createdAt", "desc"));

    this.audits = this.auditCol.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as AuditTrail;
          data.auditId = a.payload.doc.id;
          return data;
        })
      })
    );

  }

  filterData() {
    // this.auditCol = this.afs.collection("auditing", ref => ref.orderBy("createdAt", "desc"));
    // //console.log("Post ID " + this.commentId);

    // this.audits = this.auditCol.snapshotChanges().pipe(
    //   map(action => {
    //     return action.map(a => {
    //       const data = a.payload.doc.data() as AuditTrail;
    //       data.auditId = a.payload.doc.id;
    //       return data;
    //     })
    //   })
    // );
  }//

  getAudits() {
    return this.audits;
  }


  async addAuditRecord(userId, userName, userSurname, userEmail, userSchoolId, action) {


    const auditId = this.afs.createId();

    this.afs.collection('audit').doc(auditId).set({
      'auditId': auditId,
      'userId': userId,
      'userName': userName,
      'userSurname': userSurname,
      'userEmail': userEmail,
      'userSchoolId': userSchoolId,
      'action': action,
      'createdAt': Date.now()
    }).then(() => {
      console.log("Added in Audit (Logout)");
      this.authService.signOut();
    }).catch(error => {
      console.log(error.message);
    });

   }

   async addRecordForEdit(userId, userName, userSurname, userEmail, userSchoolId, action) {

    const auditId = this.afs.createId();

    this.afs.collection('audit').doc(auditId).set({
      'auditId': auditId,
      'userId': userId,
      'userName': userName,
      'userSurname': userSurname,
      'userEmail': userEmail,
      'userSchoolId': userSchoolId,
      'action': action,
      'createdAt': Date.now()
    }).then(() => {
      console.log("Added in Audit");
    }).catch(error => {
      console.log(error.message);
    });
   }
}

import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { LoadingController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface Notificationz {
  notifId: string;
  userId: string;
  userName: string;
  userSurname: string;
  userPhoto: string;
  userOrgId: string;
  action: string;
  notifPhoto: string;
  createdAt: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  notifCol: AngularFirestoreCollection<Notificationz>;
  notifDoc: AngularFirestoreDocument<Notificationz>;
  notifs: Observable<Notificationz[]>;
  notif: Observable<Notificationz>;

  orgId = "";
  currentUserId = "";

  constructor(private afs: AngularFirestore,
              private loadingCtrl: LoadingController) { }

  getOrgId(orgId, currentUser) {
    this.orgId = orgId;
    this.currentUserId = currentUser;
    this.filterData();
  }

  filterData() {
    this.notifCol = this.afs
    .collection("notification", ref => ref.orderBy("createdAt", "asc"));

    this.notifs = this.notifCol.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Notificationz;
          data.notifId = a.payload.doc.id;
          return data;
        })
      })
    );
  }//

  getNotifications() {
    return this.notifs;
  }

  async sendNotif(userId, userName, userSurname, userPhoto, orgId, action, notifPhoto) {
    const loading = await this.loadingCtrl.create({
      message: 'Loading...',
      spinner: 'crescent',
      showBackdrop: true
    });

    loading.present();

    const notifId = this.afs.createId();

    this.afs.collection('chat').doc(notifId).set({
      'notifId': notifId,
      'userId': userId,
      'userName': userName,
      'userSurname': userSurname,
      'userPhoto': userPhoto,
      'userOrgId': orgId,
      'action': action,
      'notifPhoto': notifPhoto,
      'createdAt': Date.now()
    }).then(() => {
      loading.dismiss();
    }).catch(error => {
      loading.dismiss();
    });
   }
}

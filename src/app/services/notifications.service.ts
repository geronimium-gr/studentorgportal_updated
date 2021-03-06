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
  postId: string;
  postTitle: string;
  postContent: string;
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
    .collection("notification", ref => ref.orderBy("createdAt", "desc").where("userOrgId", "==", this.orgId));

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

  getNotifDetail(notifId) {
    this.notifDoc = this.afs.doc<Notificationz>(`notification/${notifId}`);
    return this.notif = this.notifDoc.valueChanges();
  }

  getNotifications() {
    return this.notifs;
  }

  async sendNotif(userId, userName, userSurname, userPhoto, orgId, action, notifPhoto, postId, postContent, postTitle, startDate, endDate, time, status) {


    this.afs.collection('notification').doc(postId).set({
      'userId': userId,
      'userName': userName,
      'userSurname': userSurname,
      'userPhoto': userPhoto,
      'userOrgId': orgId,
      'action': action,
      'notifPhoto': notifPhoto,
      'postId': postId,
      'postContent': postContent,
      'postTitle': postTitle,
      'eventStartDate': startDate,
      'eventEndDate': endDate,
      'eventTime': time,
      'status': status,
      'createdAt': Date.now()
    }).then(() => {
      console.log("Added in Notification");
    }).catch(error => {
      console.log(error);
    });
   }
}

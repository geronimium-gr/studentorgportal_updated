import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { LoadingController, ToastController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface Chats {
  chatId: string;
  userId: string;
  userName: string;
  userSurname: string;
  userPhoto: string;
  userOrgId: string;
  chatContent: string;
  status: string;
  createdAt: number;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  chatCol: AngularFirestoreCollection<Chats>;
  chatDoc: AngularFirestoreDocument<Chats>;
  chats: Observable<Chats[]>;
  chat: Observable<Chats>;

  orgId = ""

  constructor(
    private afs: AngularFirestore,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController) { }

  getOrgId(orgId) {
    this.orgId = orgId;
    this.filterData();
  }

  filterData() {
    this.chatCol = this.afs
    .collection("chat", ref => ref.orderBy("createdAt", "asc").where("userOrgId", "==", this.orgId));

    this.chats = this.chatCol.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Chats;
          data.chatId = a.payload.doc.id;
          return data;
        })
      })
    );
  }//

  getChats() {
    return this.chats;
  }

  async sendChat(userId, userName, userSurname, userPhoto, orgId, chatContent) {
    const loading = await this.loadingCtrl.create({
      message: 'Sending...',
      spinner: 'crescent',
      showBackdrop: true
    });

    loading.present();

    const chatId = this.afs.createId();

    this.afs.collection('chat').doc(chatId).set({
      'chatId': chatId,
      'userId': userId,
      'userName': userName,
      'userSurname': userSurname,
      'userPhoto': userPhoto,
      'userOrgId': orgId,
      'chatContent': chatContent,
      'status': "safe",
      'createdAt': Date.now()
    }).then(() => {
      loading.dismiss();
    }).catch(error => {
      loading.dismiss();
      this.toast(error.message, 'danger');
    });
   }

   async toast(message, status){
    const toast = await this.toastCtrl.create({
      message: message,
      color: status,
      position: 'top',
      duration: 2000
    });

    toast.present();
  }//

  async flagChat(chatId, status, report, orgName, reportedBy) {
    const loading = await this.loadingCtrl.create({
      message: 'Reporting message',
      spinner: 'crescent',
      showBackdrop: true
    });

    loading.present();

    this.afs.collection('chat').doc(chatId).update({
      'status': status,
      'report': report,
      'orgName': orgName,
      'reportedBy': reportedBy
    }).then(() => {
      loading.dismiss();
      this.toast('Message successfully reported', 'success');
    }).catch(error => {
      loading.dismiss();
      this.toast(error.message, 'danger');
    });
   }

  async rejectReport(chatId) {
    const loading = await this.loadingCtrl.create({
      message: 'Wait',
      spinner: 'crescent',
      showBackdrop: true
    });

    loading.present();

    this.afs.collection('chat').doc(chatId).update({
      'status': "safe"
    }).then(() => {
      loading.dismiss();
      this.toast('Done', 'success');
    }).catch(error => {
      loading.dismiss();
      this.toast(error.message, 'danger');
    });
  }

  async removeReport(chatId) {
    const loading = await this.loadingCtrl.create({
      message: 'Wait',
      spinner: 'crescent',
      showBackdrop: true
    });

    loading.present();

    this.afs.collection('chat').doc(chatId).delete().then(() => {
      loading.dismiss();
      this.toast('Done', 'success');
    }).catch(error => {
      loading.dismiss();
      this.toast(error.message, 'danger');
    });
  }



}

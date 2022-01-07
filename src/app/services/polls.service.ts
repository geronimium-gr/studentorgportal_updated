import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { LoadingController, PopoverController, ToastController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Polls } from '../models/polls';

@Injectable({
  providedIn: 'root'
})
export class PollsService {
  pollCol: AngularFirestoreCollection<Polls>;
  pollDoc: AngularFirestoreDocument<Polls>;
  polls: Observable<Polls[]>;
  poll: Observable<Polls>;

  orgId = ""

  constructor(    
    private afs: AngularFirestore,
    private loadingCtrl: LoadingController,
    private toaster: ToastController,
    private popOverCtrl: PopoverController) { }

  getOrgId(idParameter) {
    this.orgId = idParameter;
    this.filterData();
  }

  filterData() {
    this.pollCol = this.afs.collection("poll", ref => ref.orderBy("createdAt", "desc"));
    //this.postCol = this.afs.collection("post", ref => ref.where("postOrgId", "==", this.orgIds));

    this.polls = this.pollCol.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Polls;
          data.pollId = a.payload.doc.id;
          return data;
        })
      })
    );
  }

  getPolls() {
     return this.polls;
  }

  async addPoll(pollId, title, content, pollA, pollB, pollC, pollD, userId, userName, surname, userPhoto, orgId) {
    const loading = await this.loadingCtrl.create({
      message: 'Creating Poll',
      spinner: 'crescent',
      showBackdrop: true
    });

    loading.present();

    this.afs.collection('poll').doc(pollId).set({
      'pollId': pollId,
      'pollTitle': title,
      'pollContent': content,
      'pollOptionA': pollA,
      'pollOptionB': pollB,
      'pollOptionC': pollC,
      'pollOptionD': pollD,
      'votesA': [],
      'votesB': [],
      'votesC': [],
      'votesD': [],
      'postedById': userId,
      'postedBy': userName,
      'postedBySurname': surname,
      'postedByPhoto': userPhoto,
      'postOrgId': orgId,
      'createdAt': Date.now()
    }).then(() => {
      loading.dismiss();
      this.toast('New Poll Added', 'success');
      this.closePopOver();
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

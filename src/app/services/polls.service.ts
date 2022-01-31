import { Injectable, OnDestroy } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { LoadingController, ModalController, PopoverController, ToastController } from '@ionic/angular';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { Polls } from '../models/polls';

import firebase from 'firebase/app';
import 'firebase/firestore'
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PollsService implements OnDestroy {
  pollCol: AngularFirestoreCollection<Polls>;
  pollDoc: AngularFirestoreDocument<Polls>;
  polls: Observable<Polls[]>;
  poll: Observable<Polls>;

  orgId = ""
  pollSub: Subscription;
  user: any;

  constructor(
    private afs: AngularFirestore,
    private loadingCtrl: LoadingController,
    private toaster: ToastController,
    private popOverCtrl: PopoverController,
    private authService: AuthService,
    private modalCtrl: ModalController)

  {
    this.pollSub = this.authService.user$.subscribe(async user => {
      this.user = user;
    });
  }

  getOrgId(idParameter) {
    this.orgId = idParameter;
    this.filterData();
  }

  filterData() {
    this.pollCol = this.afs.collection("poll", ref => ref.orderBy("createdAt", "desc").where("postOrgId", "==", this.orgId).where("status", "==", "approved"));
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
      this.addtoQueueEvent(pollId);
      this.closeModal();
    }).catch(error => {
      loading.dismiss();
      this.toast(error.message, 'danger');
    });
   }

   async deletePoll(pollId) {
    const loading = await this.loadingCtrl.create({
      message: `Deleting poll. Please Wait`,
      spinner: 'crescent',
      showBackdrop: true
    });

    loading.present();

    this.afs.collection('poll').doc(pollId).delete()
    .then(() => {
      loading.dismiss();
      this.toast('Delete successfully', 'success');
    }).catch(error => {
      loading.dismiss();
      this.toast(error.message, 'danger');
    });
   }

   async addVote(pollId: string, userId: string, votePoll: string) {

    const pollRef = firebase.firestore().collection('poll').doc(pollId);

    switch (votePoll) {
      case 'votesA':
        pollRef.update({
          votesA: firebase.firestore.FieldValue.arrayUnion(userId)
        });
        break;
      case 'votesB':
        pollRef.update({
          votesB: firebase.firestore.FieldValue.arrayUnion(userId)
        });
        break;
      case 'votesC':
        pollRef.update({
          votesC: firebase.firestore.FieldValue.arrayUnion(userId)
        });
        break;
      case 'votesD':
        pollRef.update({
          votesD: firebase.firestore.FieldValue.arrayUnion(userId)
        });
        break;
      default:
        console.log("Error exists.");
        break;
    }
  }//

  async removeVote(pollId: string, userId: string, votePoll: string) {

    const pollRef = firebase.firestore().collection('poll').doc(pollId);

    switch (votePoll) {
      case 'votesA':
        pollRef.update({
          votesA: firebase.firestore.FieldValue.arrayRemove(userId)
        });
        break;
      case 'votesB':
        pollRef.update({
          votesB: firebase.firestore.FieldValue.arrayRemove(userId)
        });
        break;
      case 'votesC':
        pollRef.update({
          votesC: firebase.firestore.FieldValue.arrayRemove(userId)
        });
        break;
      case 'votesD':
        pollRef.update({
          votesD: firebase.firestore.FieldValue.arrayRemove(userId)
        });
        break;
      default:
        console.log("Error exists.");
        break;
    }

  }

  onPendingEvent(pollId, status) {
    this.afs.collection('poll').doc(pollId).update({
      'status': status
    }).then(() => {
      if (status == 'pending') {
        this.toast("Poll is posted. Wait for the approval.", 'success');
      } else if (status == 'approved') {
        console.log("Approved.");
      }
    }).catch(error => {
      this.toast(error.message, 'danger');
    });
  }

  addtoQueueEvent(pollId) {
    if (this.authService.canAccessByOfficer(this.user)) {
      this.onPendingEvent(pollId, 'pending');
    } else  {
      this.onPendingEvent(pollId, 'approved');
      console.log("Not an Officer");
    }
  }

   closePopOver(){
    this.popOverCtrl.dismiss();
  }//

  closeModal(){
    this.modalCtrl.dismiss();
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

  ngOnDestroy() {
    if (!this.pollSub) {
      this.pollSub.unsubscribe();
    }
  }
}

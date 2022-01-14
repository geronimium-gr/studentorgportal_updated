import { Component, OnInit } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { AlertController, ModalController, NavParams, ToastController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { PollsService } from 'src/app/services/polls.service';
import { EventzService } from '../../services/eventz.service';

@Component({
  selector: 'app-event-pending',
  templateUrl: './event-pending.component.html',
  styleUrls: ['./event-pending.component.scss'],
})
export class EventPendingComponent implements OnInit {

  pendingEv: Observable<any[]>;
  pendingEvRef: AngularFirestoreCollection;
  pendingPoll: Observable<any[]>;
  pendingPollRef: AngularFirestoreCollection;

  eventOrgId: any;
  postInd: any;
  segmentModel: any;

  constructor(public modalCtrl: ModalController,
              private afs: AngularFirestore,
              private alertCtrl: AlertController,
              private navParams: NavParams,
              private eventService: EventzService,
              private toaster: ToastController,
              private pollService: PollsService)

  {
    this.eventOrgId = this.navParams.get('orgId');
    this.postInd = this.navParams.get('postInd');
    console.log(this.eventOrgId);

    if (this.postInd === 'event') {
      this.segmentModel = 'evt';
    } else if (this.postInd === 'poll'){
      this.segmentModel = 'poll';
    }
  }

  ngOnInit() {
    this.pendingEvRef = this.afs.collection("eventz", ref => ref.orderBy("createdAt", "desc").where("eventOrgId", "==", this.eventOrgId).where("status", "==", "pending"));
    this.pendingEv = this.pendingEvRef.valueChanges();

    this.pendingPollRef = this.afs.collection("poll", ref => ref.orderBy("createdAt", "desc").where("postOrgId", "==", this.eventOrgId).where("status", "==", "pending"));
    this.pendingPoll = this.pendingPollRef.valueChanges();
  }

  acceptEvent(eventId) {
    this.eventService.onPendingEvent(eventId, "approved");
    this.toast("Event was approved and posted.", "success");
  }

  async deleteEvent(eventId) {
    const alert = await this.alertCtrl.create({
      header: 'Confirm',
      message: 'Delete this event?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Confirm',
          handler: () => {
            this.eventService.deleteEvent(eventId);
            this.toast("Event was successfully deleted.", "success");
          }
        }
      ]
    });

    await alert.present();
  }

  acceptPoll(pollId) {
    this.pollService.onPendingEvent(pollId, "approved");
    this.toast("Poll was approved and posted.", "success");
  }

  async deletePoll(pollId) {
    const alert = await this.alertCtrl.create({
      header: 'Confirm',
      message: 'Delete this poll?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Confirm',
          handler: () => {
            this.pollService.deletePoll(pollId);
            this.toast("Poll was successfully deleted.", "success");
          }
        }
      ]
    });

    await alert.present();
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

  closeModal() {
    this.modalCtrl.dismiss();
  }

}

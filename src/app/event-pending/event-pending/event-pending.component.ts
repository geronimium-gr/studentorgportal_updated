import { Component, OnInit } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { AlertController, ModalController, NavParams, ToastController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { EventzService } from '../../services/eventz.service';

@Component({
  selector: 'app-event-pending',
  templateUrl: './event-pending.component.html',
  styleUrls: ['./event-pending.component.scss'],
})
export class EventPendingComponent implements OnInit {

  pendingEv: Observable<any[]>;
  pendingEvRef: AngularFirestoreCollection;

  eventOrgId: any;

  constructor(public modalCtrl: ModalController,
              private afs: AngularFirestore,
              private alertCtrl: AlertController,
              private navParams: NavParams,
              private eventService: EventzService,
              private toaster: ToastController)

  {
    this.eventOrgId = this.navParams.get('orgId');
    console.log(this.eventOrgId);
  }

  ngOnInit() {
    this.pendingEvRef = this.afs.collection("eventz", ref => ref.orderBy("createdAt", "desc").where("eventOrgId", "==", this.eventOrgId).where("status", "==", "pending"));
    this.pendingEv = this.pendingEvRef.valueChanges();
  }

  acceptEvent(eventId) {
    this.eventService.onPendingEvent(eventId, "approved");
    this.toast("Event was approved and posted.", "success");
  }

  deleteEvent(eventId) {
    this.eventService.deleteEvent(eventId);
    this.toast("Event was successfully deleted.", "success");
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

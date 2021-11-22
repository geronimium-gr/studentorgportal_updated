import { Component, OnInit } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { AlertController, ModalController, NavParams } from '@ionic/angular';
import { Observable } from 'rxjs';

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
              private navParams: NavParams) 
              
  { 
    this.eventOrgId = this.navParams.get('orgId');
    console.log(this.eventOrgId);
  }
  
  ngOnInit() {
    this.pendingEvRef = this.afs.collection("eventz", ref => ref.orderBy("createdAt", "desc").where("eventOrgId", "==", this.eventOrgId).where("status", "==", "pending"));
    this.pendingEv = this.pendingEvRef.valueChanges();
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

}

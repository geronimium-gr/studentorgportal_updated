import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { LoadingController, PopoverController, ToastController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Eventz } from '../models/eventz.model';

@Injectable({
  providedIn: 'root'
})
export class EventzService {
  eventCol: AngularFirestoreCollection<Eventz>;
  eventDoc: AngularFirestoreDocument<Eventz>;
  events: Observable<Eventz[]>;
  event: Observable<Eventz>;

  events$: any;

  eventId = "";

  constructor(
    private afs: AngularFirestore,
    private loadingCtrl: LoadingController,
    private popOverCtrl: PopoverController,
    private toaster: ToastController )
    {
    }//

  getOrgId(idParam) {
    this.eventId = idParam;
    this.filterData();
  }

  filterData() {
    this.eventCol = this.afs.collection("eventz", ref => ref.orderBy("createdAt", "desc").where("eventOrgId", "==", this.eventId));
    //this.eventCol = this.afs.collection("eventz", ref => ref.where("eventOrgId", "==", this.eventId));

    console.log("Event ID " + this.eventId);
    
    this.events = this.eventCol.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Eventz;
          data.eventId = a.payload.doc.id;
          return data;
        })
      })
    );
  }

  getEvents() {
      return this.events;
   }

  getEvent(eventId) {
    this.eventDoc = this.afs.doc<Eventz>(`eventz/${eventId}`);
    return this.event = this.eventDoc.valueChanges();
  }

  async addEvents(eventId, title, content, image, userId, userName, userPhoto, orgId, startDate, endDate, time) {
    const loading = await this.loadingCtrl.create({
      message: 'Creating Event',
      spinner: 'crescent',
      showBackdrop: true
    });

    loading.present();

    this.afs.collection('eventz').doc(eventId).set({
      'eventId': eventId,
      'eventTitle': title,
      'eventContent': content,
      'eventImageUrl': image,
      'eventPostedById': userId,
      'eventPostedBy': userName,
      'eventPostedByPhoto': userPhoto,
      'eventOrgId': orgId,
      'eventStartDate': startDate,
      'eventEndDate': endDate,
      'eventTime': time,
      'createdAt': Date.now()
    }).then(() => {
      loading.dismiss();
      this.toast('New Event Added', 'success');
      this.closePopOver();
    }).catch(error => {
      loading.dismiss();
      this.toast(error.message, 'danger');
    });
   }//

  async updateEvent(eventId, title, content, image, startDate, endDate, time) {
    const loading = await this.loadingCtrl.create({
      message: 'Updating Event',
      spinner: 'crescent',
      showBackdrop: true
    });

    loading.present();

    this.afs.collection('eventz').doc(eventId).update({
      'eventTitle': title,
      'eventContent': content,
      'eventImageUrl': image,
      'eventStartDate': startDate,
      'eventEndDate': endDate,
      'eventTime': time,
      'editedAt': Date.now()
    }).then(() => {
      loading.dismiss();
      this.toast('Event updated successfully', 'success');
      this.closePopOver();
    }).catch(error => {
      loading.dismiss();
      this.toast(error.message, 'danger');
    });
   }

  async updateEventText(eventId, title, content, startDate, endDate, time) {
    const loading = await this.loadingCtrl.create({
      message: 'Updating Event',
      spinner: 'crescent',
      showBackdrop: true
    });

    loading.present();

    this.afs.collection('eventz').doc(eventId).update({
      'eventTitle': title,
      'eventContent': content,
      'eventStartDate': startDate,
      'eventEndDate': endDate,
      'eventTime': time,
      'editedAt': Date.now()
    }).then(() => {
      loading.dismiss();
      this.toast('Event updated successfully', 'success');
      this.closePopOver();
    }).catch(error => {
      loading.dismiss();
      this.toast(error.message, 'danger');
    });
   }

   async deleteEvent(eventId) {
    const loading = await this.loadingCtrl.create({
      message: `Deleting Event. Please Wait`,
      spinner: 'crescent',
      showBackdrop: true
    });

    loading.present();

    this.afs.collection('eventz').doc(eventId).delete()
    .then(() => {
      loading.dismiss();
      this.toast('Delete successfully', 'success');
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

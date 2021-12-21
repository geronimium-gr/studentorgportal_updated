import { Injectable, OnDestroy } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { LoadingController, PopoverController, ToastController } from '@ionic/angular';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { Eventz } from '../models/eventz.model';
import { AuthService } from './auth.service';
import { NotificationsService } from './notifications.service';

import firebase from 'firebase/app';
import 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class EventzService implements OnDestroy {

  user: any;
  eventHub: Subscription;

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
    private toaster: ToastController,
    private authService: AuthService,
    private notifService: NotificationsService )
    {

      this.eventHub = this.authService.user$.subscribe(async user => {
        this.user = user;
      });

    }//

  getOrgId(idParam) {
    this.eventId = idParam;
    this.filterData();
  }

  filterData() {
    this.eventCol = this.afs.collection("eventz", ref => ref.orderBy("createdAt", "desc").where("eventOrgId", "==", this.eventId).where("status", "==", "approved"));
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

  async addEvents(eventId, title, content, image, userId, userName, surname, userPhoto, orgId, startDate, endDate, time) {
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
      'eventPostedBySurname': surname,
      'eventPostedByPhoto': userPhoto,
      'eventOrgId': orgId,
      'eventStartDate': startDate,
      'eventEndDate': endDate,
      'eventTime': time,
      'createdAt': Date.now()
    }).then(() => {
      loading.dismiss();
      this.toast('New Event Added', 'success');
      this.notifService.sendNotif(userId, userName, surname, userPhoto, orgId, "added an event", image, eventId, content, title, startDate, endDate, time, "");
      this.addtoQueueEvent(eventId);
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

   onPendingEvent(eventId, status) {
    this.afs.collection('eventz').doc(eventId).update({
      'status': status
    }).then(() => {
      if (status == 'pending') {
        this.toast("Event is posted. Wait for the approval.", 'success');
      } else if (status == 'approved') {
        console.log("Approved.");
      }
    }).catch(error => {
      this.toast(error.message, 'danger');
    });

    this.afs.collection('notification').doc(eventId).update({
      'status': status
    }).then(() => {
      if (status == 'pending') {
        console.log("Pending Notif");
      } else if (status == 'approved') {
        console.log("Approved Notif");
      }
    }).catch(error => {
      this.toast(error.message, 'danger');
    });


   }

   addtoQueueEvent(eventId) {
    if (this.authService.canAccessByOfficer(this.user)) {
      this.onPendingEvent(eventId, 'pending');
    } else  {
      this.onPendingEvent(eventId, 'approved');
      console.log("Not an Officer");
    }
  }

   async deleteEvent(eventId) {
    const loading = await this.loadingCtrl.create({
      message: `Deleting Event. Please Wait`,
      spinner: 'crescent',
      showBackdrop: true
    });

    loading.present();

    this.deleteNotif(eventId);

    this.afs.collection('eventz').doc(eventId).delete()
    .then(() => {
      loading.dismiss();
      this.toast('Delete successfully', 'success');
    }).catch(error => {
      loading.dismiss();
      this.toast(error.message, 'danger');
    });
   }

   async deleteNotif(eventId) {
    try {
      const batch = this.afs.firestore.batch();
      const notifRef = firebase.firestore()
        .collection('notification').doc(eventId)
        batch.delete(notifRef);
        await batch.commit();
    } catch (error) {
      console.log(error);
    }

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

  ngOnDestroy() {
    if (this.eventHub) {
      this.eventHub.unsubscribe();
    }
  }
}

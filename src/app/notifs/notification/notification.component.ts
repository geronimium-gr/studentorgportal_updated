import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { NotificationsService } from '../../services/notifications.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
})
export class NotificationComponent implements OnInit, OnDestroy {

  notifSub: Subscription;
  notif: any;
  currentUser: any;
  orgId: any;

  constructor (public modalCtrl: ModalController,
               private notifService: NotificationsService,
               private navParams: NavParams)

  {
    this.currentUser = this.navParams.get("userId");
    this.orgId = this.navParams.get("orgId");

    this.notifService.getOrgId(this.orgId, this.currentUser);
  }

  ngOnInit() {
    this.notifSub = this.notifService.getNotifications().subscribe(notifs => {
      this.notif = notifs;
    });
  }

  viewNotif() {
    console.log("Notification Click...");

  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

  ngOnDestroy() {
    if (this.notifSub) {
      this.notifSub.unsubscribe();
    }
  }

}

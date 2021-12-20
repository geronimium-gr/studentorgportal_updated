import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { NotificationsService } from 'src/app/services/notifications.service';

@Component({
  selector: 'app-view-notification',
  templateUrl: './view-notification.component.html',
  styleUrls: ['./view-notification.component.scss'],
})
export class ViewNotificationComponent implements OnInit, OnDestroy {

  notifId: string;
  notifSub: Subscription;

  notifFn: string;
  notifSn: string;
  notifAction: string;

  constructor(public modalCtrl: ModalController,
              private notifService: NotificationsService,
              private navParams: NavParams)
  {
    this.notifId = this.navParams.get("notifId");
  }

  ngOnInit() {}

  ionViewWillEnter() {
    this.loadNotifDetails();
  }

  async loadNotifDetails() {
    this.notifSub = this.notifService.getNotifDetail(this.notifId).subscribe(async notif => {
      this.notifFn = notif.userName;
      this.notifSn = notif.userSurname;
      this.notifAction = notif.action;
    });
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

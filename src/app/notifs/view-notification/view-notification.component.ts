import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { CommentSectionComponent } from '../../comments/comment-section/comment-section.component';
import { NotificationsService } from '../../services/notifications.service';

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
  notifDetails: any;

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
      this.notifDetails = notif;
      this.notifFn = notif.userName;
      this.notifSn = notif.userSurname;
    });
  }

  async openCommentSection(postId) {
    const modal = await this.modalCtrl.create({
      component: CommentSectionComponent,
      componentProps: {
        postIdComment: postId
      }
    });
    return await modal.present();
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

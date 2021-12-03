import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AlertController,
  LoadingController,
  ModalController,
  NavParams,
} from '@ionic/angular';
import { Subscription } from 'rxjs';
import { OrganizationService } from 'src/app/services/organization.service';

@Component({
  selector: 'app-chats',
  templateUrl: './chats.component.html',
  styleUrls: ['./chats.component.scss'],
})
export class ChatsComponent implements OnInit, OnDestroy {
  orgSub: Subscription;

  orgId: any;
  orgName: any;
  orgPhoto: any;
  currentUser: any;

  constructor(
    public modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private orgService: OrganizationService,
    private loadingCtrl: LoadingController,
    private navParams: NavParams
  ) {

    this.orgId = this.navParams.get("orgId");
    this.orgName = this.navParams.get("orgName");
    this.orgPhoto = this.navParams.get("orgPhoto");
    this.currentUser = this.navParams.get("userId");
  }

  ngOnInit() {}

  onClose() {
    this.modalCtrl.dismiss();
  }

  ngOnDestroy() {
    // if (this.orgSub) {
    //   this.orgSub.unsubscribe();
    // }
  }
}

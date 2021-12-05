import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  AlertController,
  IonContent,
  LoadingController,
  ModalController,
  NavParams,
} from '@ionic/angular';
import { Subscription } from 'rxjs';
import { ChatService } from 'src/app/services/chat.service';
import { OrganizationService } from 'src/app/services/organization.service';

@Component({
  selector: 'app-chats',
  templateUrl: './chats.component.html',
  styleUrls: ['./chats.component.scss'],
})
export class ChatsComponent implements OnInit, OnDestroy {
  chatSub: Subscription;
  @ViewChild(IonContent) content: IonContent;

  chatContent: any;

  orgId: any;
  orgName: any;
  orgPhoto: any;
  currentUser: any;
  userInfo: any;

  chats: any;

  constructor(
    public modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private orgService: OrganizationService,
    private loadingCtrl: LoadingController,
    private navParams: NavParams,
    private chatService: ChatService
  ) {

    this.orgId = this.navParams.get("orgId");
    this.orgName = this.navParams.get("orgName");
    this.orgPhoto = this.navParams.get("orgPhoto");
    this.currentUser = this.navParams.get("userId");
    this.userInfo = this.navParams.get("userInfo");

    this.chatService.getOrgId(this.orgId);



  }

  ngOnInit() {
    this.chatSub = this.chatService.getChats().subscribe(chatsResults => {
      this.chats = chatsResults;
      setTimeout(() => {
        this.content.scrollToBottom();
      }, 200);
    });

  }

  sendMessage() {
    this.chatService.sendChat(this.currentUser, this.userInfo.userName, this.userInfo.userSurname, this.userInfo.userPhoto, this.orgId, this.chatContent);
    this.chatContent = "";
  }

  onClose() {
    this.modalCtrl.dismiss();
  }

  ngOnDestroy() {
    if (this.chatSub) {
      this.chatSub.unsubscribe();
    }
  }
}

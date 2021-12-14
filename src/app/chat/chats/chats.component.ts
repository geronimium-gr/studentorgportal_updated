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

  async flagChat(id) {
    const alert = await this.alertCtrl.create({
      cssClass: 'flag-alert',
      header: 'Report Message',
      message: 'Why are you <strong>reporting</strong> this message?',
      inputs: [
        {
          name: 'radio1',
          type: 'radio',
          label: 'It contains harassment or abuse.',
          value: 'It contains harassment or abuse.'
        },
        {
          name: 'radio2',
          type: 'radio',
          label: 'It\'s unfriendly or unkind.',
          value: 'It\'s unfriendly or unkind.'
        },
        {
          name: 'radio3',
          type: 'radio',
          label: 'Something else.',
          value: 'smthg'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Ok',
          handler: (result) => {
            if (result == 'smthg') {
              console.log('Something else.');
              this.somethingElseInput(id, "danger", this.orgName, this.userInfo.userName + " " + this.userInfo.userSurname);
            } else if (result == undefined) {
              this.alertController("Select first", "You must select first.", "Try Again");
              return false;
            } else {
              console.log(result);
              this.chatService.flagChat(id, "danger", result, this.orgName, this.userInfo.userName + " " + this.userInfo.userSurname);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async somethingElseInput(id, report, orgName, user) {
    const alert = await this.alertCtrl.create({
      header: 'Something else.',
      message: 'Try to be specific as possible.',
      inputs: [
        {
          name: 'reportInput',
          id: 'paragraph',
          type: 'textarea',
          placeholder: 'Type here...'
        }
      ],
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
          handler: contentCom => {
            if (contentCom.reportInput) {
              console.log(contentCom.reportInput);
              this.chatService.flagChat(id, report, contentCom.reportInput, orgName, user);
            } else {
              this.alertController("Input Required", "Enter Content", "Try Again");
              return false;
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async alertController(header, message, button){
    let alert = await this.alertCtrl.create({
      header: header,
      message: message,
      buttons: [ button ]
    });
    alert.present();
  }//

  ngOnDestroy() {
    if (this.chatSub) {
      this.chatSub.unsubscribe();
    }
  }
}

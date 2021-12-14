import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { AlertController, ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { ChatService } from 'src/app/services/chat.service';
import { CommentsService } from 'src/app/services/comments.service';

@Component({
  selector: 'app-flags-module',
  templateUrl: './flags-module.component.html',
  styleUrls: ['./flags-module.component.scss'],
})
export class FlagsModuleComponent implements OnInit {

  //Comments
  flags: Observable<any[]>;
  flagsRef: AngularFirestoreCollection;

  //Chats
  flagsChat: Observable<any[]>;
  flagsChatRef: AngularFirestoreCollection;

  segmentModel = "comment";

  constructor(private modalCtrl: ModalController,
              private afs: AngularFirestore,
              private alertCtrl: AlertController,
              private commentService: CommentsService,
              private chatService: ChatService)

  {
    this.flagsRef = this.afs.collection('comment', ref => ref.orderBy("createdAt", "desc").where("status", "==", "danger"));
    this.flags = this.flagsRef.valueChanges();

    this.flagsChatRef = this.afs.collection('chat', ref => ref.orderBy("createdAt", "desc").where("status", "==", "danger"));
    this.flagsChat = this.flagsChatRef.valueChanges();
  }

  ngOnInit() {}

  async acceptComment(commentId) {
    const alert = await this.alertCtrl.create({
      header: 'Confirm!',
      message: 'Ignore this report?',
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
          handler: () => {
            this.commentService.rejectReport(commentId);
            console.log('Confirm Okay');
          }
        }
      ]
    });
    await alert.present();
  }//

  async deleteComment(commentId) {
    const alert = await this.alertCtrl.create({
      header: 'Confirm!',
      message: 'Delete this comment?',
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
          handler: () => {
            this.commentService.deleteComment(commentId);
            console.log('Confirm Okay');
          }
        }
      ]
    });
    await alert.present();
  }//

  async acceptChat(chatId) {
    const alert = await this.alertCtrl.create({
      header: 'Confirm!',
      message: 'Ignore this report?',
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
          handler: () => {
            this.chatService.rejectReport(chatId);
            console.log('Confirm Okay');
          }
        }
      ]
    });
    await alert.present();
  }//

  async deleteChat(chatId) {
    const alert = await this.alertCtrl.create({
      header: 'Confirm!',
      message: 'Delete this message?',
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
          handler: () => {
            this.chatService.removeReport(chatId);
            console.log('Confirm Okay');
          }
        }
      ]
    });
    await alert.present();
  }//

  closeModal() {
    this.modalCtrl.dismiss();
  }

}

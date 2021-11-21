import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { AlertController, ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { CommentsService } from 'src/app/services/comments.service';

@Component({
  selector: 'app-flags-module',
  templateUrl: './flags-module.component.html',
  styleUrls: ['./flags-module.component.scss'],
})
export class FlagsModuleComponent implements OnInit {

  flags: Observable<any[]>;
  flagsRef: AngularFirestoreCollection;

  segmentModel = "comment";

  constructor(private modalCtrl: ModalController,
              private afs: AngularFirestore,
              private alertCtrl: AlertController,
              private commentService: CommentsService)

  {
    this.flagsRef = this.afs.collection('comment', ref => ref.orderBy("createdAt", "desc").where("status", "==", "danger"));
    this.flags = this.flagsRef.valueChanges();
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

  closeModal() {
    this.modalCtrl.dismiss();
  }

}

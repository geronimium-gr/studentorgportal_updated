import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-chats',
  templateUrl: './chats.component.html',
  styleUrls: ['./chats.component.scss'],
})
export class ChatsComponent implements OnInit {

  constructor(public modalCtrl: ModalController) { }

  ngOnInit() {}

  onClose() {
    this.modalCtrl.dismiss();
  }

}

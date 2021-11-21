import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-event-pending',
  templateUrl: './event-pending.component.html',
  styleUrls: ['./event-pending.component.scss'],
})
export class EventPendingComponent implements OnInit {

  constructor(public modalCtrl: ModalController) { }

  ngOnInit() {}

  closeModal() {
    this.modalCtrl.dismiss();
  }

}

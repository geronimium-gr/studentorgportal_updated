import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-flags-module',
  templateUrl: './flags-module.component.html',
  styleUrls: ['./flags-module.component.scss'],
})
export class FlagsModuleComponent implements OnInit {

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {}

  closeModal() {
    this.modalCtrl.dismiss();
  }

}

import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-audit-trail',
  templateUrl: './audit-trail.page.html',
  styleUrls: ['./audit-trail.page.scss'],
})
export class AuditTrailPage implements OnInit {

  constructor(private menu: MenuController) { }

  ngOnInit() {
  }

  openFirst(){
    this.menu.enable(true, 'm1');
  }

}

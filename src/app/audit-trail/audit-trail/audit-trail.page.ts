import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-audit-trail',
  templateUrl: './audit-trail.page.html',
  styleUrls: ['./audit-trail.page.scss'],
})
export class AuditTrailPage implements OnInit {

  selectCategory = "userName";
  searchValue: string = "";

  rows = [
    { name: 'Austin', gender: 'Male', company: 'Swimlane' },
    { name: 'Dany', gender: 'Male', company: 'KFC' },
    { name: 'Molly', gender: 'Female', company: 'Burger King' }
  ];
  columns = [{ prop: 'name' }, { name: 'Gender' }, { name: 'Company' }];

  constructor(private menu: MenuController) { }

  ngOnInit() {
  }

  openFirst(){
    this.menu.enable(true, 'm1');
  }

}

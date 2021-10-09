import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { MenuController, PopoverController } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { Organization } from '../models/organization.model';
import { NewOrgComponent } from '../orgs/new-org/new-org.component';
import { OrganizationService } from '../services/organization.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy{

  organization: Organization[];
  orgSub: Subscription;
  isLoading = false;

  slideOpts = {
    speed: 1000,
    autoplay: true,
    initialSlide: 0
  };

  constructor(private menu: MenuController,
              private popOverCtrl: PopoverController,
              private orgService: OrganizationService,
              private aStorage: AngularFireStorage) {}

  ngOnInit() {
    this.isLoading = true;
    this.orgSub = this.orgService.getOrganizations().subscribe(orgs => {
      this.organization = orgs;
      this.isLoading = false;
    });
  }

  openFirst(){
    this.menu.enable(true, 'm1');
  }

  async openAddForm(ev: any) {
    const popOver = await this.popOverCtrl.create({
      component: NewOrgComponent,
      event: ev,
      animated: true,
      showBackdrop: true,
      cssClass: 'contact-popover',
      mode: 'md'
    });
    return await popOver.present();
  }

  ngOnDestroy() {
    if (this.orgSub) {
      this.orgSub.unsubscribe();
    }
  }

}

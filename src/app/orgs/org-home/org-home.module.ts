import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OrgHomePageRoutingModule } from './org-home-routing.module';

import { OrgHomePage } from './org-home.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    OrgHomePageRoutingModule
  ],
  declarations: [OrgHomePage]
})
export class OrgHomePageModule {}

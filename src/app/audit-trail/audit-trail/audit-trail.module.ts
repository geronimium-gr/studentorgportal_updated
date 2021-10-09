import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AuditTrailPageRoutingModule } from './audit-trail-routing.module';

import { AuditTrailPage } from './audit-trail.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AuditTrailPageRoutingModule
  ],
  declarations: [AuditTrailPage]
})
export class AuditTrailPageModule {}

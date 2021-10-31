import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AuditTrailPageRoutingModule } from './audit-trail-routing.module';

import { AuditTrailPage } from './audit-trail.page';

import { NgxDatatableModule } from "@swimlane/ngx-datatable";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AuditTrailPageRoutingModule,
    NgxDatatableModule
  ],
  declarations: [AuditTrailPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AuditTrailPageModule {}

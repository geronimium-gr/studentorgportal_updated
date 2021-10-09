import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuditTrailPage } from './audit-trail.page';

const routes: Routes = [
  {
    path: '',
    component: AuditTrailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuditTrailPageRoutingModule {}

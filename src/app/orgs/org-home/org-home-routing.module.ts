import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OrgHomePage } from './org-home.page';

const routes: Routes = [
  {
    path: '',
    component: OrgHomePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrgHomePageRoutingModule {}

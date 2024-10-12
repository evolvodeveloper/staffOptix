import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IncomeTaxComponent } from './income-tax.component';

const routes: Routes = [
  { path: '', component: IncomeTaxComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IncomeTaxRoutingModule { }

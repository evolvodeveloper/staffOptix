import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PayrolldetailsComponent } from './payrolldetails.component';

const routes: Routes = [
  { path: '', component: PayrolldetailsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PayrolldetailsRoutingModule { }

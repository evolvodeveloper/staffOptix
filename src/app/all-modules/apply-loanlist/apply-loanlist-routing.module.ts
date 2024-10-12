import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ApplyLoanComponent } from './apply-loan/apply-loan.component';
import { ApplyLoanlistComponent } from './apply-loanlist.component';

const routes: Routes = [
  { path: '', component: ApplyLoanlistComponent },
  { path: 'apply', component: ApplyLoanComponent },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ApplyLoanlistRoutingModule { }

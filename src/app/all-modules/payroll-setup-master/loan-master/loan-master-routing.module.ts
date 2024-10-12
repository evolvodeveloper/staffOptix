import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateLoanMasterComponent } from './create-loan-master/create-loan-master.component';
import { LoanMasterComponent } from './loan-master.component';

const routes: Routes = [
  { path: '', component: LoanMasterComponent },
  { path: 'createLoan', component: CreateLoanMasterComponent },


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoanMasterRoutingModule { }

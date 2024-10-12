import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SalaryMasterReportComponent } from './salary-master-report.component';

const routes: Routes = [
  { path: '', component: SalaryMasterReportComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SalaryMasterReportRoutingModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MonthlyAttReportComponent } from './monthly-att-report.component';

const routes: Routes = [
  { path: '', component: MonthlyAttReportComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MonthlyAttReportRoutingModule { }

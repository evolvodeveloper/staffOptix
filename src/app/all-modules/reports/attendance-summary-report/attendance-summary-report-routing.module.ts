import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AttendanceSummaryReportComponent } from './attendance-summary-report.component';

const routes: Routes = [
  { path: '', component: AttendanceSummaryReportComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AttendanceSummaryReportRoutingModule { }

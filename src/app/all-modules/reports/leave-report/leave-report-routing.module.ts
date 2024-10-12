import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LeaveReportComponent } from './leave-report.component';

const routes: Routes = [
  {path:'',component:LeaveReportComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LeaveReportRoutingModule { }

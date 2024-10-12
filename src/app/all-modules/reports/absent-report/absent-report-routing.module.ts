import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AbsentReportComponent } from './absent-report.component';

const routes: Routes = [{path:'',component:AbsentReportComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AbsentReportRoutingModule { }

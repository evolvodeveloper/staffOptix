import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DepartmentWiseReportComponent } from './department-wise-report.component';

const routes: Routes = [
  {
    path: '',
    component: DepartmentWiseReportComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DepartmentWiseReportRoutingModule { }

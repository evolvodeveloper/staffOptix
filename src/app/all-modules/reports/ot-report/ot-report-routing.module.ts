import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OtReportComponent } from './ot-report.component';


const routes: Routes = [
  {
    path: '',
    component: OtReportComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OtReportRoutingModule { }

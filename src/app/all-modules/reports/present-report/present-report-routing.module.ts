import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PresentReportComponent } from './present-report.component';

const routes: Routes = [
  {
    path: '',
    component: PresentReportComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PresentReportRoutingModule { }

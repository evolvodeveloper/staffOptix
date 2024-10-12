import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EarlyLateReportsComponent } from './early-late-reports.component';

const routes: Routes = [
  {
    path: '',
    component: EarlyLateReportsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EarlyLateReportsRoutingModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmpBankinfoComponent } from './emp-bankinfo.component';

const routes: Routes = [
  {
    path: '',
    component: EmpBankinfoComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmpBankinfoRoutingModule { }

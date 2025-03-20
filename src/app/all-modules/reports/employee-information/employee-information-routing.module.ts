import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmployeeInformationComponent } from './employee-information.component';

const routes: Routes = [
  {path:'',component:EmployeeInformationComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeeInformationRoutingModule { }

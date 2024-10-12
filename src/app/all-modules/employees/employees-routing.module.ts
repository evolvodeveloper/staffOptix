import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmployeesComponent } from './employees.component';
import { CreateEmployeeComponent } from './create-employee/create-employee.component';

const routes: Routes = [{
  path: "",
  component: EmployeesComponent,
},
{
  path: "create-employee",
  component: CreateEmployeeComponent,
},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeesRoutingModule { }

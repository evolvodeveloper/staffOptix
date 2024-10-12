import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateDepartmentComponent } from '../create-department.component';
import { DepartmentComponent } from './department.component';

const routes: Routes = [
  {
    path: "",
    component: DepartmentComponent,
  },
  {
    path: "create-department",
    component: CreateDepartmentComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DepartmentRoutingModule { }

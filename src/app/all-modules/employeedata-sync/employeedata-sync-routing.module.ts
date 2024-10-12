import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmployeedataSyncComponent } from './employeedata-sync.component';

const routes: Routes = [
  { path: '', component: EmployeedataSyncComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeedataSyncRoutingModule { }

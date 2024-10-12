import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreatePayrollTypeComponent } from './create-payroll-setup/create-payroll-setup.component';
import { PayrollTypesComponent } from './payroll-setup.component';

const routes: Routes = [
  {
    path: '',
    component: PayrollTypesComponent,
  },
  {
    path: 'create-payroll-setup',
    component: CreatePayrollTypeComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PayrollTypesRoutingModule { }

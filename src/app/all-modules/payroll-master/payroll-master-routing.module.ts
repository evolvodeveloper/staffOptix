import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CheckPermissionResolver } from 'src/app/authentication/guards/check-permission.resolver';
import { RunpayrollComponent } from '../runpayroll/runpayroll.component';
import { CreatePayrollMasterComponent } from './create-payroll-master/create-payroll-master.component';
import { DowloadPayslipsComponent } from './dowload-payslips/dowload-payslips.component';
import { PayrollMasterComponent } from './payroll-master.component';
import { ShowRunPayrollComponent } from './show-run-payroll/show-run-payroll.component';

const routes: Routes = [
  { path: '', component: PayrollMasterComponent },
  { path: 'create-payrollMaster', component: CreatePayrollMasterComponent },
  {
    path: 'Runpayroll', component: RunpayrollComponent,
    resolve: {
      condition: CheckPermissionResolver
    }
  },
  {
    path: 'showRuns', component: ShowRunPayrollComponent,
  },

  {
    path: 'payslips', component: DowloadPayslipsComponent,
  }


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PayrollMasterRoutingModule { }

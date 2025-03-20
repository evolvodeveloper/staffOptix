import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CheckPermissionResolver } from 'src/app/authentication/guards/check-permission.resolver';
import { PayrollSetupMasterComponent } from './payroll-setup-master.component';

const routes: Routes = [
  {
    path: '',
    component: PayrollSetupMasterComponent,
  },
  {
    path: 'salaryStructure',
    loadChildren: () =>
      import('../payroll-setup-master/salarycmp/salarycmp.module'
      ).then((m) => m.SalarycmpModule), resolve: {
        condition: CheckPermissionResolver
      }

  },
  {
    path: 'rule_setup',
    loadChildren: () =>
      import('../payroll-setup-master/payrules-setup/payrules-setup.module'
      ).then((m) => m.PayrulesSetupModule), resolve: {
        condition: CheckPermissionResolver
      }
  },

  {
    path: 'payroll-setup',
    loadChildren: () =>
      import(
        '../payroll-setup-master/payroll-setup/payroll-setup.module'
      ).then((m) => m.PayrollTypesModule),
    resolve: {
      condition: CheckPermissionResolver
    }
  },
  {
    path: 'payrollcomponent',
    loadChildren: () =>
      import('../payroll-setup-master/payroll-component-list/payroll-component-list.module').then(
        (m) => m.PayrollComponentListModule
      ), resolve: {
        condition: CheckPermissionResolver
      }
  },
  {
    path: 'loanMaster',
    loadChildren: () =>
      import('./loan-master/loan-master.module'
      ).then((m) => m.LoanMasterModule), resolve: {
        condition: CheckPermissionResolver
      }

  },
  {
    path: 'expenseType',
    loadChildren: () =>
      import('../payroll-setup-master/expense-type/expense-type.module').then(
        (m) => m.ExpenseTypeModule
      ), resolve: {
        condition: CheckPermissionResolver
      }

  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PayrollSetupMasterRoutingModule { }

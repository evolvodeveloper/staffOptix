import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CheckPermissionResolver } from 'src/app/authentication/guards/check-permission.resolver';
import { ReportsComponent } from './reports.component';

const routes: Routes = [
  {
    path: '',
    component: ReportsComponent,
  },

  {
    path: 'leaveRpt',
    loadChildren: () =>
      import('./leave-report/leave-report.module').then(
        (m) => m.LeaveReportModule
      ),
    resolve: {
      condition: CheckPermissionResolver
    }
  },
  {
    path: 'AbsentRpt',
    loadChildren: () =>
      import('./absent-report/absent-report.module').then(
        (m) => m.AbsentReportModule
      ),
    resolve: {
      condition: CheckPermissionResolver
    }
  },
  {
    path: 'departmentWiseReport',
    loadChildren: () =>
      import('./department-wise-report/department-wise-report.module').then(
        (m) => m.DepartmentWiseReportModule
      ),
    resolve: {
      condition: CheckPermissionResolver
    }
  },
  {
    path: 'expenseRpt',
    loadChildren: () =>
      import('./expense-report/expense-report.module').then(
        (m) => m.ExpenseReportModule
      ),
    resolve: {
      condition: CheckPermissionResolver
    }
  },
  {
    path: 'empbankdetails',
    loadChildren: () =>
      import('./emp-bankinfo/emp-bankinfo.module').then(
        (m) => m.EmpBankinfoModule
      ),
    resolve: {
      condition: CheckPermissionResolver
    }
  },

  {
    path: 'dailyoutput',
    loadChildren: () =>
      import('./dailyoutput/dailyoutput.module').then(
        (m) => m.DailyoutputModule
      ),
    resolve: {
      condition: CheckPermissionResolver
    }
  },
  {
    path: 'AttSummaryReport',
    loadChildren: () =>
      import('./attendance-summary-report/attendance-summary-report.module').then(
        (m) => m.AttendanceSummaryReportModule
      ),
    resolve: {
      condition: CheckPermissionResolver
    }
  },
  {
    path: 'salarydetails',
    loadChildren: () =>
      import('./salarydetails/salarydetails.module').then(
        (m) => m.SalarydetailsModule
      ),
    resolve: {
      condition: CheckPermissionResolver
    }
  },
  {
    path: 'payrollDetails',
    loadChildren: () =>
      import('./payrolldetails/payrolldetails.module').then(
        (m) => m.PayrolldetailsModule
      ),
    resolve: {
      condition: CheckPermissionResolver
    }
  },
  {
    path: 'montlyAttReport',
    loadChildren: () =>
      import('./monthly-att-report/monthly-att-report.module').then(
        (m) => m.MonthlyAttReportModule
      ),
    resolve: {
      condition: CheckPermissionResolver
    }
  },
  {
    path: 'missingRpt',
    loadChildren: () =>
      import('./missing-swipes/missing-swipes.module').then(
        (m) => m.MissingSwipesModule
      ),
    resolve: {
      condition: CheckPermissionResolver
    }
  },
  {
    path: 'montlyAttByEmpReport',
    loadChildren: () =>
      import('./monthly-att-report/monthly-att-report.module').then(
        (m) => m.MonthlyAttReportModule
      ),
    resolve: {
      condition: CheckPermissionResolver
    }
  },
  {
    path: 'salarymaster',
    loadChildren: () =>
      import('./salary-master-report/salary-master-report.module').then(
        (m) => m.SalaryMasterReportModule
      ),
    resolve: {
      condition: CheckPermissionResolver
    }
  },
  {
    path: 'otReport',
    loadChildren: () =>
      import('./ot-report/ot-report.module').then(
        (m) => m.OtReportModule
      ),
    resolve: {
      condition: CheckPermissionResolver
    }
  },
  {
    path: 'presentdetails',
    loadChildren: () =>
      import('./present-report/present-report.module').then(
        (m) => m.PresentReportModule
      ),
    resolve: {
      condition: CheckPermissionResolver
    }
  },
  {
    path: 'earlylatedetails',
    loadChildren: () =>
      import('./early-late-reports/early-late-reports.module').then(
        (m) => m.EarlyLateReportsModule
      ),
    resolve: {
      condition: CheckPermissionResolver
    }
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule { }

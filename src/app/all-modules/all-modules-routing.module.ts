import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChangePswdComponent } from '../authentication/change-pswd/change-pswd.component';
import { AllModulesComponent } from './all-modules.component';
// import { Error404Component } from './error404/error404.component';
import { CheckPermissionResolver } from '../authentication/guards/check-permission.resolver';
const routes: Routes = [
  // {
  //   path: ,
  //   redirectTo: 'dashboard',
  //   pathMatch: 'full',
  // },
  // { path: 'pricing-plans', component: PricingPlansComponent },

  {
    path: '',
    component: AllModulesComponent,
    children: [
      { path: 'setup', loadChildren: () => import(`./setup/setup.module`).then(m => m.SetupModule) },

      { path: 'timesetup', loadChildren: () => import(`./timesetup-master/timesetup-master.module`).then(m => m.TimesetupMasterModule) },
      { path: 'payrollsetup', loadChildren: () => import(`./payroll-setup-master/payroll-setup-master.module`).then(m => m.PayrollSetupMasterModule) },
      { path: 'rpt', loadChildren: () => import(`./reports/reports.module`).then(m => m.ReportsModule) },
      {
        path: 'payroll-master', loadChildren: () => import('./payroll-master/payroll-master.module').then(
          (m) => m.PayrollMasterModule
        ),
        resolve: {
          condition: CheckPermissionResolver
        }
      },
      // OtEmployeesComponent
      {
        path: 'OtEmployees',
        loadChildren: () =>
          import('./ot-employees-list/ot-employees-list.module').then((m) => m.OtEmployeesListModule),
        // resolve: {
        //   condition: CheckPermissionResolver
        // }
      },


      {
        path: 'dashboard',
        loadChildren: () =>
          import('./dashboard/dashboard.module').then((m) => m.DashboardModule),
        // canActivate: [InitialRoutingGuard],
        resolve: {
          condition: CheckPermissionResolver
        }
      },

      {
        path: 'all-payroll-employees',
        loadChildren: () =>
          import('./all-payroll-employees/all-payroll-employees.module').then(
            (m) => m.AllPayrollEmployeesModule
          ),
        resolve: {
          condition: CheckPermissionResolver
        }
      },
      {
        path: 'empList',
        loadChildren: () =>
          import('./all-payroll-employees/all-payroll-employees.module').then(
            (m) => m.AllPayrollEmployeesModule
          ),
        resolve: {
          condition: CheckPermissionResolver
        }
      },
      {
        path: 'attendance',
        loadChildren: () =>
          import('./attendance/attendance.module').then(
            (m) => m.AttendanceModule
          ),
        resolve: {
          condition: CheckPermissionResolver
        }
      },
      {
        path: 'leavehistory',
        loadChildren: () =>
          import('./leaves/leave-history/leave-history.module').then(
            (m) => m.LeaveHistoryModule
          ),
        resolve: {
          condition: CheckPermissionResolver
        }
      },
      {
        path: 'loanApplication',
        loadChildren: () =>
          import('./apply-loanlist/apply-loanlist.module').then(
            (m) => m.ApplyLoanlistModule
          ),
        resolve: {
          condition: CheckPermissionResolver
        }
      },
      {
        path: 'Resignation',
        loadChildren: () =>
          import('./resignation-list/resignation-list.module').then(
            (m) => m.ResignationListModule
          ),
        resolve: {
          condition: CheckPermissionResolver
        }
      },
      {
        path: 'emp-profile',
        loadChildren: () =>
          import('./employee-profile/employee-profile.module').then(
            (m) => m.EmployeeProfileModule
          ),
      },
      {
        path: 'datasync',
        loadChildren: () =>
          import('./employeedata-sync/employeedata-sync.module').then(
            (m) => m.EmployeedataSyncModule
          ),
      },
      {
        path: 'employees-list',
        loadChildren: () =>
          import('./employees/employees.module').then((m) => m.EmployeesModule),
      },
      {
        path: 'user-list',
        loadChildren: () =>
          import('./user/user.module').then((m) => m.UserModule),
        resolve: {
          condition: CheckPermissionResolver
        }
      },
      {
        path: 'assignshifts',
        loadChildren: () =>
          import('./shifts/shifts.module').then((m) => m.ShiftsModule), resolve: {
            condition: CheckPermissionResolver
          }
      },
      { path: 'taxPart', loadChildren: () => import(`../tax-components/tax-components.module`).then(m => m.TaxComponentsModule) },
      {
        path: 'incomeTax', loadChildren: () => import(`../income-tax/income-tax.module`).then(m => m.IncomeTaxModule)
      },


      {
        path: 'dailyRoster',
        loadChildren: () =>
          import('./daily-roaster/daily-roaster.module').then(
            (m) => m.DailyRoasterModule
          ),
        resolve: {
          condition: CheckPermissionResolver
        }
      },

      {
        path: 'leavecalendar',
        loadChildren: () =>
          import('./leavecalendar/leavecalendar.module').then(
            (m) => m.LeavecalendarModule
          ),
        resolve: {
          condition: CheckPermissionResolver
        }
      },
      {
        path: 'expenses',
        loadChildren: () =>
          import('./employees/expenses-list/expenses-list.module').then(
            (m) => m.ExpensesListModule
          ),
        resolve: {
          condition: CheckPermissionResolver
        }
      },
      {
        path: 'offerletter',
        loadChildren: () =>
          import('./offer-letter/offer-letter.module').then((m) => m.OfferLetterModule),
        resolve: {
          condition: CheckPermissionResolver
        }
      },
      {
        path: 'bulk',
        loadChildren: () =>
          import('../all-modules/setup/bulk-uploads/bulk-uploads.module').then(
            (m) => m.BulkUploadsModule
          ),
      },

      {
        path: 'holidayCalendar',
        loadChildren: () =>
          import(
            './setup/create-holidaycalendar/holiday-calender/holiday-calender.module'
          ).then((m) => m.HolidayCalenderModule), resolve: {
            condition: CheckPermissionResolver
          }
      },
      {
        path: 'hierarchy',
        loadChildren: () =>
          import('./hierarchy/hierarchy.module').then(
            (m) => m.HierarchyModule
          ),
        // resolve: {
        //   condition: CheckPermissionResolver
        // }
      },
      {
        path: 'rolemapping',
        loadChildren: () =>
          import('./setup/user-role-mapping/user-role-mapping.module').then(
            (m) => m.UserRoleMappingModule
          ),
        resolve: {
          condition: CheckPermissionResolver
        }
      },
      { path: 'changepswd', component: ChangePswdComponent },

      // page not found error
      // { path: '**', component: Error404Component },
    ],
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AllModulesRoutingModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CheckPermissionResolver } from 'src/app/authentication/guards/check-permission.resolver';
import { AddPayrollEmployeeComponent } from './add-payroll-employee/add-payroll-employee.component';
import { AllPayrollEmployeesComponent } from './all-payroll-employees.component';
import { EmployeeListViewComponent } from './employee-list-view/employee-list-view.component';
import { EmployeeTimesheetComponent } from './employee-timesheet/employee-timesheet.component';
import { TimesheetLogComponent } from './timesheet-log/timesheet-log.component';

const routes: Routes = [
  {
    path: '',
    component: AllPayrollEmployeesComponent

  },
  {
    path: 'emp_timesheet',
    component: EmployeeTimesheetComponent,
    resolve: {
      condition: CheckPermissionResolver
    }
  },
  {
    path: 'timesheetlogs',
    component: TimesheetLogComponent,
    resolve: {
      condition: CheckPermissionResolver
    }
  },
  {
    path: 'addEmployee',
    component: AddPayrollEmployeeComponent,
  },
  {
    path: 'empListView',
    component: EmployeeListViewComponent,
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AllPayrollEmployeesRoutingModule { }

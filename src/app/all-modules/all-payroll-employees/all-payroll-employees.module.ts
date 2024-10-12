import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
// import { MatFormFieldModule } from '@angular/material/form-field';

// import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';

import { CdkStepperModule } from '@angular/cdk/stepper';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgStepperModule } from 'angular-ng-stepper';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedModule } from 'src/app/shared/shared.module';
import { AddPayrollEmployeeComponent } from './add-payroll-employee/add-payroll-employee.component';
import { AllPayrollEmployeesRoutingModule } from './all-payroll-employees-routing.module';
import { AllPayrollEmployeesComponent } from './all-payroll-employees.component';
import { EmployeeListViewComponent } from './employee-list-view/employee-list-view.component';
import { EmployeeTimesheetComponent } from './employee-timesheet/employee-timesheet.component';
import { ProfilePicComponent } from './profile-pic/profile-pic.component';
import { TimesheetLogComponent } from './timesheet-log/timesheet-log.component';




@NgModule({
  declarations: [AllPayrollEmployeesComponent,
    TimesheetLogComponent, EmployeeTimesheetComponent, EmployeeListViewComponent,
    AddPayrollEmployeeComponent, ProfilePicComponent],
  imports: [
    NgSelectModule,
    CommonModule, NgxPaginationModule,
    AllPayrollEmployeesRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatNativeDateModule,
    SharedModule,
    MatProgressBarModule,
    MatInputModule,
    MatMomentDateModule,
    MatFormFieldModule,
    NgxDaterangepickerMd.forRoot(),
    MatDialogModule,
    MatButtonModule,
    MatMenuModule,
    CdkStepperModule,
    NgStepperModule,
    MatDatepickerModule,
  ],
  providers: [
    MatDatepickerModule,
    MatDatepicker, NgbActiveModal,
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatDialogRef, useValue: {} }
  ],

  schemas: [CUSTOM_ELEMENTS_SCHEMA],

})
export class AllPayrollEmployeesModule { }

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgxEchartsModule } from 'ngx-echarts';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSpinnerModule } from "ngx-spinner";
import { AdminAttendanceComponent } from './admin-attendance/attendance-summary.component';
import { AttendanceModelComponent } from './attendance-model/attendance-model.component';
import { AttendanceRoutingModule } from './attendance-routing.module';
import { EmployeeDashboardComponent } from './employee-dashboard/employee-dashboard.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSliderModule } from '@angular/material/slider';
import { SharedModule } from 'src/app/shared/shared.module';
@NgModule({
  declarations: [
    AdminAttendanceComponent,
    EmployeeDashboardComponent,
    AttendanceModelComponent,
  ],
  imports: [
    CommonModule,
    AttendanceRoutingModule,
    MatFormFieldModule,
    SharedModule,
    NgxPaginationModule,
    MatSliderModule, MatProgressSpinnerModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    MatTooltipModule,
    ReactiveFormsModule,
    MatTooltipModule,
    FormsModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts'),
    }),
    NgxSpinnerModule.forRoot({ type: 'ball-scale-multiple' })
  ]
})
export class AttendanceModule { }

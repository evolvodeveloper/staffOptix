import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { DepartmentWiseReportRoutingModule } from './department-wise-report-routing.module';
import { DepartmentWiseReportComponent } from './department-wise-report.component';


@NgModule({
  declarations: [DepartmentWiseReportComponent],
  imports: [
    CommonModule,
    FormsModule,
    NgxPaginationModule,
    ReactiveFormsModule,
    DepartmentWiseReportRoutingModule
  ]
})
export class DepartmentWiseReportModule { }

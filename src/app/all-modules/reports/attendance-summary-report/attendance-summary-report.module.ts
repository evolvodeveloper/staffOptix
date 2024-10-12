import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { NgxPaginationModule } from 'ngx-pagination';
import { AttendanceSummaryReportRoutingModule } from './attendance-summary-report-routing.module';
import { AttendanceSummaryReportComponent } from './attendance-summary-report.component';


@NgModule({
  declarations: [AttendanceSummaryReportComponent],
  imports: [
    CommonModule,
    NgSelectModule,
    FormsModule,
    NgxPaginationModule,
    NgxDaterangepickerMd.forRoot(),
    AttendanceSummaryReportRoutingModule
  ]
})
export class AttendanceSummaryReportModule { }

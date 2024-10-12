import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { LeaveReportRoutingModule } from './leave-report-routing.module';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { LeaveReportComponent } from './leave-report.component';

@NgModule({
  declarations: [LeaveReportComponent],
  imports: [
    CommonModule,
    FormsModule,
    NgxPaginationModule,
    NgSelectModule,
    NgxDaterangepickerMd.forRoot(),
    ReactiveFormsModule,
    LeaveReportRoutingModule
  ]
})
export class LeaveReportModule { }

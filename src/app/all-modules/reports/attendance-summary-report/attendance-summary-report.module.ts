import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { CdkDrag, CdkDragPlaceholder, CdkDropList, DragDropModule } from '@angular/cdk/drag-drop';
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
    CdkDrag,
    FormsModule, CdkDragPlaceholder, CdkDropList, DragDropModule,
    NgxPaginationModule,
    NgxDaterangepickerMd.forRoot(),
    AttendanceSummaryReportRoutingModule
  ]
})
export class AttendanceSummaryReportModule { }

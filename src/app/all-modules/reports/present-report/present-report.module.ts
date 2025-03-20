import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedModule } from 'src/app/shared/shared.module';
import { PresentReportRoutingModule } from './present-report-routing.module';
import { PresentReportComponent } from './present-report.component';

import { CdkDrag, CdkDragPlaceholder, CdkDropList, DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
  declarations: [
    PresentReportComponent
  ],
  imports: [
    CommonModule,
    PresentReportRoutingModule, NgSelectModule,
    CdkDrag, CdkDragPlaceholder, CdkDropList, DragDropModule,
    FormsModule,
    SharedModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    NgxDaterangepickerMd.forRoot(),
  ]
})
export class PresentReportModule { }

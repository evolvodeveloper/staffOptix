import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';

import { CdkDrag, CdkDragPlaceholder, CdkDropList, DragDropModule } from '@angular/cdk/drag-drop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { AbsentReportRoutingModule } from './absent-report-routing.module';
import { AbsentReportComponent } from './absent-report.component';


@NgModule({
  declarations: [AbsentReportComponent],
  imports: [
    CommonModule,
    MatTableModule,
    NgSelectModule,
    DragDropModule,
    MatInputModule,
    NgxDaterangepickerMd.forRoot(),
    CdkDrag, CdkDragPlaceholder, CdkDropList,
    NgxPaginationModule,
    FormsModule,ReactiveFormsModule,
    AbsentReportRoutingModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],

})
export class AbsentReportModule { }

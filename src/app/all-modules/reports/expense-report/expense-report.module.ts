import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { CdkDrag, CdkDragPlaceholder, CdkDropList, DragDropModule } from '@angular/cdk/drag-drop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { NgxPaginationModule } from 'ngx-pagination';
import { ExpenseReportRoutingModule } from './expense-report-routing.module';
import { ExpenseReportComponent } from './expense-report.component';


@NgModule({
  declarations: [
    ExpenseReportComponent
  ],
  imports: [NgSelectModule,
    CommonModule,
    FormsModule, CdkDrag, CdkDragPlaceholder, CdkDropList, DragDropModule,
    NgxPaginationModule,
    NgxDaterangepickerMd.forRoot(),
    ReactiveFormsModule,
    ExpenseReportRoutingModule
  ]
})
export class ExpenseReportModule { }

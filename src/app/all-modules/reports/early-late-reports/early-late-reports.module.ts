import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedModule } from 'src/app/shared/shared.module';
import { EarlyLateReportsRoutingModule } from './early-late-reports-routing.module';
import { EarlyLateReportsComponent } from './early-late-reports.component';

import { CdkDrag, CdkDragPlaceholder, CdkDropList, DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
  declarations: [EarlyLateReportsComponent],
  imports: [
    CommonModule, NgxPaginationModule, FormsModule, CdkDrag, CdkDragPlaceholder, CdkDropList, DragDropModule, NgSelectModule,
    NgxDaterangepickerMd.forRoot(),
    EarlyLateReportsRoutingModule,
    SharedModule
  ]
})
export class EarlyLateReportsModule { }

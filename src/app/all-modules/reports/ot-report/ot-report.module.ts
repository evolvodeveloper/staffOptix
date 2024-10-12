import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedModule } from 'src/app/shared/shared.module';
import { OtReportRoutingModule } from './ot-report-routing.module';
import { OtReportComponent } from './ot-report.component';

@NgModule({
  declarations: [OtReportComponent],
  imports: [
    CommonModule,
    SharedModule,
    OtReportRoutingModule, NgSelectModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    NgxDaterangepickerMd.forRoot(),

  ]
})
export class OtReportModule { }

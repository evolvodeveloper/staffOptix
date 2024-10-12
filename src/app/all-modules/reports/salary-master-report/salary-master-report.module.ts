import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { NgxPaginationModule } from 'ngx-pagination';
import { SalaryMasterReportRoutingModule } from './salary-master-report-routing.module';
import { SalaryMasterReportComponent } from './salary-master-report.component';


@NgModule({
  declarations: [SalaryMasterReportComponent],
  imports: [
    CommonModule,
    FormsModule,
    SalaryMasterReportRoutingModule, NgSelectModule,
    NgxPaginationModule,
    NgxDaterangepickerMd.forRoot(),
  ]
})
export class SalaryMasterReportModule { }

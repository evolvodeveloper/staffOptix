import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedModule } from 'src/app/shared/shared.module';
import { MonthlyAttReportRoutingModule } from './monthly-att-report-routing.module';
import { MonthlyAttReportComponent } from './monthly-att-report.component';


@NgModule({
  declarations: [MonthlyAttReportComponent],
  imports: [
    CommonModule,
    NgSelectModule,
    MonthlyAttReportRoutingModule,
    NgxPaginationModule,
    SharedModule,
    FormsModule, ReactiveFormsModule,
  ],
  providers: [
    NgbActiveModal
  ],
})
export class MonthlyAttReportModule { }

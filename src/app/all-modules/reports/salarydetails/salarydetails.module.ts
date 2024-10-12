import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { NgxPaginationModule } from 'ngx-pagination';
import { SalarydetailsRoutingModule } from './salarydetails-routing.module';
import { SalarydetailsComponent } from './salarydetails.component';

@NgModule({
  declarations: [SalarydetailsComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SalarydetailsRoutingModule, NgSelectModule,
    NgxPaginationModule,
    NgxDaterangepickerMd.forRoot(),
  ],
})
export class SalarydetailsModule {}

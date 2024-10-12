import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { NgxPaginationModule } from 'ngx-pagination';
import { PayrolldetailsRoutingModule } from './payrolldetails-routing.module';
import { PayrolldetailsComponent } from './payrolldetails.component';

@NgModule({
  declarations: [PayrolldetailsComponent],
  imports: [
    CommonModule,
    PayrolldetailsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule, NgSelectModule,
    NgxDaterangepickerMd.forRoot(),
  ]
})
export class PayrolldetailsModule { }

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { NgxPaginationModule } from 'ngx-pagination';
import { EmpBankinfoRoutingModule } from './emp-bankinfo-routing.module';
import { EmpBankinfoComponent } from './emp-bankinfo.component';

@NgModule({
  declarations: [EmpBankinfoComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgSelectModule,
    EmpBankinfoRoutingModule,
    NgxPaginationModule,
    FormsModule,
    NgxDaterangepickerMd.forRoot(),
  ]
})
export class EmpBankinfoModule { }

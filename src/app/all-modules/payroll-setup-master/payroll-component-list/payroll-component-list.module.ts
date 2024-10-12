import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedModule } from 'src/app/shared/shared.module';
import { PayrollComponentListRoutingModule } from './payroll-component-list-routing.module';
import { PayrollComponentListComponent } from './payroll-component-list.component';


@NgModule({
  declarations: [
    PayrollComponentListComponent
  ],
  imports: [
    CommonModule,
    PayrollComponentListRoutingModule,
    ReactiveFormsModule,
    SharedModule,
    FormsModule,
    NgxPaginationModule,
  ]
})
export class PayrollComponentListModule { }

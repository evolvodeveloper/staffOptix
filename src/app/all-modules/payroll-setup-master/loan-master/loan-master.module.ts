import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedModule } from 'src/app/shared/shared.module';
import { CreateLoanMasterComponent } from './create-loan-master/create-loan-master.component';
import { LoanMasterRoutingModule } from './loan-master-routing.module';
import { LoanMasterComponent } from './loan-master.component';


@NgModule({
  declarations: [LoanMasterComponent, CreateLoanMasterComponent],
  imports: [
    CommonModule,
    FormsModule,
    NgxPaginationModule,
    SharedModule,
    ReactiveFormsModule,
    LoanMasterRoutingModule
  ]
})
export class LoanMasterModule { }

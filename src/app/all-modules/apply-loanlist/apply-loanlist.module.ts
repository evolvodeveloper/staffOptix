import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedModule } from 'src/app/shared/shared.module';
import { ApplyLoanComponent } from './apply-loan/apply-loan.component';
import { ApplyLoanlistRoutingModule } from './apply-loanlist-routing.module';
import { ApplyLoanlistComponent } from './apply-loanlist.component';


@NgModule({
  declarations: [ApplyLoanComponent, ApplyLoanlistComponent],
  imports: [
    CommonModule,
    FormsModule, ReactiveFormsModule,
    ApplyLoanlistRoutingModule,
    NgxPaginationModule,
    SharedModule,
  ],
  providers: [
    NgbActiveModal
  ],
})
export class ApplyLoanlistModule { }

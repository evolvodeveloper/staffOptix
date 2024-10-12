import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { SharedModule } from 'src/app/shared/shared.module';
import { BranchDetailsRoutingModule } from './branch-details-routing.module';
import { BranchDetailsComponent } from './branch-details.component';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';


@NgModule({
  declarations: [BranchDetailsComponent],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    NgSelectModule,
    ReactiveFormsModule,
    BranchDetailsRoutingModule
  ],

  providers: [
    NgbActiveModal
  ]

})
export class BranchDetailsModule { }

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedModule } from 'src/app/shared/shared.module';
import { CreateLeaveSetupComponent } from './create-leave-setup/create-leave-setup.component';
import { LeaveSetupRoutingModule } from './leave-setup-routing.module';
import { LeaveSetupComponent } from './leave-setup.component';

@NgModule({
  declarations: [LeaveSetupComponent, CreateLeaveSetupComponent],
  providers: [
    NgbActiveModal,
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    NgxPaginationModule,

    ReactiveFormsModule,
    LeaveSetupRoutingModule,
  ],
})
export class LeaveSetupModule { }

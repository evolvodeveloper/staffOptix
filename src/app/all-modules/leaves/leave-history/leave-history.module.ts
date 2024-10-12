import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedModule } from 'src/app/shared/shared.module';
import { ApplyLeaveComponent } from '../apply-leave/apply-leave.component';
import { LeaveHistoryRoutingModule } from './leave-history-routing.module';
import { LeaveHistoryComponent } from './leave-history.component';
@NgModule({
  declarations: [LeaveHistoryComponent, ApplyLeaveComponent],

  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    NgxPaginationModule,
    MatDialogModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    NgxPaginationModule,
    ReactiveFormsModule,
    SharedModule,
    LeaveHistoryRoutingModule,
  ],

  providers: [
    MatDatepickerModule,
  ],
})
export class LeaveHistoryModule { }

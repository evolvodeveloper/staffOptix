import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { LeavecalendarRoutingModule } from './leavecalendar-routing.module';
import { LeavecalendarComponent } from './leavecalendar.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedModule } from 'src/app/shared/shared.module';
@NgModule({
  declarations: [LeavecalendarComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule, FormsModule,
    CommonModule, NgxPaginationModule,
    MatFormFieldModule, MatInputModule,
    MatDatepickerModule, SharedModule,
    LeavecalendarRoutingModule
  ]
})
export class LeavecalendarModule { }

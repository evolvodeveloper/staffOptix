import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ExpenseTypeRoutingModule } from './expense-type-routing.module';
import { ExpenseTypeComponent } from './expense-type.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [ExpenseTypeComponent],
  imports: [
    CommonModule,
    ExpenseTypeRoutingModule,
    ReactiveFormsModule,
    SharedModule,
    NgxPaginationModule,
    FormsModule
  ]
})
export class ExpenseTypeModule { }

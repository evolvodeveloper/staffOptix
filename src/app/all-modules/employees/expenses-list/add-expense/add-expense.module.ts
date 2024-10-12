import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { AddExpenseRoutingModule } from './add-expense-routing.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    AddExpenseRoutingModule,
    ReactiveFormsModule,
    SharedModule,
    FormsModule,
  ]
})
export class AddExpenseModule { }

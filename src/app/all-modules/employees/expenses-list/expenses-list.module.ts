import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedModule } from 'src/app/shared/shared.module';
import { AddExpenseComponent } from './add-expense/add-expense.component';
import { ExpensesListRoutingModule } from './expenses-list-routing.module';
import { ExpensesListComponent } from './expenses-list.component';


@NgModule({
  declarations: [
    AddExpenseComponent,
    ExpensesListComponent,
  ],
  imports: [
    CommonModule,
    ExpensesListRoutingModule,
    FormsModule,
    SharedModule,
    ReactiveFormsModule,
    NgxPaginationModule,
  ]
})
export class ExpensesListModule { }

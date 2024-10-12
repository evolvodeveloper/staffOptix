import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExpensesListComponent } from './expenses-list.component';
import { AddExpenseComponent } from './add-expense/add-expense.component';

const routes: Routes = [
  {
    path: '',
    component: ExpensesListComponent,
  },
  {
    path: 'add-expense',
    component: AddExpenseComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExpensesListRoutingModule { }

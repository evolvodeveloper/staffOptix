import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AddExpenseComponent } from "../employees/expenses-list/add-expense/add-expense.component";
import { EmployeeProfileComponent } from "./employee-profile.component";

const routes: Routes = [
  {
    path: "",
    component: EmployeeProfileComponent
  },
  {
    path: "add-expense",
    component: AddExpenseComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EmployeeProfileRoutingModule {}

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdhocAllowanceComponent } from './adhoc-allowance/adhoc-allowance.component';
import { OtEmployeesListComponent } from './ot-employees-list.component';
import { OtEmployeesComponent } from './ot-employees/ot-employees.component';

const routes: Routes = [
  { path: '', component: OtEmployeesListComponent },
  { path: 'otEmp', component: OtEmployeesComponent },

  { path: 'adhocAllowance', component: AdhocAllowanceComponent }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OtEmployeesListRoutingModule { }

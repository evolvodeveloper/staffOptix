import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AdhocAllowanceComponent } from './adhoc-allowance/adhoc-allowance.component';
import { OtEmployeesListRoutingModule } from './ot-employees-list-routing.module';
import { OtEmployeesListComponent } from './ot-employees-list.component';
import { OtEmployeesComponent } from './ot-employees/ot-employees.component';

import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  declarations: [OtEmployeesComponent, AdhocAllowanceComponent, OtEmployeesListComponent],
  imports: [
    CommonModule,
    FormsModule, ReactiveFormsModule,
    OtEmployeesListRoutingModule, NgxPaginationModule
  ],
  providers: [
    NgbActiveModal
  ],
})
export class OtEmployeesListModule { }

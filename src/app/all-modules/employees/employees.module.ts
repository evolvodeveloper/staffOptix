import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedModule } from 'src/app/shared/shared.module';
import { CreateEmployeeComponent } from './create-employee/create-employee.component';
import { EmployeesRoutingModule } from './employees-routing.module';
import { EmployeesComponent } from './employees.component';


@NgModule({
  declarations: [
    EmployeesComponent, CreateEmployeeComponent, 
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule, FormsModule,
    SharedModule,
    EmployeesRoutingModule,
    NgxPaginationModule,

  ]
})
export class EmployeesModule { }

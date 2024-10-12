import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedModule } from 'src/app/shared/shared.module';
import { CreateDepartmentComponent } from '../create-department.component';
import { DepartmentRoutingModule } from './department-routing.module';
import { DepartmentComponent } from './department.component';

@NgModule({
  declarations: [DepartmentComponent, CreateDepartmentComponent],
  imports: [
    CommonModule,
    NgxPaginationModule,
    FormsModule,
    SharedModule,
    ReactiveFormsModule,
    DepartmentRoutingModule,
  ],
})
export class DepartmentModule {}

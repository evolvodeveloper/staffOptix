import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { EmployeedataSyncRoutingModule } from './employeedata-sync-routing.module';
import { EmployeedataSyncComponent } from './employeedata-sync.component';


@NgModule({
  declarations: [EmployeedataSyncComponent],
  imports: [
    CommonModule,
    FormsModule,
    EmployeedataSyncRoutingModule
  ]
})
export class EmployeedataSyncModule { }

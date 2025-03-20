import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { CdkDrag, CdkDragPlaceholder, CdkDropList } from '@angular/cdk/drag-drop';
import { NgxPaginationModule } from 'ngx-pagination';
import { EmployeeInformationRoutingModule } from './employee-information-routing.module';
import { EmployeeInformationComponent } from './employee-information.component';


@NgModule({
  declarations: [EmployeeInformationComponent],
  imports: [
    CommonModule, NgxPaginationModule,    CdkDrag, CdkDragPlaceholder, CdkDropList,
    
    EmployeeInformationRoutingModule
  ]
})
export class EmployeeInformationModule { }

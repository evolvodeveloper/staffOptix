import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedModule } from 'src/app/shared/shared.module';
import { AssignShiftComponent } from './assign-shift/assign-shift.component';
import { ShiftsRoutingModule } from './shifts-routing.module';
import { ShiftsComponent } from './shifts.component';

@NgModule({
  declarations: [
    ShiftsComponent,
    AssignShiftComponent
  ],
  imports: [
    CommonModule,
    ShiftsRoutingModule,
    SharedModule,
    NgxPaginationModule,
    NgSelectModule
  ]
})
export class ShiftsModule { }

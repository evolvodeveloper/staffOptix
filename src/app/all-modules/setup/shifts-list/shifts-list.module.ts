import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedModule } from 'src/app/shared/shared.module';
import { AddShiftsComponent } from './add-shifts/add-shifts.component';
import { ShiftsListRoutingModule } from './shifts-list-routing.module';
import { ShiftsListComponent } from './shifts-list.component';

@NgModule({
  declarations: [ShiftsListComponent, AddShiftsComponent],
  imports: [CommonModule, NgxPaginationModule, SharedModule, ShiftsListRoutingModule],
})
export class ShiftsListModule { }

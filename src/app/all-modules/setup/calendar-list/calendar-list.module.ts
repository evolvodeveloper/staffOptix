import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CalendarListRoutingModule } from './calendar-list-routing.module';

import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedModule } from 'src/app/shared/shared.module';
import { CalendarListComponent } from './calendar-list.component';
import { CalendarComponent } from './calendar/calendar.component';

@NgModule({
  declarations: [CalendarListComponent, CalendarComponent],
  imports: [
    CommonModule,
    FormsModule,
    NgxPaginationModule,
    ReactiveFormsModule,
    CalendarListRoutingModule,
    SharedModule,
    MatSlideToggleModule,
    NgSelectModule,
  ],
})
export class CalendarListModule {}

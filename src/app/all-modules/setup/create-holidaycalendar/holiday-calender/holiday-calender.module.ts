import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedModule } from 'src/app/shared/shared.module';
import { CreateHolidaycalendarComponent } from '../create-holidaycalendar.component';
import { HolidayCalenderRoutingModule } from './holiday-calender-routing.module';
import { HolidayCalenderComponent } from './holiday-calender.component';

@NgModule({
  declarations: [HolidayCalenderComponent, CreateHolidaycalendarComponent],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    HolidayCalenderRoutingModule,
  ],
})
export class HolidayCalenderModule {}

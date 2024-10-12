import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { NgxPaginationModule } from 'ngx-pagination';
import { DailyoutputRoutingModule } from './dailyoutput-routing.module';
import { DailyoutputComponent } from './dailyoutput.component';

@NgModule({
  declarations: [DailyoutputComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    NgxDaterangepickerMd.forRoot(),
    DailyoutputRoutingModule,
  ],
})
export class DailyoutputModule {}

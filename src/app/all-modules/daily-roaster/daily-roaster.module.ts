import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgxEchartsModule } from 'ngx-echarts';
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedModule } from 'src/app/shared/shared.module';
import { DailyRoasterRoutingModule } from './daily-roaster-routing.module';
import { DailyRoasterComponent } from './daily-roaster.component';
import { ShiftmodifyModalComponent } from './shiftmodify-modal/shiftmodify-modal.component';

@NgModule({
  declarations: [DailyRoasterComponent, ShiftmodifyModalComponent],
  imports: [
    ReactiveFormsModule, FormsModule,
    CommonModule, NgxPaginationModule, SharedModule,
    MatFormFieldModule, MatInputModule,
    MatDatepickerModule,
    DailyRoasterRoutingModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts'),
    }),

  ],
  // schemas: [CUSTOM_ELEMENTS_SCHEMA],

})
export class DailyRoasterModule { }

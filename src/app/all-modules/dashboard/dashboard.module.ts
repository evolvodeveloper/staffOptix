import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxEchartsModule } from 'ngx-echarts';
import { SharedModule } from 'src/app/shared/shared.module';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { LoadMoreComponent } from './load-more/load-more.component';

@NgModule({
  declarations: [DashboardComponent, LoadMoreComponent],
  imports: [
    CommonModule,
    SharedModule,
    DashboardRoutingModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts'),
    }),
    FormsModule,
    ReactiveFormsModule,
    // NgxDaterangepickerMd.forRoot()
  ],
})
export class DashboardModule {}

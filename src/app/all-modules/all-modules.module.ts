import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { NgxPaginationModule } from 'ngx-pagination';

import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HeaderComponent } from '../header/header.component';
import { SharedModule } from '../shared/shared.module';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { AllModulesRoutingModule } from './all-modules-routing.module';
import { AllModulesComponent } from './all-modules.component';

@NgModule({
  declarations: [
    AllModulesComponent,
    HeaderComponent,
    SidebarComponent,

    // Error404Component,
  ],
  imports: [
    AllModulesRoutingModule,
    FormsModule,
    SharedModule,
    MatSelectModule,
    MatTooltipModule,
    CommonModule,
    NgxPaginationModule,
    MatTooltipModule,
    ReactiveFormsModule,
    NgxDaterangepickerMd.forRoot(),
    // PerfectScrollbarModule,
  ],


  providers: [
    // {
    //   provide: PERFECT_SCROLLBAR_CONFIG,
    //   useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG,
    // },
  ],

  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AllModulesModule { }

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { MissingSwipesRoutingModule } from './missing-swipes-routing.module';
import { MissingSwipesComponent } from './missing-swipes.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  declarations: [MissingSwipesComponent],
  imports: [
    CommonModule,
    FormsModule,
    NgxPaginationModule,
    NgSelectModule,
    NgxDaterangepickerMd.forRoot(),
    ReactiveFormsModule,
    MissingSwipesRoutingModule
  ]
})
export class MissingSwipesModule { }

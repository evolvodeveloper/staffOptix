import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VisitMappingRoutingModule } from './visit-mapping-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedModule } from 'src/app/shared/shared.module';
import { VisitMappingComponent } from './visit-mapping.component';


@NgModule({
  declarations: [
    VisitMappingComponent
  ],
  imports: [
    CommonModule,
    VisitMappingRoutingModule,
    SharedModule,
    NgxPaginationModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class VisitMappingModule { }

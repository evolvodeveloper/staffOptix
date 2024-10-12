import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CreateMappingRoutingModule } from './create-mapping-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { CreateMappingComponent } from './create-mapping.component';


@NgModule({
  declarations: [CreateMappingComponent],
  imports: [
    CommonModule,
    CreateMappingRoutingModule,
    SharedModule,
    NgxPaginationModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class CreateMappingModule { }

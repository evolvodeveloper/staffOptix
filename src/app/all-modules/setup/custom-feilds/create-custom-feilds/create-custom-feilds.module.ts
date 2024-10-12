import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CreateCustomFeildsRoutingModule } from './create-custom-feilds-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedModule } from 'src/app/shared/shared.module';
import { CreateCustomFeildsComponent } from './create-custom-feilds.component';


@NgModule({
  declarations: [CreateCustomFeildsComponent],
  imports: [
    CommonModule,
    CreateCustomFeildsRoutingModule,
    SharedModule,
    NgxPaginationModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class CreateCustomFeildsModule { }

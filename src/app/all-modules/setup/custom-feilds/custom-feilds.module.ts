import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CustomFeildsRoutingModule } from './custom-feilds-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedModule } from 'src/app/shared/shared.module';
import { CustomFeildsComponent } from './custom-feilds.component';
import { CreateCustomFeildsComponent } from './create-custom-feilds/create-custom-feilds.component';


@NgModule({
  declarations: [
    CustomFeildsComponent
  ],
  imports: [
    CommonModule,
    CustomFeildsRoutingModule,
    SharedModule,
    NgxPaginationModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class CustomFeildsModule { }

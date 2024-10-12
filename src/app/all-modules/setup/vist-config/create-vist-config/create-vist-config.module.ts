import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CreateVistConfigRoutingModule } from './create-vist-config-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedModule } from 'src/app/shared/shared.module';
import { CreateVistConfigComponent } from './create-vist-config.component';


@NgModule({
  declarations: [CreateVistConfigComponent],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    NgxPaginationModule,
    ReactiveFormsModule,
    CreateVistConfigRoutingModule
  ]
})
export class CreateVistConfigModule { }

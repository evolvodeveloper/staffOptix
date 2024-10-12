import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VistConfigRoutingModule } from './vist-config-routing.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { VistConfigComponent } from './vist-config.component';


@NgModule({
  declarations: [VistConfigComponent],
  imports: [
    CommonModule,
    VistConfigRoutingModule,
    SharedModule,
    NgxPaginationModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class VistConfigModule { }

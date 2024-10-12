import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedModule } from 'src/app/shared/shared.module';
import { CreateDesignationComponent } from '../create-designation.component';
import { DesignationRoutingModule } from './designation-routing.module';
import { DesignationComponent } from './designation.component';

@NgModule({
  declarations: [DesignationComponent, CreateDesignationComponent],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    NgxPaginationModule,
    ReactiveFormsModule,
    DesignationRoutingModule,
  ],
})
export class DesignationModule {}

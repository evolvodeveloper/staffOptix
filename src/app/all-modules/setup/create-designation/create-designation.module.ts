import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { CreateDesignationRoutingModule } from './create-designation-routing.module';
// import { CreateDesignationComponent } from './create-designation.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    CreateDesignationRoutingModule,
  ],
})
export class CreateDesignationModule {}

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { WorkFromHomeSetupRoutingModule } from './work-from-home-setup-routing.module';
import { WorkFromHomeSetupComponent } from './work-from-home-setup.component';


@NgModule({
  declarations: [WorkFromHomeSetupComponent],
  imports: [
    CommonModule,
    WorkFromHomeSetupRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
  ]
})
export class WorkFromHomeSetupModule { }

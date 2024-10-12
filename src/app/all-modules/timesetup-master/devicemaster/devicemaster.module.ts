import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { DevicemasterRoutingModule } from './devicemaster-routing.module';
import { DevicemasterComponent } from './devicemaster.component';


@NgModule({
  declarations: [DevicemasterComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    DevicemasterRoutingModule
  ]
})
export class DevicemasterModule { }

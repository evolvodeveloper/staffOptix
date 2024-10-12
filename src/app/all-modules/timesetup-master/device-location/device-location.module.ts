import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { SharedModule } from 'src/app/shared/shared.module';
import { CreateDeviceLocationComponent } from './create-device-location/create-device-location.component';
import { DeviceLocationRoutingModule } from './device-location-routing.module';
import { DeviceLocationComponent } from './device-location.component';


@NgModule({
  declarations: [DeviceLocationComponent, CreateDeviceLocationComponent],
  imports: [
    CommonModule,
    NgSelectModule,
    DeviceLocationRoutingModule,
    ReactiveFormsModule,
    SharedModule,
    FormsModule
  ]
})
export class DeviceLocationModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateDeviceLocationComponent } from './create-device-location/create-device-location.component';
import { DeviceLocationComponent } from './device-location.component';

const routes: Routes = [
  { path: '', component: DeviceLocationComponent },
  { path: 'add_deviceLoc', component: CreateDeviceLocationComponent },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DeviceLocationRoutingModule { }

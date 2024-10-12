import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DevicemasterComponent } from './devicemaster.component';

const routes: Routes = [

  { path: '', component: DevicemasterComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DevicemasterRoutingModule { }

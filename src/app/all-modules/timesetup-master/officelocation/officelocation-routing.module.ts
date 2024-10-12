import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateOfficelocationComponent } from './create-officelocation/create-officelocation.component';
import { OfficelocationComponent } from './officelocation.component';

const routes: Routes = [
  { path: '', component: OfficelocationComponent },
  { path: 'addOfficeLoc', component: CreateOfficelocationComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OfficelocationRoutingModule { }

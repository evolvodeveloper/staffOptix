import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateTrackingPolicySetupComponent } from './create-tracking-policy-setup/create-tracking-policy-setup.component';
import { TrackingPolicySetupComponent } from './tracking-policy-setup.component';

const routes: Routes = [
  { path: '', component: TrackingPolicySetupComponent },
  { path: 'tpc', component: CreateTrackingPolicySetupComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TrackingPolicySetupRoutingModule { }

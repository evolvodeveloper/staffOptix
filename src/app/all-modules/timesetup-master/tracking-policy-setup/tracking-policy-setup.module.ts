import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { CreateTrackingPolicySetupComponent } from './create-tracking-policy-setup/create-tracking-policy-setup.component';
import { TrackingPolicySetupRoutingModule } from './tracking-policy-setup-routing.module';
import { TrackingPolicySetupComponent } from './tracking-policy-setup.component';


@NgModule({
  declarations: [TrackingPolicySetupComponent, CreateTrackingPolicySetupComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    TrackingPolicySetupRoutingModule
  ]
})
export class TrackingPolicySetupModule { }

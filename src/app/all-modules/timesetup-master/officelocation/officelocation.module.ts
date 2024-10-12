import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { CdkStepperModule } from '@angular/cdk/stepper';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgStepperModule } from 'angular-ng-stepper';
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedModule } from 'src/app/shared/shared.module';
import { CreateOfficelocationComponent } from './create-officelocation/create-officelocation.component';
import { OfficelocationRoutingModule } from './officelocation-routing.module';
import { OfficelocationComponent } from './officelocation.component';

@NgModule({
  declarations: [OfficelocationComponent, CreateOfficelocationComponent],
  imports: [
    CommonModule,
    CdkStepperModule,
    NgStepperModule,
    NgxPaginationModule,
    NgSelectModule,
    SharedModule,
    ReactiveFormsModule, FormsModule,
    OfficelocationRoutingModule
  ],
  providers: [
    NgbActiveModal
  ],
})
export class OfficelocationModule { }

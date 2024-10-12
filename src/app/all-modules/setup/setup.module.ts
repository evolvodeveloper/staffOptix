import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { CdkStepperModule } from '@angular/cdk/stepper';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SharedModule } from 'src/app/shared/shared.module';
import { SetupRoutingModule } from './setup-routing.module';
import { SetupComponent } from './setup.component';


@NgModule({
  declarations: [
    SetupComponent,

  ],
  imports: [
    CommonModule, SharedModule,
    SetupRoutingModule, CdkStepperModule,
  ],
  providers: [
    MatDatepickerModule,
    MatDatepicker,
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatDialogRef, useValue: {} }
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],

})
export class SetupModule { }

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { CdkStepperModule } from '@angular/cdk/stepper';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgStepperModule } from 'angular-ng-stepper';
import { EmployeeListRoutingModule } from './employee-list-routing.module';
import { Register2Component } from './register2/register2.component';


@NgModule({
  declarations: [Register2Component],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CdkStepperModule,
    NgStepperModule,
    EmployeeListRoutingModule
  ]
})
export class EmployeeListModule { }

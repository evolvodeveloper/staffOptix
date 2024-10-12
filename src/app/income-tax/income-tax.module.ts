import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IncomeTaxRoutingModule } from './income-tax-routing.module';
import { IncomeTaxComponent } from './income-tax.component';


@NgModule({
  declarations: [IncomeTaxComponent],
  imports: [
    CommonModule,
    FormsModule, ReactiveFormsModule,
    IncomeTaxRoutingModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],

})
export class IncomeTaxModule { }

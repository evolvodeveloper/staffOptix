import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { IncomeTaxRoutingModule } from './income-tax-routing.module';
import { IncomeTaxComponent } from './income-tax.component';

import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [IncomeTaxComponent],
  imports: [MatRadioModule, MatTooltipModule,
    CommonModule, MatExpansionModule, SharedModule,
    FormsModule, ReactiveFormsModule,
    IncomeTaxRoutingModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],

})
export class IncomeTaxModule { }

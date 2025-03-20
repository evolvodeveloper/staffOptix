import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatRadioModule } from '@angular/material/radio';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TaxComponentsRoutingModule } from './tax-components-routing.module';
import { TaxComponentsComponent } from './tax-components.component';


@NgModule({
  declarations: [TaxComponentsComponent],
  imports: [MatRadioModule,
    CommonModule, FormsModule, MatExpansionModule,
    TaxComponentsRoutingModule
  ],
  providers: [
    NgbActiveModal
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],

})
export class TaxComponentsModule { }

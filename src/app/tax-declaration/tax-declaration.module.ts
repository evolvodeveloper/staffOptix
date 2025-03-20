import { CommonModule, CurrencyPipe } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TaxDeclarationRoutingModule } from './tax-declaration-routing.module';
import { TaxDeclarationComponent } from './tax-declaration.component';


@NgModule({
  declarations: [TaxDeclarationComponent],

  imports: [MatRadioModule,
    CommonModule, FormsModule, MatExpansionModule,
    TaxDeclarationRoutingModule, MatTooltipModule
  ],
  providers: [
    NgbActiveModal, CurrencyPipe,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TaxDeclarationModule { }

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TaxComponentsRoutingModule } from './tax-components-routing.module';
import { TaxComponentsComponent } from './tax-components.component';


@NgModule({
  declarations: [TaxComponentsComponent],
  imports: [
    CommonModule,
    TaxComponentsRoutingModule
  ],
  providers: [
    NgbActiveModal
  ],
})
export class TaxComponentsModule { }

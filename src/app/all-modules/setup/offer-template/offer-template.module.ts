import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { SharedModule } from 'src/app/shared/shared.module';
import { CreateOfferTemplateComponent } from './create-offer-template/create-offer-template.component';
import { OfferTemplateRoutingModule } from './offer-template-routing.module';
import { OfferTemplateComponent } from './offer-template.component';


@NgModule({
  declarations: [OfferTemplateComponent, CreateOfferTemplateComponent],
  imports: [
    CommonModule, SharedModule,
    FormsModule,
    QuillModule.forRoot(),
    OfferTemplateRoutingModule
  ]
})
export class OfferTemplateModule { }

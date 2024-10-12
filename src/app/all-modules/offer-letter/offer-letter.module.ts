import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedModule } from 'src/app/shared/shared.module';
import { OfferLetterRoutingModule } from './offer-letter-routing.module';
import { OfferLetterComponent } from './offer-letter.component';

import { QuillModule } from 'ngx-quill';
import { CreateOfferLetterComponent } from './create-offer-letter/create-offer-letter.component';

@NgModule({
  declarations: [OfferLetterComponent, CreateOfferLetterComponent],
  imports: [
    CommonModule,
    FormsModule,
    NgxPaginationModule,
    ReactiveFormsModule,
    QuillModule.forRoot(),
    SharedModule,
    FormsModule,
    OfferLetterRoutingModule
  ]
})
export class OfferLetterModule { }

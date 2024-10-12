import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateOfferLetterComponent } from './create-offer-letter/create-offer-letter.component';
import { OfferLetterComponent } from './offer-letter.component';

const routes: Routes = [
  { path: '', component: OfferLetterComponent },
  { path: 'cOfferL', component: CreateOfferLetterComponent },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OfferLetterRoutingModule { }

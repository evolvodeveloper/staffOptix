import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateOfferTemplateComponent } from './create-offer-template/create-offer-template.component';
import { OfferTemplateComponent } from './offer-template.component';

const routes: Routes = [
  { path: '', component: OfferTemplateComponent },
  { path: 'template', component: CreateOfferTemplateComponent }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OfferTemplateRoutingModule { }

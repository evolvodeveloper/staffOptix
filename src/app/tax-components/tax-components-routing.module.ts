import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TaxComponentsComponent } from './tax-components.component';

const routes: Routes = [{
  path: '', component: TaxComponentsComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TaxComponentsRoutingModule { }

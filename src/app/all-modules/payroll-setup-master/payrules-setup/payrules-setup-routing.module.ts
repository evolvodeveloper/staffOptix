import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreatePayrulesSetupComponent } from './create-payrules-setup/create-payrules-setup.component';
import { PayrulesSetupComponent } from './payrules-setup.component';

const routes: Routes = [
  { path: '', component: PayrulesSetupComponent }
  ,
  { path: 'create_rule_setup', component: CreatePayrulesSetupComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PayrulesSetupRoutingModule { }

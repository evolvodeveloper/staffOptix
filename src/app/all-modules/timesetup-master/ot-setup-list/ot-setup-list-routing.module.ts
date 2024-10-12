import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OtSetupListComponent } from './ot-setup-list.component';
import { OtSetupComponent } from './ot-setup/ot-setup.component';

const routes: Routes = [{
  path: "",
  component: OtSetupListComponent
},
{
  path: "create-ot",
  component: OtSetupComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OtSetupListRoutingModule { }

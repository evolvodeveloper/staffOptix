import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateVistConfigComponent } from './create-vist-config.component';

const routes: Routes = [
  {
    path: "",
    component: CreateVistConfigComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CreateVistConfigRoutingModule { }

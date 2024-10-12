import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateCustomFeildsComponent } from './create-custom-feilds.component';

const routes: Routes = [
  {
    path: "",
    component: CreateCustomFeildsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CreateCustomFeildsRoutingModule { }

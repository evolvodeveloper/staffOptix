import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateMappingComponent } from './create-mapping.component';

const routes: Routes = [
  {
    path: "",
    component: CreateMappingComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CreateMappingRoutingModule { }

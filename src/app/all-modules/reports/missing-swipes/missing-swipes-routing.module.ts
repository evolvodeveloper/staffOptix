import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MissingSwipesComponent } from './missing-swipes.component';

const routes: Routes = [
  { path: '', component: MissingSwipesComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MissingSwipesRoutingModule { }

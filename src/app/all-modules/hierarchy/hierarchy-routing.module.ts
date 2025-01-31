import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HierarchyComponent } from './hierarchy.component';

const routes: Routes = [

  {
    path: '', component: HierarchyComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HierarchyRoutingModule { }

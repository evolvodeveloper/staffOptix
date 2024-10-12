import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DocumnentsMasterComponent } from './documnents-master.component';

const routes: Routes = [
  { path: '', component: DocumnentsMasterComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DocumnentsMasterRoutingModule { }

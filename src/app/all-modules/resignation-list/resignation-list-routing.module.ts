import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ResignationListComponent } from './resignation-list.component';

const routes: Routes = [
  {
    path: '',
    component: ResignationListComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ResignationListRoutingModule {}

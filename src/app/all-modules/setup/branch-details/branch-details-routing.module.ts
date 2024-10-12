import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BranchDetailsComponent } from './branch-details.component';

const routes: Routes = [{ path: '', component: BranchDetailsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BranchDetailsRoutingModule { }

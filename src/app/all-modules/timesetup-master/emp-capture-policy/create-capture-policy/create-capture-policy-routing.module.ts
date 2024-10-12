import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateCapturePolicyComponent } from './create-capture-policy.component';
import { ListCaptureMembersComponent } from './list-capture-members/list-capture-members.component';

const routes: Routes = [
  { path: '', component: CreateCapturePolicyComponent },
  { path: 'list-capture-members', component: ListCaptureMembersComponent }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CreateCapturePolicyRoutingModule { }

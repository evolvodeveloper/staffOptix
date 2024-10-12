import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateCapturePolicyComponent } from './create-capture-policy/create-capture-policy.component';
import { ListCaptureMembersComponent } from './create-capture-policy/list-capture-members/list-capture-members.component';
import { EmpCapturePolicyComponent } from './emp-capture-policy.component';

const routes: Routes = [
  { path: '', component: EmpCapturePolicyComponent },
  { path: 'create-capture-policy', component: CreateCapturePolicyComponent },
  { path: 'list-capture-members', component: ListCaptureMembersComponent },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmpCapturePolicyRoutingModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ApplyLeaveComponent } from '../apply-leave/apply-leave.component';
import { LeaveHistoryComponent } from './leave-history.component';

const routes: Routes = [
  { path: '', component: LeaveHistoryComponent },
  { path: 'applyleaves', component: ApplyLeaveComponent, },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LeaveHistoryRoutingModule { }

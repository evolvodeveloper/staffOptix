import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateLeaveSetupComponent } from './create-leave-setup/create-leave-setup.component';
import { LeaveSetupComponent } from './leave-setup.component';



const routes: Routes = [
  { path: '', component: LeaveSetupComponent },

  {
    path: 'create-leave-setup', component: CreateLeaveSetupComponent
  }, 

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LeaveSetupRoutingModule { }

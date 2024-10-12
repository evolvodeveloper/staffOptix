import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LeavecalendarComponent } from './leavecalendar.component';

const routes: Routes = [{ path: '', component: LeavecalendarComponent }];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LeavecalendarRoutingModule { }

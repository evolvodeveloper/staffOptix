import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DailyRoasterComponent } from './daily-roaster.component';

const routes: Routes = [{ path: '', component: DailyRoasterComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DailyRoasterRoutingModule { }

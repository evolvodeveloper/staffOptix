import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HolidayCalenderComponent } from './holiday-calender.component';

const routes: Routes = [
  {
    path: '',
    component: HolidayCalenderComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HolidayCalenderRoutingModule { }

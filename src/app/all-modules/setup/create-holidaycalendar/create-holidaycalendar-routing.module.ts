import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateHolidaycalendarComponent } from './create-holidaycalendar.component';

const routes: Routes = [
  {
    path: '',
    component: CreateHolidaycalendarComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CreateHolidaycalendarRoutingModule { }

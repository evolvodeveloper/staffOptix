import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CalendarListComponent } from './calendar-list.component';

const routes: Routes = [
  {
    path: '',
    component: CalendarListComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CalendarListRoutingModule { }

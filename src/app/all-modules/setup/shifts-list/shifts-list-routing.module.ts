import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddShiftsComponent } from './add-shifts/add-shifts.component';
import { ShiftsListComponent } from './shifts-list.component';

const routes: Routes = [
  {
    path: '',
    component: ShiftsListComponent,
  },
  {
    path: "add-shift",
    component: AddShiftsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ShiftsListRoutingModule { }

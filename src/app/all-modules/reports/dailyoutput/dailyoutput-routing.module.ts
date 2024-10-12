import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DailyoutputComponent } from './dailyoutput.component';

const routes: Routes = [
  {
    path: '',
    component: DailyoutputComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DailyoutputRoutingModule {}

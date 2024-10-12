import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WorkFromHomeSetupComponent } from './work-from-home-setup.component';

const routes: Routes = [{ path: '', component: WorkFromHomeSetupComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkFromHomeSetupRoutingModule { }

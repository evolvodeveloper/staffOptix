import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BulkUploadsComponent } from './bulk-uploads.component';

const routes: Routes = [
  { path: '', component: BulkUploadsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BulkUploadsRoutingModule { }

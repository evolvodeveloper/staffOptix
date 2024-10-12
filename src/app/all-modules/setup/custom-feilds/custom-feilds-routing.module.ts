import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomFeildsComponent } from './custom-feilds.component';

const routes: Routes = [
  { 
    path: '', component: CustomFeildsComponent
  },
  {
    path: 'create-custom-feilds',
    loadChildren: () => import('./create-custom-feilds/create-custom-feilds.module').then(m => m.CreateCustomFeildsModule)
  },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomFeildsRoutingModule { }

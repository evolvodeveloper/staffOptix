import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VistConfigComponent } from './vist-config.component';

const routes: Routes = [
  { path: '', component: VistConfigComponent 

  },
  {
    path: 'create-vist-config',
    loadChildren: () => import('./create-vist-config/create-vist-config.module').then(m => m.CreateVistConfigModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VistConfigRoutingModule { }

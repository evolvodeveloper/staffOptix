import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VisitMappingComponent } from './visit-mapping.component';

const routes: Routes = [
  { 
    path: '', component: VisitMappingComponent
  },
  {
    path: 'create-mapping',
    loadChildren: () => import('./create-mapping/create-mapping.module').then(m => m.CreateMappingModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VisitMappingRoutingModule { }

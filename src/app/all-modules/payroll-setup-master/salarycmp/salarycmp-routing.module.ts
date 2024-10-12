import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateSalarycmpComponent } from './create-salarycmp/create-salarycmp.component';
import { SalarycmpComponent } from './salarycmp.component';

const routes: Routes = [
  { path: '', component: SalarycmpComponent },
  { path: 'create_salarycmp', component: CreateSalarycmpComponent }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SalarycmpRoutingModule { }

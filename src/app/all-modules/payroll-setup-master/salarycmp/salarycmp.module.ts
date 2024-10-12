import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedModule } from 'src/app/shared/shared.module';

import { CreateSalarycmpComponent } from './create-salarycmp/create-salarycmp.component';
import { SalarycmpRoutingModule } from './salarycmp-routing.module';
import { SalarycmpComponent } from './salarycmp.component';


@NgModule({
  declarations: [SalarycmpComponent, CreateSalarycmpComponent],
  imports: [
    CommonModule,
    SalarycmpRoutingModule,
    ReactiveFormsModule,
    SharedModule,
    NgxPaginationModule,
    FormsModule
  ]
})
export class SalarycmpModule { }

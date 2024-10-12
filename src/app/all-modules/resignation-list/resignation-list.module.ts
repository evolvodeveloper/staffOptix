import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ResignationListRoutingModule } from './resignation-list-routing.module';
import { ResignationListComponent } from './resignation-list.component';

@NgModule({
  declarations: [ResignationListComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ResignationListRoutingModule,
  ],
})
export class ResignationListModule {}

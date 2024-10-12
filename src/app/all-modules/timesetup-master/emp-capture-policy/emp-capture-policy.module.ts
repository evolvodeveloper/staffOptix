import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedModule } from 'src/app/shared/shared.module';
import { CreateCapturePolicyComponent } from './create-capture-policy/create-capture-policy.component';
import { ListCaptureMembersComponent } from './create-capture-policy/list-capture-members/list-capture-members.component';
import { EmpCapturePolicyRoutingModule } from './emp-capture-policy-routing.module';
import { EmpCapturePolicyComponent } from './emp-capture-policy.component';


@NgModule({
  declarations: [
    EmpCapturePolicyComponent, CreateCapturePolicyComponent, ListCaptureMembersComponent
  ],
  imports: [
    CommonModule,
    EmpCapturePolicyRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    NgxPaginationModule,
  ]
})
export class EmpCapturePolicyModule { }

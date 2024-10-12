import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedModule } from 'src/app/shared/shared.module';
import { UserRoleMappingRoutingModule } from './user-role-mapping-routing.module';
import { UserRoleMappingComponent } from './user-role-mapping.component';

@NgModule({
  declarations: [UserRoleMappingComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatSlideToggleModule,
    NgSelectModule,
    SharedModule,
    NgxPaginationModule,
    UserRoleMappingRoutingModule,
  ],
})
export class UserRoleMappingModule {}

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedModule } from 'src/app/shared/shared.module';
import { CreatePayrulesSetupComponent } from './create-payrules-setup/create-payrules-setup.component';
import { PayrulesSetupRoutingModule } from './payrules-setup-routing.module';
import { PayrulesSetupComponent } from './payrules-setup.component';


@NgModule({
  declarations: [PayrulesSetupComponent, CreatePayrulesSetupComponent],
  imports: [
    CommonModule, MatExpansionModule,
    PayrulesSetupRoutingModule,
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    NgxPaginationModule,
    FormsModule
  ]
})
export class PayrulesSetupModule { }

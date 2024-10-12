import { CdkStepperModule } from '@angular/cdk/stepper';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgStepperModule } from 'angular-ng-stepper';
import { NgxPaginationModule } from 'ngx-pagination';

import { CdkDrag, CdkDragPlaceholder, CdkDropList } from '@angular/cdk/drag-drop';
import { SharedModule } from 'src/app/shared/shared.module';
import { CreatePayrollTypeComponent } from './create-payroll-setup/create-payroll-setup.component';
import { PayrollTypesRoutingModule } from './payroll-setup-routing.module';
import { PayrollTypesComponent } from './payroll-setup.component';
@NgModule({
  declarations: [CreatePayrollTypeComponent, PayrollTypesComponent],
  imports: [
    CommonModule, CdkDropList, CdkDrag, CdkDragPlaceholder,
    MatAutocompleteModule, MatFormFieldModule,
    PayrollTypesRoutingModule, MatExpansionModule,
    NgSelectModule, CdkStepperModule, NgStepperModule,
    SharedModule,
    NgxPaginationModule, MatInputModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class PayrollTypesModule { }

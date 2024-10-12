import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, NgModule } from '@angular/core';

import { CdkStepperModule } from '@angular/cdk/stepper';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgStepperModule } from 'angular-ng-stepper';
import { NgxPaginationModule } from 'ngx-pagination';
import { PayrollMasterRoutingModule } from './payroll-master-routing.module';

import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { SharedModule } from 'src/app/shared/shared.module';
import { RunpayrollComponent } from '../runpayroll/runpayroll.component';
import { CreatePayrollMasterComponent } from './create-payroll-master/create-payroll-master.component';
import { DowloadPayslipsComponent } from './dowload-payslips/dowload-payslips.component';
import { PayrollMasterComponent } from './payroll-master.component';
import { ShowRunPayrollComponent } from './show-run-payroll/show-run-payroll.component';


@NgModule({
  declarations: [
    CreatePayrollMasterComponent,
    PayrollMasterComponent,
    RunpayrollComponent,
    ShowRunPayrollComponent,
    DowloadPayslipsComponent
  ],
  imports: [
    CommonModule,
    MatAutocompleteModule,
    PayrollMasterRoutingModule,
    FormsModule,
    SharedModule,
    // PdfViewerModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    CdkStepperModule,
    NgSelectModule,
    MatProgressBarModule,
    CommonModule,
    NgxPaginationModule,
    NgStepperModule,
  ],
  providers: [
    NgbActiveModal
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]

})
export class PayrollMasterModule { }

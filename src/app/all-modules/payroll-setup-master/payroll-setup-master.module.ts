import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PayrollSetupMasterRoutingModule } from './payroll-setup-master-routing.module';
import { PayrollSetupMasterComponent } from './payroll-setup-master.component';


@NgModule({
  declarations: [PayrollSetupMasterComponent],
  imports: [
    CommonModule,
    PayrollSetupMasterRoutingModule
  ]
})
export class PayrollSetupMasterModule { }

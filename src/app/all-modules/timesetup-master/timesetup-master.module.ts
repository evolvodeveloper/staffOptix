import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { TimesetupMasterRoutingModule } from './timesetup-master-routing.module';
import { TimesetupMasterComponent } from './timesetup-master.component';


@NgModule({
  declarations: [TimesetupMasterComponent],
  imports: [
    CommonModule,
    TimesetupMasterRoutingModule
  ]
})
export class TimesetupMasterModule { }

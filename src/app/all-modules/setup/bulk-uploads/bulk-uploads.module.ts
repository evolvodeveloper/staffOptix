import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BulkUploadsRoutingModule } from './bulk-uploads-routing.module';
import { BulkUploadsComponent } from './bulk-uploads.component';


@NgModule({
  declarations: [BulkUploadsComponent],
  imports: [
    CommonModule,
    FormsModule, ReactiveFormsModule,
    BulkUploadsRoutingModule
  ]
})
export class BulkUploadsModule { }

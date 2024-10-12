import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DocumnentsMasterRoutingModule } from './documnents-master-routing.module';
import { DocumnentsMasterComponent } from './documnents-master.component';


@NgModule({
  declarations: [DocumnentsMasterComponent],
  imports: [
    CommonModule,
    FormsModule,
    DocumnentsMasterRoutingModule
  ],
  providers: [
    NgbActiveModal
  ]
})
export class DocumnentsMasterModule { }

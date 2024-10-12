import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedModule } from 'src/app/shared/shared.module';
import { OtSetupListRoutingModule } from './ot-setup-list-routing.module';
import { OtSetupListComponent } from './ot-setup-list.component';
import { OtSetupComponent } from './ot-setup/ot-setup.component';


@NgModule({ declarations: [
        OtSetupListComponent,
        OtSetupComponent
    ], imports: [CommonModule,
        ReactiveFormsModule, FormsModule,
        OtSetupListRoutingModule,
        SharedModule,
        NgxPaginationModule], providers: [provideHttpClient(withInterceptorsFromDi())] })
export class OtSetupListModule { }

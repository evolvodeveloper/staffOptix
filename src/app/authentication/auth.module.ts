import { CdkStepperModule } from '@angular/cdk/stepper';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgStepperModule } from 'angular-ng-stepper';
import { AuthenticationRoutingModule } from './auth-routing.module';
import { ChangePswdComponent } from './change-pswd/change-pswd.component';
import { FiveZeroThreePageComponent } from './error-pages/five-zero-three-page/five-zero-three-page.component';
import { ForgotComponent } from './forgot/forgot.component';
import { InialChangePswdComponent } from './inial-change-pswd/inial-change-pswd.component';
import { LoginComponent } from './login/login.component';
import { LogintempComponent } from './logintemp/logintemp.component';
import { CustomerDetailsComponent } from './pricing-plans/customer-details/customer-details.component';
import { PricingPlansComponent } from './pricing-plans/pricing-plans.component';
import { AddBranchItemComponent } from './register/add-branch-item/add-branch-item.component';
import { RegisterComponent } from './register/register.component';


@NgModule({
  declarations: [
    LoginComponent, LogintempComponent,
    ChangePswdComponent,
    ForgotComponent,
    RegisterComponent,
    PricingPlansComponent,
    CustomerDetailsComponent,
    AddBranchItemComponent,
    InialChangePswdComponent,
    FiveZeroThreePageComponent

  ],
  imports: [
    CommonModule,
    AuthenticationRoutingModule,
    NgbModule,
    FormsModule,
    CdkStepperModule,
    NgSelectModule,
    NgStepperModule,
    ReactiveFormsModule,
  ],
})
export class AuthenticationModule {}

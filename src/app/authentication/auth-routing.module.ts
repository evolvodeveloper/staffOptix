import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ForgotComponent } from './forgot/forgot.component';
import { InialChangePswdComponent } from './inial-change-pswd/inial-change-pswd.component';
import { LoginComponent } from './login/login.component';
import { CustomerDetailsComponent } from './pricing-plans/customer-details/customer-details.component';
import { RegisterComponent } from './register/register.component';

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'sign-in', component: LoginComponent },
  { path: 'forgot', component: ForgotComponent },
  { path: 'sign-up', component: RegisterComponent },
  { path: 'inial-change-pswd', component: InialChangePswdComponent },
  { path: 'customer-details', component: CustomerDetailsComponent },
  {
    path: '**',
    component: LoginComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthenticationRoutingModule { }

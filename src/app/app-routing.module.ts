import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FiveZeroThreePageComponent } from './authentication/error-pages/five-zero-three-page/five-zero-three-page.component';
import { AuthGuard } from './authentication/guards/auth.guard';
import { LoginGuard } from './authentication/guards/login.guard';
import { PricingPlansComponent } from './authentication/pricing-plans/pricing-plans.component';

const routes: Routes = [
  {
    path: 'auth', loadChildren: () => import(`./authentication/auth.module`).then(m => m.AuthenticationModule), canActivate: [LoginGuard]
  },
  { path: '', loadChildren: () => import(`./all-modules/all-modules.module`).then(m => m.AllModulesModule), canActivate: [AuthGuard] },
  { path: 'pricing-plans', component: PricingPlansComponent },
  { path: '503', component: FiveZeroThreePageComponent },
  // { path: 'InialChangePswdComponent', component: InialChangePswdComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

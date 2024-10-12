import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserRoleMappingComponent } from './user-role-mapping.component';

const routes: Routes = [{ path: '', component: UserRoleMappingComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserRoleMappingRoutingModule {}

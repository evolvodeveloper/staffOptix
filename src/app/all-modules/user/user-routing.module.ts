import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateUserComponent } from './create-user/create-user.component';
import { UserComponent } from './user.component';

const routes: Routes = [{
  path: "",
  component: UserComponent,
},
{
  path: "create-user",
  component: CreateUserComponent
},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }

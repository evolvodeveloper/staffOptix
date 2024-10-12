import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
// import { UnsavedChangesGuard } from "src/app/authentication/guards/unsaved-changes.guard";
import { AssignShiftComponent } from "./assign-shift/assign-shift.component";
import { ShiftsComponent } from "./shifts.component";

const routes: Routes = [
  {
    path: "",
    component: ShiftsComponent
  },

  //  canDeactivate: [UnsavedChangesGuard],
  {
    path: "assign-shift",
    component: AssignShiftComponent,

  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ShiftsRoutingModule { }

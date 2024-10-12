import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminAttendanceComponent } from './admin-attendance/attendance-summary.component';
import { EmployeeDashboardComponent } from './employee-dashboard/employee-dashboard.component';


const routes: Routes = [
  { path: 'admin', component: AdminAttendanceComponent },
  { path: 'employee-dashboard', component: EmployeeDashboardComponent },

];

@NgModule({
  imports: [RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class AttendanceRoutingModule { }

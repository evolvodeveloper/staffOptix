import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CheckPermissionResolver } from 'src/app/authentication/guards/check-permission.resolver';
import { EmployeeExperienceComponent } from '../all-payroll-employees/employee-experience/employee-experience.component';
import { SetupComponent } from './setup.component';

const routes: Routes = [

  {
    path: '',
    component: SetupComponent,
  },


  {
    path: 'empExp',
    component: EmployeeExperienceComponent,
  },
  {
    path: 'empList',
    loadChildren: () =>
      import(
        '../all-payroll-employees/employee-list/employee-list.module'
      ).then((m) => m.EmployeeListModule)
  },
  {
    path: 'offtemplist',
    loadChildren: () =>
      import(
        './offer-template/offer-template.module'
      ).then((m) => m.OfferTemplateModule)
  },

  {
    path: 'designation',
    loadChildren: () =>
      import(
        './create-designation/designation/designation.module'
      ).then((m) => m.DesignationModule),
    resolve: {
      condition: CheckPermissionResolver
    }
  },
  {
    path: 'department',
    loadChildren: () =>
      import('./create-department/department/department.module').then(
        (m) => m.DepartmentModule
      ),
    resolve: {
      condition: CheckPermissionResolver
    }
  },
  {
    path: 'project',
    loadChildren: () =>
      import('./create-project/project-list/project-list.module'
      ).then((m) => m.ProjectListModule),
    resolve: {
      condition: CheckPermissionResolver
    }
  },
  {
    path: 'roles',
    loadChildren: () =>
      import('./roles/roles.module').then((m) => m.RolesModule),
    resolve: {
      condition: CheckPermissionResolver
    }
  },

  {
    path: 'calendarlist',
    loadChildren: () =>
      import('./calendar-list/calendar-list.module').then(
        (m) => m.CalendarListModule
      ),
    resolve: {
      condition: CheckPermissionResolver
    }
  },

  {
    path: 'holidayCalendar',
    loadChildren: () =>
      import(
        './create-holidaycalendar/holiday-calender/holiday-calender.module'
      ).then((m) => m.HolidayCalenderModule), resolve: {
        condition: CheckPermissionResolver
      }
  },
  {
    path: 'company',
    loadChildren: () =>
      import('./company-details/company-details.module').then(
        (m) => m.CompanyDetailsModule
      ),
    resolve: {
      condition: CheckPermissionResolver
    }
  },
  {
    path: 'documents',
    loadChildren: () =>
      import('./documnents-master/documnents-master.module').then(
        (m) => m.DocumnentsMasterModule
      ),
    resolve: {
      condition: CheckPermissionResolver
    }
  },
  {
    path: 'branch',
    loadChildren: () =>
      import('./branch-details/branch-details.module').then(
        (m) => m.BranchDetailsModule
      ),
    resolve: {
      condition: CheckPermissionResolver
    }
  },
  {
    path: 'preferences',
    loadChildren: () =>
      import('./preferences/preferences.module').then(
        (m) => m.PreferencesModule
      ),
  },


  {
    path: 'shifts',
    loadChildren: () =>
      import('./shifts-list/shifts-list.module').then(
        (m) => m.ShiftsListModule
      ),
    resolve: {
      condition: CheckPermissionResolver
    }
  },
  {
    path: 'visit-config',
    loadChildren: () =>
      import('./vist-config/vist-config.module').then(
        (m) => m.VistConfigModule
      ),
    resolve: {
      condition: CheckPermissionResolver
    }
  },
  {
    path: 'custom-config',
    loadChildren: () =>
      import('./custom-feilds/custom-feilds.module').then(
        (m) => m.CustomFeildsModule
      ),
    resolve: {
      condition: CheckPermissionResolver
    }
  },
  {
    path: 'visit-mapping',
    loadChildren: () =>
      import('./visit-mapping/visit-mapping.module').then(
        (m) => m.VisitMappingModule
      ),
    // resolve: {
    //   condition: CheckPermissionResolver
    // }
  },
]
//   }


// ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SetupRoutingModule { }

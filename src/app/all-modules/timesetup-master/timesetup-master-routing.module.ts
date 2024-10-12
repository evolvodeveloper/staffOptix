import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CheckPermissionResolver } from 'src/app/authentication/guards/check-permission.resolver';
import { TimesetupMasterComponent } from './timesetup-master.component';

const routes: Routes = [

  {
    path: '',
    component: TimesetupMasterComponent,
  },
  {
    path: 'wfhSetup', loadChildren: () =>
      import('../timesetup-master/work-from-home-setup/work-from-home-setup.module').then(
        (m) => m.WorkFromHomeSetupModule
      ),
    resolve: {
      condition: CheckPermissionResolver
    }
  },
  {
    path: 'otSetup',
    loadChildren: () =>
      import('../timesetup-master/ot-setup-list/ot-setup-list.module').then(
        (m) => m.OtSetupListModule),
    resolve: {
      condition: CheckPermissionResolver
    }
  },
  {
    path: 'leavesetup',
    loadChildren: () =>
      import('./leave-setup/leave-setup.module').then(
        (m) => m.LeaveSetupModule
      ),
    resolve: {
      condition: CheckPermissionResolver
    }
  },
  {
    path: 'capturepolicy',
    loadChildren: () =>
      import('./emp-capture-policy/emp-capture-policy.module').then(
        (m) => m.EmpCapturePolicyModule
      ),
    resolve: {
      condition: CheckPermissionResolver
    }
  },

  {
    path: 'deviceMaster',
    loadChildren: () =>
      import('../timesetup-master/devicemaster/devicemaster.module').then(
        (m) => m.DevicemasterModule),
    resolve: {
      condition: CheckPermissionResolver
    }
  },

  {
    path: 'deviceLocation',
    loadChildren: () =>
      import('./device-location/device-location.module').then(
        (m) => m.DeviceLocationModule
      ),
    resolve: {
      condition: CheckPermissionResolver
    }
  },
  {
    path: 'trackingPolicy',
    loadChildren: () =>
      import('./tracking-policy-setup/tracking-policy-setup.module').then(
        (m) => m.TrackingPolicySetupModule
      ),
    resolve: {
      condition: CheckPermissionResolver
    }

  },

  {
    path: 'locationMaster',
    loadChildren: () =>
      import('./officelocation/officelocation.module').then(
        (m) => m.OfficelocationModule
      ), resolve: {
        condition: CheckPermissionResolver
      }
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TimesetupMasterRoutingModule { }

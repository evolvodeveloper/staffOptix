import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UtilService } from 'src/app/services/util.service';

@Injectable({
  providedIn: 'root'
})
export class RoutingGuardGuard  {
  hasPermissionToUpdate = false;
  hasPermissionToApprove = false;
  constructor(
    private utilServ: UtilService,
    private router: Router,
    private rout: ActivatedRoute
  ) {
    this.checkPermissions.call(this)
  }
  checkPermissions() {
    if (this.utilServ.menuData.length > 0) {
      const row = this.utilServ.menuData.find(x => this.router.url.includes(x.link))
      if (row) {
        const permissions = row.privType?.split(',')
        if (permissions.includes('WRITE')) {
          this.hasPermissionToUpdate = true;
        }
        else if (permissions.includes('READ')) {
          this.hasPermissionToUpdate = false;
        }
        if (permissions.includes('APPROVE')) {
          this.hasPermissionToApprove = true;
        }
      }
      else {
        this.hasPermissionToUpdate = false;
      }
    } else {
      setTimeout(() => {
        this.checkPermissions.call(this);
      }, 1000);
    }
  }
  canActivate(): boolean {
    if (this.hasPermissionToUpdate) {
      return true;
    }
    else {
      // this.router.navigateByUrl('/dashboard')
      return false;

    }
  }

}

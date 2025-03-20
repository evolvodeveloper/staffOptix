import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';
import { UtilService } from 'src/app/services/util.service';
import { GlobalvariablesService } from '../../services/globalvariables.service';

@Injectable({
  providedIn: 'root'
})
export class CheckPermissionResolver  {
  constructor(private utilServ: UtilService,
    private globalServ: GlobalvariablesService,
    private router: Router
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const routeName = state.url;
    if (routeName !== '/attendance/employee-dashboard') {

      if (routeName == 'changepswd') {
        this.router.navigateByUrl('/changepswd');
      } else {
        // Check if menu data is already available or not added by venu
      if (this.utilServ.menuData.length > 0) {
        return of(this.checkPermissions(routeName));
      } else {
        // Use an Observable to wait for menu data to be available
        return this.globalServ.menuDataSubject.pipe(
          filter(menuData => menuData.length > 0),
          take(1),
          map(() => this.checkPermissions(routeName))
        );
      }
    }
  }
  }

  checkPermissions(routeName: string) {
    let hasPermissionToUpdate = false, hasPermissionToApprove = false, hasPermissionToRead = false;
    const row = this.utilServ.menuData.find(x => '/' + x.link == routeName);
    if (row) {
      const permissions = row?.privType?.split(',') || [];
      hasPermissionToRead = permissions.includes('READ');
    hasPermissionToUpdate = permissions.includes('WRITE');
    hasPermissionToApprove = permissions.includes('APPROVE');
      const obj = {
        hasPermissionToRead,
      hasPermissionToUpdate,
      hasPermissionToApprove
    };
    return obj
    }
    else {
      this.router.navigateByUrl('/attendance/employee-dashboard');


    }
  }
}

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TawkServiceService } from 'src/app/services/tawk-service.service';
import { UtilService } from 'src/app/services/util.service';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard  {
  constructor(private router: Router, private utilServ: UtilService) { }

  canActivate(): boolean {
    if (localStorage.getItem('user-data')) {
      this.router.navigate(['']);
      return false;
    }
    return true;
  }
}

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard  {
  constructor(private router: Router) {}

  canActivate(): boolean {
    if (!localStorage.getItem('user-data')) {
      this.router.navigate(['auth']);
      return false;
    }
    return true;
  }
  
}

import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import Swal from 'sweetalert2';
import { UtilService } from './util.service';
@Injectable()
export class MyHttpInterceptor implements HttpInterceptor {
  yesExpired = false;
  constructor(
    private router: Router,
    private utilServ: UtilService,
  ) { }

  alreadyFired = false;
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // console.log(request.url);
    return next.handle(request).pipe(
      tap({
        next: (event) => {
          if (event instanceof HttpResponse) {

            if (event.status == 401) {
              alert('Unauthorized access!')
            }
            if (event.body?.status?.message == 'DUPLICATE_ENTRY') {
              event.body.status.message = 'Record Already exist'
            }
          }
          return event;
        },
        error: (err) => {
          if (err.status === 401) {
            return this.isTokenExpired();
          }
          if (err.status === 500 && err.error?.status?.message == 'LEAVE_ALREADY_APPLIED') {
            err.error.status.message = 'LEAVE ALREADY APPLIED';
          }
          else if (err.status === 500 && err.error?.status?.message == 'INVALID_QUERY') {
            err.error.status.message = 'INVALID QUERY';
          }
          else if (err.status === 500 && err.error?.status?.message == 'UNKNOWN_ERROR_OCCURRED') {
            err.error.status.message = 'UNKNOWN ERROR';
          }
          else if (err.error?.status?.message == 'BAD_CREDENTIALS') {
            err.error.status.message = 'BAD CREDENTIALS';
          }
          else if (err.error?.status?.message == 'EMPLOYEE_NOT_FOUND') {
            err.error.status.message = 'EMPLOYEE NOT FOUND';
          }

          else if (err.error?.status?.message == 'DESIGNATION_REQUIRED') {
            err.error.status.message = 'DESIGNATION REQUIRED';
          }
          else if (err.error?.status?.message == 'FOR_THIS_DATE_PAYROLL_IS_ALREADY_COMPLETED') {
            err.error.status.message = 'For this date payroll is already completed';
          }
          else if (err.error?.status?.message == 'INVALID_USER') {
            err.error.status.message = 'INVALID USER';
          }
          else if (err.error?.status?.message == 'BRANCH_ALREADY_EXIST_FOR_THIS_COMPANY') {
            err.error.status.message = 'BRANCH ALREADY EXIST FOR THIS COMPANY';
          }
          else if (err.error?.status?.message == 'NOT_HAVING_LEAVE_BALANCE') {
            err.error.status.message = 'Not have leave balance';
          }

          else if (err.error?.status?.message == 'USER_CREATION_LIMIT_IS_EXCEEDED') {
            err.error.status.message = 'Employee Limit Reached';
          }
          else if (err.status === 500 && err.error?.status?.message == 'ERROR_STORING_DATA') {
            err.error.status.message = 'ERROR STORING DATA';
          }
          else if (err.status === 500 && err.error?.status?.message == 'APPROVER_AND_LAST_MODIFIED_CANNOT_BE_SAME') {
            err.error.status.message = 'MODIFIER AND APPROVER CANNOT BE SAME';
          }

          else if (err.status === 500 && err.error?.status?.message == 'INVALID_PERMISSIONS') {
            err.error.status.message = 'You do not have permission.';
          }
          else if (err.error?.status?.message == 'INACTIVE_USER') {
            err.error.status.message = 'INACTIVE USER';
          }

          else if (err.status === 0 && err.url !== 'https://api.ipify.org/?format=json') {
            // err.error.status.message = 'Server Error';
            this.throwPopup('SERVER ISSUE!', '', 'error');
          }
        }
      }));
  }

  throwPopup(title, text, icon) {
    if (!this.alreadyFired) {
      this.alreadyFired = true;
      // Swal.fire({
      //   title: title,
      //   text: text,
      //   icon: icon,
      // });
      this.utilServ.showGif = false;
      this.router.navigateByUrl('/503');

    }
  }
  isTokenExpired() {
    if (!this.yesExpired && localStorage.getItem('token')) {
      this.yesExpired = true;
      Swal.fire({
        icon: 'warning',
        title: 'Session Expired',
        timer: 10000,
      text: 'You were logged out of the website due to token expiration.',
    }).then(() => {
      this.logout();
    });
  }
  }

  logout(): void {
    this.utilServ.showGif = false;
    // localStorage.clear();
    localStorage.removeItem('user-data');
    localStorage.removeItem('token');
    localStorage.removeItem('branch');
    localStorage.removeItem('branchCode');
    this.router.navigateByUrl('auth');
  }

}

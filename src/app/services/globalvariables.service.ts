import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject, of } from 'rxjs';
import Swal from 'sweetalert2';
import { HttpGetService } from './http-get.service';
import { UtilService } from './util.service';

@Injectable({
  providedIn: 'root',
})
export class GlobalvariablesService {

  branchList = [];
  appvariables = new Map();
  charLimitValue: number;
  hasFlexibleWeekends: string;
  pricemasterlist = [];
  menuDataSubject = new Subject<any>();
  menu_listJSON = [];
  dateFormat: string;
  active = false;
  allowAutoGenerateEmpCode: string;
  allowPersonToApplyLeaveBeyondLeaveBal: string;
  showSinglePayslipPerPage: string;
  stopWidgetsRefresh: boolean;
  // currentWidgets = [];

  
  constructor(private http: HttpClient,
    private utilServ: UtilService,
    private router: Router,
    private httpGet: HttpGetService) { }

    
  getList() {
    let headers = new HttpHeaders();
    headers = headers.append(
      'Authorization',
      'Bearer ' + localStorage.getItem('token')
    );
    return this.http.get(`/api/copreferences`, { headers });
  }

  async setAppvariables(response) {
    this.utilServ.isTokenExpired();
    if (response) {
      this.setLocalStorageVariablesOnInit(response);
    }
    this.setCoPreferences();
    this.getBranchList();
    this.getCompanysPricingDetails();
  }

  async setLocalStorageVariablesOnInit(response) {
    localStorage.setItem('token', response.token);
    // localStorage.setItem('roles', response.roles);
    localStorage.setItem('userType', response.userType);
    localStorage.setItem('multibranch', response.multibranch);
    // localStorage.setItem('multidivision', response.multidivision);
    localStorage.setItem('company', response.company);
    localStorage.setItem('companyName', response.companyName);
    localStorage.setItem('branchCode', response.branch);
    localStorage.setItem('token', response.token);
    // localStorage.setItem('division', response.division);
    localStorage.setItem('user-data', JSON.stringify(response));
  }

  async setCoPreferences() {
    this.utilServ.showGif = true;
    this.httpGet.getMasterList('copreferences/app/PRIME').subscribe(
      (res: any) => {
        let resp = [];
        resp = res.response;
        resp.forEach((element) => {
          this.appvariables.set(element.param, element.paramValue);
          if (element.param === 'PRIMARY_KEY_LENGTH') {
            this.charLimitValue = element.paramValue;
          }
          if (element.param === 'FLEXIBLE_WEEKENDS') {
            this.hasFlexibleWeekends = element.paramValue;
          }
          if (element.param === 'AUTO_GENERATE_EMPCODE') {
            this.allowAutoGenerateEmpCode = element.paramValue;
          }
          if (element.param === 'ALLOW_LEAVE_APPLY') {
            this.allowPersonToApplyLeaveBeyondLeaveBal = element.paramValue;
          }
          if (element.param === 'SHOW_MULTI_PAYSLIPS_PER_PAGE') {
            this.showSinglePayslipPerPage = element.paramValue;
          }
        });
      },
    );
  }

  async getBranchList() {
    // if (!localStorage.getItem('branch')) {
    this.httpGet.getMasterList('branchs').subscribe(
      async (res: any) => {
        this.branchList = await res.response;
       
        localStorage.setItem('branch', JSON.stringify(res.response));
        res.response.forEach((row) => {
          if (row.branchCode == localStorage.getItem('branchCode')) {
            this.dateFormat = row.dateFormat;

          }
        });
        return res.response;
      },
      (err) => {
        console.error(err);
      }
    );
    // }
  }

  getMenuAccessData(): Observable<any> {
    this.httpGet.getMenuAccess().subscribe((data: any) => {
      const res = [];
      this.utilServ.showGif = false;
      this.utilServ.menuData = data.response;
      this.menuDataSubject.next(data.response);
      const row = data.response.find((x) => x.link == 'dashboard')
      if (row) {
        const rowa = data.response.find((x) => '/' + x.link == this.router.url)
        if (!rowa) {
          this.router.navigate(['/dashboard']);
        }
        else {
          this.router.navigate([this.router.url]);
        }
      } else {
        this.router.navigate(['/attendance/employee-dashboard']);
      }
      data.response.forEach((menu) => {
        if (menu.menuType == 'SIDEMENU') {
          res.push(menu);
        }
      });
      res.sort((a, b) => {
        return a.priority - b.priority;
      });
      const uniqueHeaders = res.filter((item, index, self) => {
        return index === self.findIndex((el) => el.header === item.header);
      });
      // getting child headers
      const menuListData = [];
      uniqueHeaders.forEach((u: any) => {
        const headerArray = [];
        res.forEach((hr) => {
          if (hr.header == u.header && hr.category) {
            headerArray.push(hr);
          }
        });
        if (headerArray.length > 0) {
          const uniqueChildHeaders = [
            ...new Set(headerArray.map((sh: any) => sh.category)),
          ];

          menuListData.push({
            head: u.header,
            icon: u.icon,
            childHeads: uniqueChildHeaders,
          });
        } else {
          menuListData.push({
            head: u.header,
            icon: u.icon,
          });
        }
      });

      // let menuJSON = [];
      menuListData.forEach((m) => {
        const current_subHeaders = [];
        if (!m.childHeads) {
          res.forEach((r) => {
            if (m.head == r.header) {
              current_subHeaders.push({
                subHead: r,
              });
            }
          });
          this.menu_listJSON.push({
            header: m.head,
            icon: m.icon,
            subHeaders: current_subHeaders.sort((a, b) => {
              return a.subHead.priority - b.subHead.priority;
            }),
          });
        } else {
          m.childHeads.forEach((c) => {
            const current_childHeaders = [];
            res.forEach((r) => {
              if (m.head == r.header && c == r.category) {
                current_childHeaders.push({
                  childHead: r,
                });
              }
            });
            const childObjIndex = res.findIndex(
              (rr) => rr.head == m.header && rr.category == c
            );
            current_subHeaders.push({
              subHead: res[childObjIndex],
              childHeaders: current_childHeaders.sort((a, b) => {
                return a.childHead.priority - b.childHead.priority;
              }),
            });
          });

          res.forEach((r) => {
            if (m.head == r.header) {
              const index = m.childHeads.findIndex(
                (child) => child == r.category
              );
              if (index < 0) {
                current_subHeaders.push({
                  subHead: r,
                });
              }
            }
          });
          this.menu_listJSON.push({
            header: m.head,
            icon: m.icon,
            subHeaders: current_subHeaders.sort((a, b) => {
              return a.subHead.priority - b.subHead.priority;
            }),
          });
        }
      });
      this.menu_listJSON = this.menu_listJSON.sort((a, b) => {
        return a.sortId - b.sortId;
      });
    })
    return of(this.menu_listJSON); // Return the menu data as an observable

  }


  getMenuAccessData1(): Observable<any> {
    this.utilServ.isTokenExpired();
    this.httpGet.getMenuAccess().subscribe((data: any) => {
      const res = [];
  // this.utilServ.menuData = data.response;
  // this.menuDataSubject.next(data.response);

      const row = data.response.find((x) => x.link == 'dashboard')
      if (row) {
        const rowa = data.response.find((x) => '/' + x.link == this.router.url)
        if (!rowa) {
          this.router.navigate(['/dashboard']);
        }
        else {
          this.router.navigate([this.router.url]);
        }
      } else {
        this.router.navigate(['/attendance/employee-dashboard']);
      }


      data.response.forEach((menu) => {
        if (menu.menuType == 'SIDEMENU') {
          res.push(menu);
        }
      });

      // get unique headers
      res.sort((a, b) => {
        return a.priority - b.priority;
      });
      // const uniqueHeaders = [...new Set(res.map((r: any) => r.header))];
      const uniqueHeaders = res.filter((item, index, self) => {
        return index === self.findIndex((el) => el.header === item.header);
      });
      // getting child headers
      const menuListData = [];
      uniqueHeaders.forEach((u: any) => {
        const headerArray = [];
        res.forEach((hr) => {
          if (hr.header == u.header && hr.category) {
            headerArray.push(hr);
          }
        });
        if (headerArray.length > 0) {
          const uniqueChildHeaders = [
            ...new Set(headerArray.map((sh: any) => sh.category)),
          ];
          menuListData.push({
            head: u.header, icon: u.icon,
            childHeads: uniqueChildHeaders.sort((a, b) => {
              return a.subHead - b.subHead;
            }),
          });
        } else {
          menuListData.push({
            head: u.header, icon: u.icon,
          });
        }
      });
      // let menuJSON = [];
      menuListData.forEach((m) => {
        const current_subHeaders = [];
        if (!m.childHeads) {
          res.forEach((r) => {
            if (m.head == r.header) {
              current_subHeaders.push({
                subHead: r,
              });
            }
          });
          // here i am seperating setup menu
          // if (m.head == 'Setup') {
          //   this.menu_listJSON.push({
          //     header: m.head,
          //     icon: m.icon,
          //     link: m.head,
          //     subHeadersSetup: current_subHeaders.sort((a, b) => {
          //       return a.subHead.priority - b.subHead.priority;
          //     }),
          //   });
          // } else {
            this.menu_listJSON.push({
              header: m.head,
              icon: m.icon,
            subHeaders: current_subHeaders.sort((a, b) => {
              return a.subHead.priority - b.subHead.priority;
            }),
          });
          // }
        } else {
          m.childHeads.forEach((c) => {
            const current_childHeaders = [];
            res.forEach((r) => {
              if (m.head == r.header && c == r.category) {
                current_childHeaders.push({
                  childHead: r,
                });
              }
            });
            const childObjIndex = res.findIndex(
              (rr) => rr.head == m.header && rr.category == c
            );
            current_subHeaders.push({
              subHead: res[childObjIndex],
              childHeaders: current_childHeaders.sort((a, b) => {
                return a.childHead.priority - b.childHead.priority;
              }),
            });
          });

          res.forEach((r) => {
            if (m.head == r.header) {
              const index = m.childHeads.findIndex(
                (child) => child == r.category
              );
              if (index < 0) {
                current_subHeaders.push({
                  subHead: r,
                });
              }
            }
          });

          this.menu_listJSON.push({
            header: m.head, icon: m.icon,
            subHeaders: current_subHeaders.sort((a, b) => {
              return a.subHead.priority - b.subHead.priority;
            }),
          });
        }
      });
    })
    return of(this.menu_listJSON); // Return the menu data as an observable

  }

  getCompanysPricingDetails() {
    const JWT = localStorage.getItem('token')
    if (JWT) {
    const ccc = JSON.parse(window.atob(JWT.split('.')[1]));
    if (ccc.roles.includes('ADMIN')) {
      this.httpGet.getMasterList('comPricingPlan').subscribe((res: any) => {
        if (res.response.PricingPlan === 'No Plan Selected') {
          this.utilServ.showGif = false;
          this.router.navigate(['/pricing-plans']);
        }
        else if (res.response.PricingPlan !== 'No Plan Selected' && res.response.RemainingDays > 0 && res.response.RemainingDays !== 0) {
          const obj = {
            remaimingDays: res.response.RemainingDays
          }
          this.utilServ.planStatus = obj;
          this.getMenuAccessData();
        }
        else if (res.response.PricingPlan !== 'No Plan Selected' && res.response.RemainingDays === 0) {
          this.router.navigate(['/pricing-plans']);
        }
        else {
          this.getMenuAccessData();
        }
      })
    }
    else {
      this.getMenuAccessData();
    }
    } else {
      this.utilServ.logout();
    }
  }



  getLabels(formName): Observable<any> {
    const localeId = this.utilServ.langCode == undefined ? 1 : this.utilServ.langCode;
      return this.httpGet.getMasterList('labelsWithForm?localeId=' + localeId + '&form=' + formName);
    }


  getPlaceholders(formName): Observable<any> {
    const localeId = this.utilServ.langCode == undefined ? 1 : this.utilServ.langCode;
      return this.httpGet.getMasterList('placeholdersWithForm?localeId=' + localeId + '&form='
       + formName);
    }

  checkAndRemoveSpecialCharacters(value: string) {
    if (value) {
      // Replace special characters with an empty string
    const val = value.replace(/^\s+/, '');
    // Remove consecutive spaces
    const valy = val.replace(/\s{2,}/g, ' ');
      const sanitizedValue = valy.replace(/[^a-zA-Z0-9_()\s-]/g, '');
    return sanitizedValue
    }
  }
  showSuccessPopUp(msg, status) {
    Swal.fire({
      icon: status,
      title: `${msg}` + ' Downloaded',
      text: 'Please, go to downloads to find this file.',
    })
  }
 
}
  
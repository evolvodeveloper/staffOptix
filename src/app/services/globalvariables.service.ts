import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
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
  previousLabelData = []; previousPlaceholderData = []; previousErrorData = [];
  dateFormat: string;
  active = false;
  allowAutoGenerateEmpCode: string;
  allowPersonToApplyLeaveBeyondLeaveBal: string;
  showSinglePayslipPerPage: string;
  stopWidgetsRefresh: boolean;
  // currentWidgets = [];
  globalData = new Subject<any>();
  globalErrorsData = new Subject<any>();
  globalPlaceholderData = new Subject<any>();
  labels = [];
  placeholder = [];
  ErrorsMsgs = [];
  constructor(private http: HttpClient,
    private utilServ: UtilService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private httpGet: HttpGetService) {
  }
  getLabels(formName): Observable<any> {
    const localeId = this.utilServ.langCode == undefined ? 1 : this.utilServ.langCode;
    return this.httpGet.getMasterList('labelsWithForm?localeId=' + localeId + '&form=' + formName);
  }

  getMyCompLabels(formName) {
    if (this.previousLabelData && !this.previousLabelData.includes(formName)) {
      this.spinner.show();
      this.getLabels(formName).subscribe(async (res: any) => {
        const labels = await res.response;
        this.labels.push(...labels);
        const previousData = this.labels.map(x => x.formCode);
        this.previousLabelData = [...new Set(previousData)];
        this.spinner.hide();
      }, (err) => {
        this.spinner.hide();
        console.error(err.error.status.message);
      });
    }
  }

  getMyCompPlaceHolders(formName) {
    if (this.previousPlaceholderData && !this.previousPlaceholderData.includes(formName)) {
      this.spinner.show();
      this.getPlaceholders(formName).subscribe(async (res: any) => {
        const placeholder = res.response;
        this.placeholder.push(...placeholder);
        const previousData = this.placeholder.map(x => x.placeholderFormCode);
        this.previousPlaceholderData = [...new Set(previousData)];
        this.spinner.hide();
      }, (err) => {
        this.spinner.hide();
        console.error(err.error.status.message);
      });
    }
  }
  getMyCompErrors(formName) {
    if (this.previousErrorData && !this.previousErrorData.includes(formName)) {
      this.spinner.show();
      this.getErrors(formName).subscribe(async (res: any) => {
        const errorsMsgs = res.response;
        this.ErrorsMsgs.push(...errorsMsgs);
        const previousData = this.ErrorsMsgs.map(x => x.placeholderFormCode);
        this.previousErrorData = [...new Set(previousData)];
        this.spinner.hide();
      }, (err) => {
        this.spinner.hide();
        console.error(err.error.status.message);
      });
    }
  }

  getErrors(formName): Observable<any> {
    const localeId = this.utilServ.langCode == undefined ? 1 : this.utilServ.langCode;
    return this.httpGet.getMasterList('gErrorsWithForm?localeId=' + localeId + '&form=' + formName);
  }
  getPlaceholders(formName): Observable<any> {
    const localeId = this.utilServ.langCode == undefined ? 1 : this.utilServ.langCode;
    return this.httpGet.getMasterList('placeholdersWithForm?localeId=' + localeId + '&form='
      + formName);
  }

  showLabel(divId: string): Promise<string> {
    const label = this.labels?.find(item => item.colCode.trim() === divId);
    return label ? label.labelDescription : null;
  }
  hasInteger(colCode: string): Promise<boolean> {
    const label = this.labels.find(item => item.colCode === colCode);
    return label?.labelDescription.includes('{integer}');
  }
  splitLabelDescription(colCode: string): { before: string, after: string, after1: string } {
    const label = this.labels.find(item => item.colCode === colCode);
    const parts = label.labelDescription.split('{integer}');
    return {
      before: parts[0] || '',
      after: parts[1] || '',
      after1: parts[2] || ''
    };
  }
  showPlaceholder(divId: string): Promise<string> {
    const pc = this.placeholder?.find(item => item.placeholderColCode === divId);
    return pc ? pc.placeholderDescription : null;
  }

  showerror(divId: string): Promise<string> {
    const pc = this.ErrorsMsgs?.find(item => item.colCode === divId);
    return pc ? pc.description : null;
  }

  // to get the data from g_labels and g_errors which has form code  Global 
  getGlobalData() {
    this.getLabels('global').subscribe((res: any) => {
      this.globalData = res.response;
    });
  }
  getGlobalPlaceHolders() {
    this.getPlaceholders('global').subscribe((res: any) => {
      this.globalPlaceholderData = res.response;
    });
  }
  getGlobalErrors() {
    this.getErrors('global').subscribe((res: any) => {
      this.globalErrorsData = res.response;
    });
  }
  getGlobalNames(divId: string): Promise<string> {
    const label: any = this.globalData;
    if (Array.isArray(label)) {
      const found = label ? label.find(x => x.colCode === divId) : null
      return found ? found.labelDescription : null;
    }
  }
  showGlobalplaceholders(divId: string): Promise<string> {
    let pl: any = this.globalPlaceholderData;
    // const pl = [];
    if (Array.isArray(pl)) {
      const found = pl ? pl.find(x => x.placeholderColCode === divId) : null;
      return found ? found?.placeholderDescription : null;
    }
  }
  showGlobalErrors(divId: string): Promise<string> {
    const label: any = this.globalErrorsData;
    if (Array.isArray(label)) {
      const found = label ? label.find(x => x.colCode === divId) : null
      return found ? found.description : null;
    }
  }



  async setAppvariables(response) {
    this.utilServ.isTokenExpired();
    if (response) {
      this.setLocalStorageVariablesOnInit(response);
    }
    this.setCoPreferences();
    this.getBranchList();
    this.getCompanysPricingDetails();
    this.getProfile();
    this.getGlobalData();
    this.getGlobalPlaceHolders();
    this.getGlobalErrors();
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
            this.allowPersonToApplyLeaveBeyondLeaveBal = element.paramValue == undefined ? 'N' : element.paramValue;
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
  async getProfile() {
    this.httpGet.getMasterList('profile').subscribe(async (res: any) => {
      // this.getPunchDetails();
      this.utilServ.userProfileData = res.response;
      // if (res.response.isMultibranch) {
      //   if (this.branchs.length > 1) {
      //     this.displayBranch = true;
      //     this.onlyoneBranch = res.response.isMultibranch;
      //   } else {
      //     this.displayBranch = true;
      //     this.onlyoneBranch = false;
      //   }
      // }
  
    })
  }

  getMenuAccessData(): Observable<any> {
    this.httpGet.getMenuAccess().subscribe((data: any) => {
      const res = [];
      this.utilServ.showGif = false;
      this.utilServ.menuData = data.response;
      this.menuDataSubject.next(data.response);
      if (this.router.url === '/changepswd') {
        this.router.navigate(['/changepw']);
      } else {
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
  showSuccessPopUp(msg, status, fileName) {
    Swal.fire({
      icon: status,
      title: `${msg}` + ' Downloaded',
      text: 'Your file ' + '"' + `${fileName}` + '"' + ' has been downloaded successfully.',
    })
  }

}

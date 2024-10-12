import { HttpClient } from '@angular/common/http';
import { Component, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { GlobalvariablesService } from '../services/globalvariables.service';
import { HttpGetService } from '../services/http-get.service';
import { HttpPostService } from '../services/http-post.service';
import { UtilService } from '../services/util.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  username: string;
  shortName: string;
  jsonData: any = {
    notification: [],
    message: [],
  };
  notificationRecords: { type: string, list: any[] }[] = [];

  headerShortCuts = [];
  pageProfileLogo: any;
  branchCode: string;
  profilePic: any;
  dateFormat: string;
  branchName: string;
  punchInMarked: string;
  displayBranch = false;
  branchs: any;
  companyName: string;
  userProfile: any;
  showLeave = true;
  showExp = true;
  showTimeSheet = true;
  onlyoneBranch = false;
  hasPermissionToUpdate = false;
  hasPermissionToApprove = false;
  pendingApprovalsCount: number;
  constructor(
    private http: HttpClient,
    private httpGet: HttpGetService,
    private renderer: Renderer2,
    private globalServ: GlobalvariablesService,
    private router: Router,
    private acRoute: ActivatedRoute,
    private httpPost: HttpPostService,
    private spinner: NgxSpinnerService,
    private utilServ: UtilService
  ) { }
  checkLocalStorage() {
    const branch = localStorage.getItem('branch');
    if (branch !== null) {
      // branchCode
      this.branchs = JSON.parse(branch);
      this.branchSetting();
    }

    else {
      setTimeout(() => {
        this.checkLocalStorage.call(this);
      }, 1000);
    }
  }
  async getProfile() {
    this.httpGet.getMasterList('profile').subscribe(async (res: any) => {
      this.userProfile = await res.response;
      // this.getPunchDetails();
      this.utilServ.userProfileData = res.response;
      if (res.response.isMultibranch) {
        this.onlyoneBranch = res.response.isMultibranch;
      }
      if (this.utilServ.userProfileData.image) {
        const header = 'data:image/' + this.utilServ.userProfileData.fileType + ';base64,';
        this.profilePic = header.concat(this.utilServ.userProfileData.image)
      }
      else {
        const shortName = res.response.name ? res.response.name?.charAt(0) : '';
        this.shortName = shortName.toLocaleUpperCase();
      }

    })
  }
  async getPunchDetails() {
    const ip = localStorage?.getItem('Ipaddress');
    await this.httpGet.getMasterList('employeestatus?employeeCode=' + this.userProfile.employeeCode + '&source=web' + '&address=' + ip).subscribe((res: any) => {
      if (res && res.response == 'isNotPresent') {
        this.punchInMarked = 'false';
      }
      if (res && res.response !== 'isNotPresent' && res.response !== 'isPresent') {
        this.punchInMarked = 'not assigned';
      }
      if (res && res.response == 'isPresent') {
        this.punchInMarked = 'true';
      }
    })
  }

  async ngOnInit() {
    const userData = JSON.parse(localStorage.getItem('user-data'));
    // userData = JSON.parse(localStorage.getItem('user-data'));
    const isAdmin = userData.roles.some(role => role === 'ADMIN');
    this.dateFormat = this.globalServ.dateFormat;
    if (isAdmin) {
      this.hasPermissionToUpdate = true;
      this.getDashboardShortCuts();
      this.getNotifications();
    } else {
      this.hasPermissionToUpdate = false;
    }
    this.companyName = localStorage.getItem('companyName');
    this.getLogo();
    this.getProfile();
    this.checkLocalStorage.call(this);
    // this.getDatas("notification");
    // this.getDatas("message");
    this.username = localStorage.getItem('userName');
  }
  getNotifications() {
    const notificationRecords: { [key: string]: any[] } = {};
    this.httpGet.getMasterList('pendingLeavesAndExpenses').subscribe((res: any) => {
      const records = res.response;
      this.pendingApprovalsCount = records.length;
      const unique = Array.from(new Set(records.map(record => record.type)));
      // const unique = [
      //   ...new Set(res.response.map((e: any) => e.type)),
      // ];
      unique.forEach((element: string) => {
        notificationRecords[element] = records.filter(record => record.type === element);
      });
      Object.keys(notificationRecords).forEach(key => {
        this.notificationRecords.push({
          type: key,
          list: notificationRecords[key]
        });

      });
    })

  }
  getDashboardShortCuts() {
    this.httpGet.getMasterList('dashboardshortcuts').subscribe((res: any) => {
      res.response.unshift({
        reportCode: 'Employee Dashboard',
        link: 'attendance/employee-dashboard'
      })
      this.headerShortCuts = res.response
    })
  }
  branchSetting() {
    if (this.branchs.length > 0) {
      this.displayBranch = true;
      // if (this.branchs.length == 1) {
      //   this.onlyoneBranch = true;
      // }
      if (localStorage.getItem('branchCode')) {
        const row = this.branchs.find(x => x.branchCode === localStorage.getItem('branchCode'));
        if (row) {
          this.branchCode = row.branchCode;
          this.branchName = row.branchName;
        } else {
          this.branchs.forEach((x) => {
            if (x.headoffice == true) {
              localStorage.setItem('branchCode', x.branchCode)
              this.branchCode = x.branchCode;
              this.branchName = x.branchName;
            }
          })
        }
      } else {
        this.branchs.forEach((x) => {
          if (x.headoffice == true) {
            localStorage.setItem('branchCode', x.branchCode)
          this.branchCode = x.branchCode;
          this.branchName = x.branchName;
        }
      });
      }
    }
  }
  getBranchCategory() {
    console.warn('branchCode', this.branchCode);

    this.httpGet
      .getMasterList('switchtoken?branch=' + this.branchCode)
      .subscribe(
        (res: any) => {
          if (res.status.message === 'SUCCESS') {
            location.reload();
            this.globalServ.setAppvariables(res.response);
          }
        },
        (err) => {
          console.error(err);
        }
      );
  }
  getLogo() {
    this.httpGet.getMasterList('company/logo').subscribe(
      (res: any) => {
        const header = 'data:image/' + res.response?.filetype + ';base64,';
        if (res.response?.content && res.response?.filetype) {
          this.pageProfileLogo = header.concat(res.response?.content);
          this.updateFavicon();
        } else {
          this.pageProfileLogo = false;
        }
      },
      (err) => {
        console.error(err);
      }
    );
  }
  updateFavicon() {
    const faviconPath = this.pageProfileLogo;
    const favicon = document.getElementById('favicon') as HTMLLinkElement;
    favicon.href = faviconPath;
  }

  getDatas(section) {
    this.getDataFromJson(section).subscribe((data) => {
      this.jsonData[section] = data;
    });
  }

  clearData(section) {
    this.jsonData[section] = [];
  }
  onSubmit() {
    this.router.navigate(['/pages/search']);
  }
  getDataFromJson(section) {
    return this.http.get(`assets/json/${section}.json`);
  }

  getDateAndTime() {
    const currentDate = new Date();
    // Extract year, month, day, hours, minutes, and seconds
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1; // Months are zero-based
    const day = currentDate.getDate();
    const hours = currentDate.getHours();
    const minutes = currentDate.getMinutes();
    const seconds = currentDate.getSeconds();

    // Format the date and time as strings
    const date = `${year}-${month < 10 ? '0' : ''}${month}-${day < 10 ? '0' : ''}${day}`;
    const time = `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    return {
      date, time
    }
  }
  punchIn() {
    this.spinner.show();
    const getTimeAndDate = this.getDateAndTime();
    if (getTimeAndDate && this.userProfile) {
      const obj = {
        "timesheetdto": {
          "dateCode": getTimeAndDate.date,
          "employeeId": this.userProfile.id,
          "employeeCode": this.userProfile.employeeCode,
          "employeeName": this.userProfile.name,
          "inTime": getTimeAndDate.time,
          'inLocation': localStorage.getItem('Ipaddress'),
          'inDevice': 'system',
          "inDate": getTimeAndDate.date,
        },
        "type": "IN"
      }
      this.httpPost.create('timesheet', obj).subscribe((res: any) => {
        this.spinner.hide();
        if (res.status.message === 'Record Already exist') {
          this.sweetAlert_topEnd('error', 'Attendance already marked');
        }
        else if (res.status.message === 'SUCCESS') {
          this.sweetAlert_topEnd('success', 'Attendance marked');
        }
        else {
          this.sweetAlert_topEnd('', res.status.message);
        }
        this.getPunchDetails();
        // this.sweetAlert_topEnd('error', 'In Attendance Marked');

      },
        (err) => {
          console.error(err);
          this.spinner.hide();
          this.sweetAlert_topEnd('error', err.error.status.message);
        })
    }
  }
  punchOut() {
    this.spinner.hide();
    const getTimeAndDate = this.getDateAndTime();
    const obj = {
      "timesheetdto": {
        "dateCode": getTimeAndDate.date,
        "employeeId": this.userProfile.id,
        "employeeCode": this.userProfile.employeeCode,
        "employeeName": this.userProfile.name,
        "outTime": getTimeAndDate.time,
        'outLocation': localStorage.getItem('Ipaddress'),
        'outDevice': 'system',
        "outDate": getTimeAndDate.date,
      },
      "type": "OUT"
    }

    this.httpPost.create('timesheet', obj).subscribe(() => {
      this.spinner.hide();
      this.getPunchDetails();
      this.sweetAlert_topEnd('success', 'Out Attendance Marked');
    },
      (err) => {
        console.error(err);
        this.spinner.hide();
        this.sweetAlert_topEnd('error', err.error.status.message);
      })
  }
  sweetAlert_topEnd(icon, title) {
    Swal.fire({
      // position: 'top-end',
      icon: icon,
      title: title,
      showConfirmButton: false,
      timer: 5000,
    });
  }
  logout(): void {
    localStorage.removeItem('token');
    // localStorage.removeItem('userName');
    localStorage.removeItem('user-data');
    localStorage.removeItem('branch');
    localStorage.removeItem('branchCode');


    // localStorage.clear();
    this.router.navigateByUrl('auth');
    location.reload();
  }
  toggleDropdown(event: Event) {
    event.stopPropagation();
    const target = event.currentTarget as HTMLElement;
    const submenu = target.querySelector('.dropdown-menu');
    if (submenu) {
      const isShowing = submenu.classList.contains('show');
      // Close all open submenus
      document.querySelectorAll('.dropdown-submenu .dropdown-menu').forEach((el) => {
        this.renderer.removeClass(el, 'show');
      });
      // Toggle the clicked submenu
      if (!isShowing) {
        this.renderer.addClass(submenu, 'show');
      }
    }
  }
  showHide(type) {

    if (type == 'Leave') {
      this.showLeave = !this.showLeave;
    }
    if (type == 'Expenses') {
      this.showExp = !this.showExp;
    }
    if (type == 'Timesheet') {
      this.showTimeSheet = !this.showTimeSheet;
    }
    event.stopPropagation();
    const target = event.currentTarget as HTMLElement;
    const submenu = target.querySelector('.dropdown-menu');
    if (submenu) {
      const isShowing = submenu.classList.contains('show');
      // Close all open submenus
      document.querySelectorAll('.dropdown-submenu .dropdown-menu').forEach((el) => {
        this.renderer.removeClass(el, 'show');
      });
      // Toggle the clicked submenu
      if (!isShowing) {
        this.renderer.addClass(submenu, 'show');
      }
    }
  }
}
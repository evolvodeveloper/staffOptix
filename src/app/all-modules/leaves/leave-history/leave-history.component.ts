import { AfterContentInit, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import moment, { Moment } from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';

import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';
import { HttpPutService } from 'src/app/services/http-put.service';
import { UtilService } from 'src/app/services/util.service';
import Swal from 'sweetalert2';
import { ApplyLeaveComponent } from '../apply-leave/apply-leave.component';
export const MY_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-leave-history',
  templateUrl: './leave-history.component.html',
  styleUrls: ['./leave-history.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
  encapsulation: ViewEncapsulation.None,
})
export class LeaveHistoryComponent implements OnInit, AfterContentInit {
  @ViewChild('picker') datePickerElement = MatDatepicker;

  leaveHistory = [];
  unapprovedLeaves = [];
  balanceLeaves = [];
  balanceLeavesTemp = [];
  config: any;
  config1: any;
  config2: any;
  hasPermissionToUpdate = false;
  hasPermissionToApprove = false;
  temp = [];
  unpprovedLeavesTemp = [];
  dateFormat: string;
  // heIsAdmin = false;
  userProfile: any;
  // year = new Date().getFullYear();
  employeeCode: string;
  employees_list = [];

  firstTab: boolean;
  secondTab: boolean;
  thirdTab: boolean;
  searchedFor: string;
  searchedForunApproved: string;
  searchedInBalance: string;

  date: any = moment();
  year: any = moment().format('YYYY');
  month: any = moment().format('MM');
  minDate: any
  maxDate: any;
  // minDate = new Date(2021, 0, 3);
  // maxDate = new Date(2024, 0, 15);
  constructor(
    private httpGet: HttpGetService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private utilServ: UtilService,
    private acRoute: ActivatedRoute,
    private global: GlobalvariablesService,
    private modalService: NgbModal,
    private httpPutServ: HttpPutService
  ) {
    this.config = {
      itemsPerPage: 25,
      currentPage: 1,
      totalItems: this.leaveHistory.length,
    };
    this.config1 = {
      itemsPerPage: 25,
      currentPage: 1,
      totalItems: this.unapprovedLeaves.length,
    };

    this.config2 = {
      itemsPerPage: 25,
      currentPage: 1,
      totalItems: this.balanceLeaves.length,
    };
    const currentDate = moment(); // Get the current date
    const threeMonthsFromNow = currentDate.clone().add(3, 'months');
    const threeMonthsBeforeNow = currentDate.clone().subtract(3, 'months');
    this.minDate = moment(threeMonthsBeforeNow).format('YYYY-MM-DD')
    this.maxDate = moment(threeMonthsFromNow).format('YYYY-MM-DD')
  }
  setMonthAndYear(
    normalizedMonthAndYear: Moment,
    datepicker: MatDatepicker<Moment>
  ) {
    this.date = normalizedMonthAndYear;
    this.month = normalizedMonthAndYear.format('MM');
    this.year = normalizedMonthAndYear.format('YYYY');

    this.leaveHistory = [];
    this.getLeavesHistoryByDateAndName(this.year, this.month, this.employeeCode);
    this.getUnapprovedLeaves();

    datepicker.close();
  }
  getUserProfile() {
    if (this.utilServ.userProfileData !== undefined) {
      this.userProfile = this.utilServ.userProfileData
      this.employeeCode = this.userProfile.employeeCode;
      this.getLeavesHistoryByDateAndName(this.year, this.month, this.userProfile.employeeCode)
    }
    else {
      setTimeout(() => {
        this.getUserProfile.call(this)
      })
    }
  }

  getRemainingLeaves() {
    this.httpGet.getMasterList('balanceLeaves').subscribe((res: any) => {
      const balanceLeaves = res.response;
      this.balanceLeavesTemp = res.response;
      if (this.searchedInBalance !== '' && this.searchedInBalance !== undefined) {
        const val = this.searchedInBalance.toLowerCase()
        this.balanceLeaves = balanceLeaves.filter(function (d) {
          return d.employeeName.toLowerCase().indexOf(val) !== -1 || !val;
        });
      }
      else {
        this.balanceLeaves = balanceLeaves
      }
    },
      err => {
        console.error(err.error.status.message);
      })
  }
  ngAfterContentInit() {
    this.acRoute.data.subscribe(async data => {
      const permission = data.condition
      this.hasPermissionToUpdate = permission.hasPermissionToUpdate
      this.hasPermissionToApprove = permission.hasPermissionToApprove
    });
    if (this.hasPermissionToApprove) {
      this.tab2();
    } else {
      this.tab1();
    }
  }
  ngOnInit() {
    this.getUserProfile.call(this);
    this.getUnapprovedLeaves();
    this.getRemainingLeaves();
  }

  tab1() {
    this.firstTab = true;
    this.secondTab = false;
    this.thirdTab = false;

  }
  tab2() {
    this.firstTab = false;
    this.secondTab = true;
    this.thirdTab = false;

  }
  tab3() {
    this.firstTab = false;
    this.secondTab = false;
    this.thirdTab = true;
  }
  getLeavesHistoryByDateAndName(year, month, employeeCode) {
    this.spinner.show();
    this.httpGet.getMasterList('leavesByEmpId?empCode=' + employeeCode + '&year=' + year + '&month=' + month)
      .subscribe(
        (res: any) => {
          this.spinner.hide();
          const leaveHistory = res.response;
          this.temp = [...leaveHistory];
          this.dateFormat = this.global.dateFormat;
          if (this.searchedFor !== '' && this.searchedFor !== undefined) {
            const val = this.searchedFor.toLowerCase();
            this.leaveHistory = leaveHistory.filter(function (d) {
              return d.leaveTypeCode.toLowerCase().indexOf(val) !== -1 || !val;
            });
          }
          else {
            this.leaveHistory = leaveHistory
          }
          this.config.totalItems = this.leaveHistory.length;
        },
        (err) => {
          this.spinner.hide();
          console.error(err.error.status.message);
        }
      );
  }
  getUnapprovedLeaves() {
    this.httpGet.getMasterList('unapprovedLeaves?year=' + this.year + '&month=' + this.month).subscribe(
      (res: any) => {
        const unapprovedLeaves = res.response;
        this.unpprovedLeavesTemp = unapprovedLeaves;
        this.dateFormat = this.global.dateFormat;
        if (this.searchedForunApproved !== '' && this.searchedForunApproved !== undefined) {
          const val = this.searchedForunApproved.toLowerCase();
          this.unapprovedLeaves = unapprovedLeaves.filter(function (d) {
            return d.employeeName.toLowerCase().indexOf(val) !== -1 || !val;
          });
        }
        else {
          this.unapprovedLeaves = unapprovedLeaves
        }
        this.config1.totalItems = this.unapprovedLeaves.length;
        this.config1.currentPage = 1;
      });
  }

  resultsPerPage(event) {
    this.config.itemsPerPage =
      event.target.value == 'all' ? this.temp.length : event.target.value;
    this.config.currentPage = 1;
  }
  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    if (val == '') {
      this.leaveHistory = [...this.temp];
    } else {
      const temp = this.temp.filter(function (d) {
        return d.leaveTypeCode.toLowerCase().indexOf(val) !== -1 || !val;
      });
      this.leaveHistory = temp;
    }
    this.config.totalItems = this.leaveHistory.length;
    this.config.currentPage = 1;
  }
  pageChanged(event) {
    this.config.currentPage = event;
  }
  pageChanged1(event) {
    this.config1.currentPage = event;
  }
  pageChanged2(event) {
    this.config2.currentPage = event;
  }
  resultsPerPage1(event) {
    this.config1.itemsPerPage =
      event.target.value == 'all' ? this.unpprovedLeavesTemp.length : event.target.value;
    this.config1.currentPage = 1;
  }
  resultsPerPage2(event) {
    this.config2.itemsPerPage =
      event.target.value == 'all' ? this.balanceLeaves.length : event.target.value;
    this.config2.currentPage = 1;
  }
  updateFilter2(event) {
    const val = event.target.value.toLowerCase();
    if (val == '') {
      this.balanceLeaves = [...this.balanceLeavesTemp];
    } else {
      const temp = this.balanceLeavesTemp.filter(function (d) {
        return d.leaveTypeCode.toLowerCase().indexOf(val) !== -1 || !val;
      });
      this.balanceLeaves = temp;
    }
    this.config2.totalItems = this.balanceLeaves.length;
    this.config2.currentPage = 1;
  }
  updateFilter1(event) {
    const val = event.target.value.toLowerCase();
    if (val == '') {
      this.unapprovedLeaves = [...this.unpprovedLeavesTemp];
    } else {
      const temp = this.unpprovedLeavesTemp.filter(function (d) {
        return d.employeeName.toLowerCase().indexOf(val) !== -1 || d.leaveTypeCode.toLowerCase().indexOf(val) !== -1 || d.employeeCode.toLowerCase().indexOf(val) !== -1 || !val;
      });
      this.unapprovedLeaves = temp;
    }
    this.config1.totalItems = this.unapprovedLeaves.length;
    this.config1.currentPage = 1;
  }
  applyLeave(row, action) {
    const modalRef = this.modalService.open(ApplyLeaveComponent, {
      scrollable: true,
      backdrop: 'static',
      windowClass: 'myCustomModalClass',
      size: 'lg',
    });
    modalRef.componentInstance.userdata = {
      userProfile: this.userProfile,
      action: action,
      row: row,
      balanceLeaves: this.balanceLeavesTemp
    };
    modalRef.result.then(
      () => {
        this.getLeavesHistoryByDateAndName(this.year, this.month, this.employeeCode);
        this.getUnapprovedLeaves();
      },
    );
  }

  approveData(row) {
    this.spinner.show();
    const req = row;
    req.modifyStatus = 'APPROVED';
    this.httpPutServ.doPut('leaveApprove', [row]).subscribe(
      (res: any) => {
        this.spinner.hide();
        if (res.status.message == 'SUCCESS') {
          row.status = 'APPROVED'
          this.getLeavesHistoryByDateAndName(this.year, this.month, this.employeeCode);
          Swal.fire({
            title: 'Success!',
            text: 'Leave Approved',
            icon: 'success',
            timer: 10000,
          })
        } else {
          Swal.fire({
            title: 'Error!',
            text: res.status.message,
            icon: 'warning', showConfirmButton: true,
          });
        }
      },
      (err) => {
        this.spinner.hide();
        console.error(err.error);
        Swal.fire({
          title: 'Error!',
          text: err.error.status.message,
          icon: 'error',
        });
      });
  }
  reject(row) {
    this.spinner.show();
    const req = row;
    req.modifyStatus = 'REJECTED';
    this.httpPutServ.doPut('leaveApprove', [row]).subscribe(
      (res: any) => {
        this.spinner.hide();
        if (res.status.message == 'SUCCESS') {
          row.status = 'REJECTED'
          this.getLeavesHistoryByDateAndName(this.year, this.month, this.employeeCode);
          Swal.fire({
            title: 'Success!',
            text: 'Leave Rejected',
            icon: 'success',
            timer: 10000,
          })
        } else {
          Swal.fire({
            title: 'Error!',
            text: res.status.message,
            icon: 'warning', showConfirmButton: true,
          });
        }
      },
      (err) => {
        this.spinner.hide();
        console.error(err.error);
        Swal.fire({
          title: 'Error!',
          text: err.error.status.message,
          icon: 'error',
        });
      }
    );
  }
  cancel(row) {
    Swal.fire({
      title: 'Cancel my leave!',
      text: 'Are you sure?',
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes',
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        this.spinner.show();
        const req = row;
        req.status = 'CANCELLED';
        this.httpPutServ.doPut('leavehistory', row).subscribe(
          (res: any) => {
            this.spinner.hide();
            this.getLeavesHistoryByDateAndName(this.year, this.month, this.employeeCode);
            if (res.status.message == 'SUCCESS') {
              Swal.fire({
                title: 'Success!',
                text: 'Leave Cancelled',
                icon: 'success',
                timer: 10000,
              })
            } else {
              Swal.fire({
                title: 'Error!',
                text: res.status.message,
                icon: 'warning', showConfirmButton: true,
              });
            }
          },
          (err) => {
            this.spinner.hide();
            console.error(err.error);
            Swal.fire({
              title: 'Error!',
              text: err.error.status.message,
              icon: 'error',
            });
          }
        );
      }
    })
  }
}


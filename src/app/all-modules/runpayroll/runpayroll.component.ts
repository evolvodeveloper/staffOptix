import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';
import { HttpPostService } from 'src/app/services/http-post.service';
import { HttpPutService } from 'src/app/services/http-put.service';
import { UtilService } from 'src/app/services/util.service';
import Swal from 'sweetalert2';
import { AdhocAllowanceComponent } from '../ot-employees-list/adhoc-allowance/adhoc-allowance.component';
@Component({
  selector: 'app-runpayroll',
  templateUrl: './runpayroll.component.html',
  styleUrls: ['./runpayroll.component.scss']
})
export class RunpayrollComponent implements OnInit {
  fulldate;
  date;
  month;
  year;
  view: any;
  maxDt = moment().format('YYYY-MM-DD');
  leaveRecords = false;
  clickedOnSubmit = false;
  payrollCode: string;
  salaryFrequency: string;
  runpayroll = false;
  payrollsetups = [];
  approvedRowsPost = [];
  allShifts = [];
  dateFormat: string;
  checked = false;
  checkedLeaves = false;
  leavesNeedToApprove = [];
  sortOrder = 'desc';
  sortColumn = 'employeeName';
  config: any;
  approveLeavesconfig: any;
  needvalidationRecordsConfig: any;
  approveTimesheetconfig: any;
  leavesNeedToApproveConfig: any;
  unapprovedRecords = [];
  approvedTimesheetRecords = [];
  approvedTimesheetRecordsTemp = [];
  approvedLeavesRecords = [];
  approvedLeavesRecordsTemp = [];
  needvalidationRecords = [];
  needvalidationRecordsTemp = [];
  unApprovedtemp = [];
  approvedLeavesPost = [];
  firstTab = false;
  fifthTab = true;
  secondTab = false;
  thirdTab = false;
  fourthTab = false;
  hasPermissionToUpdate = true;
  hasPermissionToApprove = false;
  constructor(
    private httpGetService: HttpGetService,
    private spinner: NgxSpinnerService,
    private httpPutService: HttpPutService,
    private global: GlobalvariablesService,
    private httpPostService: HttpPostService,
    private router: Router,
    private acRoute: ActivatedRoute,
    private modalService: NgbModal,
    private utilServ: UtilService

  ) {
    this.config = {
      itemsPerPage: 25,
      currentPage: 1,
      totalItems: this.unapprovedRecords.length
    };
    this.needvalidationRecordsConfig = {
      itemsPerPage: 25,
      currentPage: 1,
      totalItems: this.needvalidationRecords.length
    };

    this.leavesNeedToApproveConfig = {
      itemsPerPage: 25,
      currentPage: 1,
      totalItems: this.leavesNeedToApprove.length
    };
    this.approveLeavesconfig = {
      itemsPerPage: 25,
      currentPage: 1,
      totalItems: this.approvedLeavesRecords.length
    };
    this.approveTimesheetconfig = {
      itemsPerPage: 25,
      currentPage: 1,
      totalItems: this.approvedTimesheetRecords.length
    };
  }

  ngOnInit(): void {
    this.acRoute.data.subscribe(data => {
      const permission = data.condition
      this.hasPermissionToUpdate = permission.hasPermissionToUpdate
      this.hasPermissionToApprove = permission.hasPermissionToApprove
    });
    this.getPayrollCodes();
    this.getShifts();
  }

  getShifts() {
    this.httpGetService.getMasterList('shifts/active').subscribe(
      (res: any) => {
        this.allShifts = res.response;
      },
      err => {
        console.error(err.error.status.message);
      }
    );
  }
  resultsPerPage(event) {
    this.config.itemsPerPage = event.target.value == 'all' ? this.unApprovedtemp.length : event.target.value;
    this.config.currentPage = 1;
  }

  getPayrollCodes() {
    this.httpGetService.getMasterList('payrollsetups').subscribe(
      (res: any) => {
        this.payrollsetups = res.response;
        const hasDefault = res.response.find(x => x.isDefault == true)
        if (hasDefault) {
          this.payrollCode = (hasDefault.payrollCode)

        }
        else {
          this.payrollCode = (res.response[0]?.payrollCode)
        }
        this.onPayrollChange();
      },
      (err) => {
        console.error(err.error.status.message);
      }
    );
  }
  onPayrollChange() {
    this.clickedOnSubmit = false;
    this.unapprovedRecords = [];
    this.unApprovedtemp = [];
    this.leavesNeedToApprove = [];
    this.approvedRowsPost = [];
    this.approvedLeavesPost = [];
    const foundRecord = this.payrollsetups.find(x => x.payrollCode == this.payrollCode)
    this.salaryFrequency = foundRecord.salaryFrequency;
    if (foundRecord.salaryFrequency === 'Month') {
      this.fulldate = moment().format('YYYY-MM');
      this.maxDt = moment().format('YYYY-MM');
    } else {
      this.fulldate = moment().format('YYYY-MM-DD');
      this.maxDt = moment().format('YYYY-MM-DD');
    }
  }
  pageChanged(event) {
    this.config.currentPage = event;
  }
  pageChangedeedvalidation(event) {
    this.needvalidationRecordsConfig.currentPage = event;
  }
  pageChangedForapproveTimesheetconfig(event) {
    this.approveTimesheetconfig.currentPage = event;
  }
  pageChangedForapproveLeavesconfig(event) {
    this.approveLeavesconfig.currentPage = event;
  }
  pageChangedForleavesNeedToApproveConfig(event) {
    this.leavesNeedToApproveConfig.currentPage = event;
  }


  sortData(col: string): void {
    if (this.sortColumn === col) {
      if (this.sortOrder === 'asc') {
        this.sortOrder = 'desc';
      }
      else {
        this.sortOrder = 'asc';
      }
    }
    else {
      this.sortColumn = col;
      this.sortOrder = 'asc';
    }
    this.unapprovedRecords = this.unapprovedRecords.sort((a, b) => {
      if (a[col] < b[col]) {
        return this.sortOrder === 'asc' ? -1 : 1;
      }
      if (a[col] > b[col]) {
        return this.sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });

    this.needvalidationRecords = this.needvalidationRecords.sort((a, b) => {
      if (a[col] < b[col]) {
        return this.sortOrder === 'asc' ? -1 : 1;
      }
      if (a[col] > b[col]) {
        return this.sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }
  viewData(row) {
    this.view = row;
  }
  editData(row): void {
    row.inDateEdit = true;
    row.outDateEdit = true;
    row.inDateEditMode = true;
    row.outDateEditMode = true;
    // row.save = true;
    row.minDate = row.inDate !== null ? row.inDate : row.dateCode;
    // Assuming businessDate is in YYYY-MM-DD format, parse it and add one day
    const date = row.inDate !== null ? row.inDate : row.dateCode;
    const parsedDatePlus1 = new Date(date);
    parsedDatePlus1.setDate(parsedDatePlus1.getDate() + 1);
    row.maxDate = parsedDatePlus1.toISOString().slice(0, 10);

    const parsedDateMinus1 = new Date(row.dateCode);
    parsedDateMinus1.setDate(parsedDateMinus1.getDate() - 1);
    row.minMinDate = parsedDateMinus1.toISOString().slice(0, 10);
  }


  expandRow(row: any): void {
    row.expand = true;
    row.loading = 'loading';
    this.httpGetService.getMasterList('timesheetlogBytimesheetid?timesheetid=' + row.id).subscribe(
      (res: any) => {

        row.logRecords = res.response;
        row.loading = 'success';
      }, (error) => {
        row.loading = 'failed';
        console.error(error);
      })
  }
  collapseRow(row: any): void {
    row.expand = false;
    row.highlight = false;
  }
  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    if (val == '') {
      this.unapprovedRecords = [...this.unApprovedtemp];
    } else {
      const temp = this.unApprovedtemp.filter(function (d) {
        return (d.employeeName && d.employeeName.toLowerCase().indexOf(val) !== -1) || (d.employeeCode && d.employeeCode.toLowerCase().indexOf(val) !== -1) || !val;
      });
      this.unapprovedRecords = temp;
    }
    this.config.totalItems = this.unapprovedRecords.length;
    this.config.currentPage = 1;
  }
  timeDifference(row, index, type, source) {
    const startDateTime = new Date(`${row?.inDate}T${row?.inTime}`);
    const endDateTime = new Date(`${row?.outDate}T${row?.outTime}`);

    const diffInMilliseconds = endDateTime.getTime() - startDateTime.getTime();

    const hours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
    if (hours < 0) {
      Swal.fire({
        title: 'Error!',
        text: 'In-time cannot be greater than Out-time',
        icon: 'error',
      });

      if (source == 'fromUnApproved') {
        row.inTime = this.unapprovedRecords[index]?.OrginalInTime;
        row.outTime = this.unapprovedRecords[index]?.OrginalOutTime;
        row.outDate = this.unapprovedRecords[index]?.OrginalOutDate;
        row.shift = this.unapprovedRecords[index]?.OrginalShift;

      }
      else if (source == 'fromValiNeeded') {
        row.inTime = this.needvalidationRecords[index]?.OrginalInTime;
        row.outTime = this.needvalidationRecords[index]?.OrginalOutTime;
        row.outDate = this.needvalidationRecords[index]?.OrginalOutDate;
        row.shift = this.needvalidationRecords[index]?.OrginalShift;
      }
    }
  }
  submit() {
    this.approvedTimesheetRecords = [];
    this.approvedTimesheetRecordsTemp = [];
    this.approvedLeavesRecords = []; this.approvedLeavesRecordsTemp = [];
    const dateSplit = this.fulldate.split('-');
    if (dateSplit.length > 2) {
      this.date = dateSplit[2];
      this.month = dateSplit[1];
      this.year = dateSplit[0];
    } else {
      this.date = '01';
      this.month = dateSplit[1];
      this.year = dateSplit[0];
    }
    this.getTimesheetRecords();
    this.getNeedValidTimesheetRecords();
    this.getLeaveRecords();
    if (this.thirdTab) {
      this.getApprovedTimesheetRecords();
    }
    if (this.fourthTab) {
      this.getApprovedLeaveRecords();
    }
  }   

  getNeedValidTimesheetRecords() {
    this.spinner.show();
    this.clickedOnSubmit = true;
    this.httpGetService.getMasterList('timesheet/needValidation?month=' + this.month + '&year=' + this.year + '&date=' + this.date + '&payrollCode=' + this.payrollCode).subscribe((res: any) => {
      this.spinner.hide();
      this.dateFormat = this.global.dateFormat;
      const data = [];
      res.response.forEach(r => {
        r.expand = false;
        r.OrginalInTime = r.inTime;
        r.OrginalInDate = r.inDate;
        r.OrginalOutDate = r.outDate;
        r.OrginalOutTime = r.outTime;
        r.OrginalShift = r.shift;
        r.inDateEdit = false;
        r.outDateEdit = false;
        r.inDateEditMode = false;
        r.outDateEditMode = false;
        r.approved = r.isApproved === undefined ? null : r.isApproved;
        r.totalHours1 = null;
        // totalHours
        const resultInMinutes = r.totalHours ? r.totalHours * 60 : 0;
        const h = Math.floor(resultInMinutes / 60);
        const hours = h < 10 ? '0' + h : h
        const m = Math.floor(resultInMinutes % 60);
        const minutes = m < 10 ? '0' + m : m
        r.totalHours1 = hours + ':' + minutes
        // effectiveHrs
        const resultInMinuteseffectiveHrs = r.effectiveHrs ? r.effectiveHrs * 60 : 0;
        const heffectiveHrs = Math.floor(resultInMinuteseffectiveHrs / 60);
        const hourseffectiveHrs = heffectiveHrs < 10 ? '0' + heffectiveHrs : heffectiveHrs
        const meffectiveHrs = Math.floor(resultInMinuteseffectiveHrs % 60);
        const minuteseffectiveHrs = meffectiveHrs < 10 ? '0' + meffectiveHrs : meffectiveHrs
        r.effectiveHrs1 = hourseffectiveHrs + ':' + minuteseffectiveHrs
        data.push(r)
      });
      this.runpayroll = true;
      this.needvalidationRecords = data;
      this.needvalidationRecordsTemp = data;
      this.sortData('employeeName')
    }
      , (err) => {
        this.spinner.hide();
        Swal.fire({
          title: 'Error!',
          text: err.error.status.message,
          icon: 'error',
        });
      })
  }


  getTimesheetRecords() {
    this.clickedOnSubmit = true;
    this.spinner.show();
    this.httpGetService.getMasterList('timesheet/payrollCode?month=' + this.month + '&year=' + this.year + '&date=' + this.date + '&payrollCode=' + this.payrollCode).subscribe((res: any) => {
      this.spinner.hide();
      this.dateFormat = this.global.dateFormat;
      res.response.forEach(r => {
        r.expand = false;
        r.OrginalInTime = r.inTime;
        r.OrginalInDate = r.inDate;
        r.OrginalOutDate = r.outDate;
        r.OrginalOutTime = r.outTime;
        r.OrginalShift = r.shift
        r.inDateEdit = false;
        r.outDateEdit = false;
        r.inDateEditMode = false;
        r.outDateEditMode = false;
        r.approved = r.isApproved === undefined ? null : r.isApproved;
        r.totalHours1 = null;
        // totalHours
        const resultInMinutes = r.totalHours ? r.totalHours * 60 : 0;
        const h = Math.floor(resultInMinutes / 60);
        const hours = h < 10 ? '0' + h : h
        const m = Math.floor(resultInMinutes % 60);
        const minutes = m < 10 ? '0' + m : m
        r.totalHours1 = hours + ':' + minutes
        // effectiveHrs
        const resultInMinuteseffectiveHrs = r.effectiveHrs ? r.effectiveHrs * 60 : 0;
        const heffectiveHrs = Math.floor(resultInMinuteseffectiveHrs / 60);
        const hourseffectiveHrs = heffectiveHrs < 10 ? '0' + heffectiveHrs : heffectiveHrs
        const meffectiveHrs = Math.floor(resultInMinuteseffectiveHrs % 60);
        const minuteseffectiveHrs = meffectiveHrs < 10 ? '0' + meffectiveHrs : meffectiveHrs
        r.effectiveHrs1 = hourseffectiveHrs + ':' + minuteseffectiveHrs
      }); 
      this.runpayroll = true;
      this.unapprovedRecords = res.response;
      this.unApprovedtemp = res.response;
      this.sortData('employeeName')
    }
      , (err) => {
        this.spinner.hide();
        Swal.fire({
          title: 'Error!',
          text: err.error.status.message,
          icon: 'error',
        });
      })
  }

  // timesheet/payrollCode/approved?month=11&year=2023&date=01&payrollCode=OFFICE_WAGES
  getApprovedTimesheetRecords() {
    if (this.approvedTimesheetRecords.length == 0) {
    this.clickedOnSubmit = true;
    this.spinner.show();
    this.httpGetService.getMasterList('timesheet/payrollCode/approved?month=' + this.month + '&year=' + this.year + '&date=' + this.date + '&payrollCode=' + this.payrollCode).subscribe((res: any) => {
      this.spinner.hide();
      this.dateFormat = this.global.dateFormat;
      res.response.forEach(r => {
        r.expand = false;
        r.OrginalInTime = r.inTime;
        r.OrginalInDate = r.inDate;
        r.OrginalOutDate = r.outDate;
        r.OrginalOutTime = r.outTime;

        r.inDateEdit = false;
        r.outDateEdit = false;
        r.inDateEditMode = false;
        r.outDateEditMode = false;
        // r.approved = r.isApproved === undefined ? null : r.isApproved;
        r.totalHours1 = null;
        // totalHours
        const resultInMinutes = r.totalHours ? r.totalHours * 60 : 0;
        const h = Math.floor(resultInMinutes / 60);
        const hours = h < 10 ? '0' + h : h
        const m = Math.floor(resultInMinutes % 60);
        const minutes = m < 10 ? '0' + m : m
        r.totalHours1 = hours + ':' + minutes
        // effectiveHrs
        const resultInMinuteseffectiveHrs = r.effectiveHrs ? r.effectiveHrs * 60 : 0;
        const heffectiveHrs = Math.floor(resultInMinuteseffectiveHrs / 60);
        const hourseffectiveHrs = heffectiveHrs < 10 ? '0' + heffectiveHrs : heffectiveHrs
        const meffectiveHrs = Math.floor(resultInMinuteseffectiveHrs % 60);
        const minuteseffectiveHrs = meffectiveHrs < 10 ? '0' + meffectiveHrs : meffectiveHrs
        r.effectiveHrs1 = hourseffectiveHrs + ':' + minuteseffectiveHrs
      });
      // this.runpayroll = true;
      this.approvedTimesheetRecords = res.response;
      this.approvedTimesheetRecordsTemp = res.response;
      this.sortData('employeeName')
    }
      , (err) => {
        this.spinner.hide();
        Swal.fire({
          title: 'Error!',
          text: err.error.status.message,
          icon: 'error',
        });
      })
  }
  }


  saveRow(row): void {
    this.spinner.show();
    this.httpPutService.doPut('timesheet', JSON.stringify(row))
      .subscribe((res: any) => {
        this.spinner.hide();
        if (res.status.message === 'SUCCESS') {
          row.inDateEdit = false;
          row.outDateEdit = false;
          row.inDateEditMode = false;
          row.outDateEditMode = false;
          row.OrginalInTime = row.inTime;
          row.OrginalInDate = row.inDate;
          row.OrginalOutDate = row.outDate;
          row.OrginalOutTime = row.outTime;
          row.approved = res.response.isApproved;

          row.needValidation = res.response.needValidation;
          row.totalHours = res.response.totalHours;
          row.comments = null;
          Object.assign(row, res.response);
          const needValidIndes = this.needvalidationRecords.findIndex(x => x.id == row.id);
          // const unapprovedIndex = this.unapprovedRecords.findIndex(x => x.id == row.id);
          const resultInMinutes = row.totalHours * 60;
          const h = Math.floor(resultInMinutes / 60);
          const hours = h < 10 ? '0' + h : h
          const m = Math.floor(resultInMinutes % 60);
          const minutes = m < 10 ? '0' + m : m
          row.totalHours1 = hours + ':' + minutes

          const resultInMinuteseffectiveHrs = row.effectiveHrs * 60;
          const heffectiveHrs = Math.floor(resultInMinuteseffectiveHrs / 60);
          const hourseffectiveHrs = heffectiveHrs < 10 ? '0' + heffectiveHrs : heffectiveHrs
          const meffectiveHrs = Math.floor(resultInMinuteseffectiveHrs % 60);
          const minuteseffectiveHrs = meffectiveHrs < 10 ? '0' + meffectiveHrs : meffectiveHrs
          row.effectiveHrs1 = hourseffectiveHrs + ':' + minuteseffectiveHrs
          this.needvalidationRecords[needValidIndes] = row;
          this.needvalidationRecordsTemp[needValidIndes] = row;
          this.unapprovedRecords.push(row);
          // this.unApprovedtemp.push(row);
          // // this.unapprovedRecords[unapprovedIndex] = row;
          // // this.unApprovedtemp[unapprovedIndex] = row;
          Swal.fire({
            title: 'Success!',
            text: 'Data updated successfully',
            icon: 'success',
          });
        } else {
          Swal.fire({
            text: res.status.message,
            icon: 'warning',
          });
        }

      }, (err) => {
        this.spinner.hide();
        Swal.fire({
          title: 'Error!',
          text: err.error.status.message,
          icon: 'error',
        });
      })
  }
  Undo(row, i, source) {
    row.inDateEdit = false;
    row.outDateEdit = false;
    row.inDateEditMode = false;
    row.outDateEditMode = false;
    if (source == 'fromValiNeeded') {
      row.inDate = this.needvalidationRecords[i]?.OrginalInDate;
      row.inTime = this.needvalidationRecords[i]?.OrginalInTime;
      row.outTime = this.needvalidationRecords[i]?.OrginalOutTime;
      row.outDate = this.needvalidationRecords[i]?.OrginalOutDate;
      row.outTime = this.needvalidationRecords[i]?.OrginalOutTime;
      row.shift = this.needvalidationRecords[i]?.OrginalShift;

    }
    else if (source == 'fromUnApproved') {
      row.inTime = this.unApprovedtemp[i]?.OrginalInTime;
      row.inDate = this.unApprovedtemp[i]?.OrginalInDate;
      row.outTime = this.unApprovedtemp[i]?.OrginalOutTime;
      row.outDate = this.unApprovedtemp[i]?.OrginalOutDate;
      row.shift = this.unApprovedtemp[i]?.OrginalShift;

    }
  }
  approveAllTimesheetItem(event): void {
    this.approvedRowsPost = [];
    this.checked = event.target.checked;
    if (this.checked) {
      this.unapprovedRecords.forEach(value => {
        if (value.OrginalOutTime && value.OrginalOutDate && value.OrginalInTime && value.OrginalInDate) {
          // if (!value.approve) {
          value.checked = true;
          value.approved = this.checked;
          this.approvedRowsPost.push(value)
          // }
        }
      });
      if (this.approvedRowsPost.length == 0) {
        this.checked = false;
      }
    } else {
      this.unapprovedRecords.forEach(value => {
        if (value.checked) {
          value.approved = false;
          value.checked = false
        }
      })
      this.approvedRowsPost = [];
    }
  }
  checkAllLeaveRecords(ev) {
    this.approvedLeavesPost = [];
    this.checkedLeaves = ev.target.checked;
    if (this.checkedLeaves) {
      this.leavesNeedToApprove.forEach(x => {
        x.checkedLeaveItems = true;
        this.approvedLeavesPost.push(x)
      })
    } else {
      this.leavesNeedToApprove.forEach(value => {
        if (value.checkedLeaveItems) {
          value.checkedLeaveItems = false
        }
      })
      this.approvedLeavesPost = [];
    }
  }
  approveItem(ev, item): void {
    if (ev.target.checked) {
      if (item.OrginalOutTime && item.OrginalOutDate && item.OrginalInTime && item.OrginalInDate) {
        item.approved = true;
        item.checked = true;
        this.approvedRowsPost.push(item);
      }
      else {
        ev.target.checked = false,
          item.checked = false;
        Swal.fire({
          title: 'Error!',
          text: 'Please select the records with IN and Out-time,Date',
          icon: 'error',
        });
      }
    }
    else {
      const id = this.approvedRowsPost.findIndex(x => x.id == item.id);
      this.approvedRowsPost.splice(id, 1);
    }
  }

  approveRecord(): void {
    this.spinner.show();
    this.httpPutService.doPut('timesheet/approve', this.approvedRowsPost)
      .subscribe((res: any) => {
        this.spinner.hide();
        if (res === 'SUCCESS') {
          this.approvedRowsPost.forEach(y => {
            const find = this.unapprovedRecords.find(x => x.id == y.id)
            if (find) {
              find.isApproved = true;
            }
          })
          const remaiming = [];
          this.unapprovedRecords.forEach(x => {
            if (x.isApproved !== true) {
              remaiming.push(x)
            }
          })
          this.approvedRowsPost = [];
          this.checked = false;
          Swal.fire({
            title: 'Success!',
            text: 'Data which have in-date and out-date are approved successfully',
            icon: 'success',
            showCancelButton: false,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Ok"
          }).then((result) => {
            if (result.isConfirmed) {
              if (remaiming.length > 0) {
                Swal.fire({
                  // title: 'info!',
                  // text: 'There are ' + remaiming.length + ' records needing approval',
                  html: `
   There are <b> ${remaiming.length} </b> records needing approval
   <br>
   Do you want to run payroll without considering those records ?`,
                  icon: 'info',
                  allowOutsideClick: false,
                  showCancelButton: true,
                  confirmButtonColor: "#3085d6",
                  cancelButtonColor: "#d33",
                  confirmButtonText: "Yes",
                  cancelButtonText: "No"
                }).then((result) => {
                  if (result.isConfirmed) {
                    this.leaveRecords = true;
                    Swal.fire({
                      text: "Validate employee's leave records",
                    });
                  }
                });
              }
            }
          });
          this.approvedTimesheetRecords = [];
          this.approvedTimesheetRecordsTemp = [];
        } else {
          Swal.fire({
            title: 'Error!',
            text: res.status.message,
            icon: 'warning',
          })
        }
      },
        err => {
          this.spinner.hide();
          Swal.fire({
            title: 'Error!',
            text: err.error.status.message,
            icon: 'error',
          })
        })
  }

  changeToLeave() {
    // this.leaveRecords == false ?
    if (this.leaveRecords) {
      this.leaveRecords = false;
    } else {
      this.leaveRecords = true;
    }
  }
  getLeaveRecords() {
    this.clickedOnSubmit = true;
    // this.spinner.show();
    this.httpGetService.getMasterList('unapprovedLeaves/payrollCode?month=' + this.month + '&year=' + this.year + '&date=' + this.date + '&payrollCode=' + this.payrollCode).subscribe((res: any) => {
      this.spinner.hide();
      const leavesNeedToApprove = res.response;
      leavesNeedToApprove.forEach(x => {
        x.checkedLeaveItems = false,
          x.removeRecords = false,
          x.modifyStatus = null
      })
      this.leavesNeedToApprove = leavesNeedToApprove
      this.runpayroll = true;
    })
  }
  getApprovedLeaveRecords() {
    this.clickedOnSubmit = true;
    // this.spinner.show();
    this.httpGetService.getMasterList('approvedLeaves/payrollCode?month=' + this.month + '&year=' + this.year + '&date=' + this.date + '&payrollCode=' + this.payrollCode).subscribe((res: any) => {
      this.spinner.hide();
      const leavesNeedToApprove = res.response;
      leavesNeedToApprove.forEach(x => {
        x.checkedLeaveItems = false,
          x.removeRecords = false,
          x.modifyStatus = null
      })
      this.approvedLeavesRecords = leavesNeedToApprove
    })
  }
  approveLeaveItem(ev, item): void {
    if (ev.target.checked) {
      item.approvedRecord = true;
      item.checked = true;
      this.approvedLeavesPost.push(item);
    }
    else {
      const id = this.approvedLeavesPost.findIndex(x => x.leaveHistoryId == item.leaveHistoryId);
      this.approvedLeavesPost.splice(id, 1);
    }
  }

  approveLeaves() {
    this.spinner.show();
    this.approvedLeavesPost.forEach(x => {
      x.modifyStatus = 'APPROVED'
    })
    this.httpPutService.doPut('leaveApprove', this.approvedLeavesPost).subscribe((res: any) => {
      this.spinner.hide();
      if (res.status.message === 'SUCCESS') {
        Swal.fire({
          title: 'Approved!',
          text: 'Selected Records Approved',
          icon: 'success',
        })
        this.approvedLeavesRecords = [];
        this.approvedLeavesRecordsTemp = [];
        this.approvedLeavesPost.forEach(y => {
          const find = this.leavesNeedToApprove.find(x => x.leaveHistoryId == y.leaveHistoryId)
          if (find) {
            find.removeRecords = true;
          }
        })
      }
    },
      err => {
        this.spinner.hide();
        Swal.fire({
          title: 'Error!',
          text: err.error.status.message,
          icon: 'error',
        })
      })
  }
  rejectLeave() {
    this.approvedLeavesPost.forEach(x => {
      x.modifyStatus = 'REJECTED';
    })
    this.httpPutService.doPut('leaveApprove', this.approvedLeavesPost).subscribe((res: any) => {
      this.spinner.hide();
      if (res.status.message === 'SUCCESS') {
        Swal.fire({
          title: 'Rejected!',
          text: 'Selected Records Rejected',
          icon: 'success',
        })
        this.approvedLeavesPost.forEach(y => {
          const find = this.leavesNeedToApprove.find(x => x.leaveHistoryId == y.leaveHistoryId)
          if (find) {
            find.removeRecords = true;
          }
        })
      }
    })
  }

  tab1() {
    this.firstTab = true;
    this.secondTab = false;
    this.thirdTab = false;
    this.fourthTab = false;
    this.fifthTab = false;

  }
  tab5() {
    this.firstTab = false;
    this.secondTab = false;
    this.thirdTab = false;
    this.fourthTab = false;
    this.fifthTab = true;

  }
  tab2() {
    this.firstTab = false;
    this.secondTab = true;
    this.thirdTab = false;
    this.fourthTab = false; this.fifthTab = false;

  }
  tab3() {
    this.firstTab = false;
    this.secondTab = false;
    this.thirdTab = true;
    this.fourthTab = false; this.fifthTab = false;
    if (this.approvedTimesheetRecords.length === 0 && this.fulldate) {
      const dateSplit = this.fulldate.split('-');
      if (dateSplit.length > 2) {
        this.date = dateSplit[2];
        this.month = dateSplit[1];
        this.year = dateSplit[0];
      } else {
        this.date = '01';
        this.month = dateSplit[1];
        this.year = dateSplit[0];
      }
      this.getApprovedTimesheetRecords();
    }
  }
  tab4() {
    this.firstTab = false;
    this.secondTab = false;
    this.thirdTab = false;
    this.fourthTab = true; this.fifthTab = false;
    if (this.approvedLeavesRecords.length === 0 && this.fulldate) {
      const dateSplit = this.fulldate.split('-');
      if (dateSplit.length > 2) {
        this.date = dateSplit[2];
        this.month = dateSplit[1];
        this.year = dateSplit[0];
      } else {
        this.date = '01';
        this.month = dateSplit[1];
        this.year = dateSplit[0];
      }
      this.getApprovedLeaveRecords();
    }
  }
  runPayrolltest() {
    Swal.fire({
      // title: 'info!',
      // text: 'There are ' + remaiming.length + ' records needing approval',
      html: `Would you like to submit any ad-hoc allowances in CSV format?`,
      icon: 'info',
      allowOutsideClick: false,
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
      cancelButtonText: "No"
    }).then((result) => {
      if (result.isConfirmed) {
        this.openAdhoc()
        // this.sendRunPayrollReq();
      }
      else {
        this.sendRunPayrollReq();
      }
    });
  }
  openAdhoc() {
    const dateSplit = this.fulldate.split('-');
    if (dateSplit.length > 2) {
      this.date = dateSplit[2];
      this.month = dateSplit[1];
      this.year = dateSplit[0];
    } else {
      this.date = '01';
      this.month = dateSplit[1];
      this.year = dateSplit[0];
    }
    const date = this.year + '-' + this.month + '-' + this.date
    const data = {
      payrollCode: this.payrollCode,
      dateCode: date
    }
    const modalRef = this.modalService.open(AdhocAllowanceComponent, {
      windowClass: 'myCustomModalClass',
      backdrop: 'static',
      fullscreen: 'md',
      size: 'lg'
    });
    modalRef.componentInstance.fromParent = data;
    modalRef.result.then(
      () => {
        this.sendRunPayrollReq();
      },
    );
  }

  runPayroll() {
    const remaiming = [], remainingLeaves = [];
    this.unapprovedRecords.forEach(x => {
      if (x.isApproved !== true) {
        remaiming.push(x)
      }
    })
    this.leavesNeedToApprove.forEach(y => {
      if (y.removeRecords !== true) {
        remainingLeaves.push(y)
      }
    })
    if (remaiming.length > 0 || remainingLeaves.length > 0) {
      Swal.fire({
        // title: 'info!',
        // text: 'There are ' + remaiming.length + ' records needing approval',
        html: `
   There are <b> ${remaiming.length} </b> timesheet records and <b> ${remainingLeaves.length} </b> leaves records needing approval
   <br>
   Do you want to run payroll without considering those records?`,
        icon: 'info',
        allowOutsideClick: false,
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, Run",
        cancelButtonText: "No, Stop"
      }).then((result) => {
        if (result.isConfirmed) {
          this.runPayrolltest();
        }
      });
    }
    else {
      this.runPayrolltest();
    }
  }
  sendRunPayrollReq() {
    const dateSplit = this.fulldate.split('-');
    if (dateSplit.length > 2) {
      this.date = dateSplit[2];
      this.month = dateSplit[1];
      this.year = dateSplit[0];
    } else {
      this.date = '01';
      this.month = dateSplit[1];
      this.year = dateSplit[0];
    }
    this.spinner.show();

    this.httpPostService.create('payroll/salary?month=' + this.month + '&calcAdvance=' + false + '&payrollCode=' + this.payrollCode + '&runpayroll=' + false + '&year=' + this.year + '&date=' + this.date, null
    ).subscribe((res: any) => {
      this.spinner.hide();
      if (res.status.message === 'SUCCESS') {
        Swal.fire({
          title: 'Success!',
          text: 'Payroll run successfully',
          icon: 'success',
        }).then(() => {
          this.utilServ.viewData = res.response
          this.router.navigateByUrl('/payroll-master/showRuns');
        });

      }
    },
      err => {
        this.spinner.hide();
        Swal.fire({
          title: 'Error!',
          text: err.error.status.message,
          icon: 'error',
        });
      });
  }
  ngOndestroy
}


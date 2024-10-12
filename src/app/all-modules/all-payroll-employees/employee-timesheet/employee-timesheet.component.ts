import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as FileSaver from 'file-saver';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { ExcelService } from 'src/app/services/excel.service';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';
import { HttpPostService } from 'src/app/services/http-post.service';
import { HttpPutService } from 'src/app/services/http-put.service';
import Swal from 'sweetalert2';

const EXCEL_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
@Component({
  selector: 'app-employee-timesheet',
  templateUrl: './employee-timesheet.component.html',
  styleUrls: ['./employee-timesheet.component.scss']
})
export class EmployeeTimesheetComponent implements OnInit, AfterViewInit {
  reportObj = {
    projectCode: 'ALL',
    empCode: 'ALL',
    shiftCode: '',
    from: '',
    to: '',
    deptCode: 'ALL'
  };
  view: any;
  PreviewObject: string;

  dateFormat: string;
  firstTab = false;
  secondTab = false;
  thirdTab = false;
  allRecordsTab = true;
  message = 'clickOnsubmit';

  projects = [];
  departments = [];
  employees = [];

  stopSpinner = true;
  allRecords = [];
  allRecordsTemp = [];

  allrecordsConfig: any;
  unApprovedconfig: any;
  validationNeededconfig: any;
  isApprovedconfig: any;

  unApprovedtemp = [];
  unApprovedRows = [];
  hasPermissionToApprove = false;
  hasPermissionToUpdate = false;
  approvedRowsPost = [];

  validationNeededRows = [];
  validationNeededOrgTemp = [];

  isApprovedRecords = [];
  isApprovedRecordsTemp = [];
  sortOrder = 'desc';
  sortColumn = 'employeeName';
  selectedDateRange = {
    startDate: moment().startOf('day'),
    endDate: moment().endOf('day'),
  };
  checked = false;
  shifts = [];
  allShifts = [];
  constructor(
    private httpGetService: HttpGetService,
    private global: GlobalvariablesService,
    private router: Router,
    private acRoute: ActivatedRoute,
    private excelSer: ExcelService,
    private cdr: ChangeDetectorRef,
    private httpPost: HttpPostService,
    private spinner: NgxSpinnerService,
    private httpPutService: HttpPutService
  ) {
    this.allrecordsConfig = {
      itemsPerPage: 25,
      currentPage: 1,
      totalItems: this.allRecords.length,
    };
    this.unApprovedconfig = {
      itemsPerPage: 25,
      currentPage: 1,
      totalItems: this.unApprovedRows.length,
    };
    this.validationNeededconfig = {
      itemsPerPage: 25,
      currentPage: 1,
      totalItems: this.validationNeededRows.length,
    };
    this.isApprovedconfig = {
      itemsPerPage: 25,
      currentPage: 1,
      totalItems: this.isApprovedRecords.length,
    };
  }

  ngOnInit() {
    this.acRoute.data.subscribe(async data => {
      const permission = data.condition
      this.hasPermissionToUpdate = permission?.hasPermissionToUpdate
      this.hasPermissionToApprove = permission?.hasPermissionToApprove
    });
    this.getDepartments();
    this.getShifts();
  }
  ngAfterViewInit() {
    const rightCalendar = document.getElementsByClassName('calendar right');
    if (rightCalendar.item(0)) {
      rightCalendar.item(0).remove();
    }
  }
  getDepartments() {
    this.httpGetService.getMasterList('depts/active').subscribe((res: any) => {
      if (res.response.length > 0) {
        res.response.unshift({
          deptCode: 'ALL',
          deptName: 'ALL'
        })
      }
      this.departments = res.response;
      this.getProjects();
    })
  }
  getShifts() {
    this.httpGetService.getMasterList('shifts/active').subscribe(
      (res: any) => {
        this.allShifts = res.response;
        const shiftRes = res.response;

        if (shiftRes.length > 0) {
          this.reportObj.shiftCode = 'ALL';
        }
        shiftRes.sort((a, b) => {
          return a.shiftId - b.shiftId
        });
        this.shifts = shiftRes;
      },
      // err => {
      //   Swal.fire({
      //     title: 'Error!',
      //     text: err.error.status.message,
      //     icon: 'error',
      //     timer: 3000,
      //   });
      // }
    );
  }

  sweetAlert_topEnd(icon, title) {
    Swal.fire({
      icon: icon,
      title: title,
      showConfirmButton: false,
      timer: 5000,
    });
  }



  getProjects() {
    this.httpGetService.getMasterList('empcategorys').subscribe(
      (res: any) => {
        if (res.response.length > 0) {
          res.response.unshift({
            categoryCode: 'ALL',
          })
        }
        this.projects = res.response;
        this.employeesByDepartmentAndProject();
      },
      // (err) => {
      //   console.error(err.error.status.message);
      // }
    );
  }

  employeesByDepartmentAndProject() {
    this.stopSpinner = false;
    this.httpGetService
      .getMasterList('employeesByCatAndDept?department=' + this.reportObj.deptCode + '&category=' + this.reportObj.projectCode)
      .subscribe((res: any) => {
        const val = res.response.map(x => {
          x.mergeName = `${x.employeeName} - ${x.employeeCode}`;
          return x
        })
        if (res.response.length > 0) {
          val.unshift({
            employeeCode: 'ALL',
            employeeName: 'ALL',
            mergeName: 'ALL'
          })
        }
        this.stopSpinner = true;
        this.employees = val;
        this.dateFormat = this.global.dateFormat;
        this.stopSpinner = true;
      },
      // err => {
      //   this.stopSpinner = false;
      //   Swal.fire({
      //     title: 'Error!',
      //     text: err.error.status.message,
      //     icon: 'error',
      //     timer: 3000,
      //   });
      // }
    );
  }

  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    if (val == '') {
      this.allRecords = [...this.allRecordsTemp];
      this.unApprovedRows = [...this.unApprovedtemp];
      this.validationNeededRows = [...this.validationNeededOrgTemp];
      this.isApprovedRecords = [...this.isApprovedRecordsTemp];
    } else {
      const temp1 = this.unApprovedtemp.filter(function (d) {
        return (d.employeeName && d.employeeName.toLowerCase().indexOf(val) !== -1) || (d.employeeCode && d.employeeCode.toLowerCase().indexOf(val) !== -1) || !val;
      });
      this.unApprovedRows = temp1;
      const temp2 = this.validationNeededOrgTemp.filter(function (d) {
        return (d.employeeName && d.employeeName.toLowerCase().indexOf(val) !== -1) || (d.employeeCode && d.employeeCode.toLowerCase().indexOf(val) !== -1) || !val;
      });
      this.validationNeededRows = temp2;
      const temp3 = this.isApprovedRecordsTemp.filter(function (d) {
        return (d.employeeName && d.employeeName.toLowerCase().indexOf(val) !== -1) || (d.employeeCode && d.employeeCode.toLowerCase().indexOf(val) !== -1) || !val;
      });
      this.isApprovedRecords = temp3;
      const temp4 = this.allRecordsTemp.filter(function (d) {
        return (d.employeeName && d.employeeName.toLowerCase().indexOf(val) !== -1) || (d.employeeCode && d.employeeCode.toLowerCase().indexOf(val) !== -1) || !val;
      });
      this.allRecords = temp4;
    }
    this.cdr.detectChanges();

  }
  modified() {
    this.unApprovedtemp = [];
    this.allRecords = [];
    this.unApprovedRows = [];
    this.validationNeededRows = [];
    this.validationNeededOrgTemp = []
    this.isApprovedRecords = [];
    this.isApprovedRecordsTemp = [];
    this.message = 'clickOnsubmit';
  }
  allrecordsPageChanged(event) {
    this.allrecordsConfig.currentPage = event;
    // this.cdr.detectChanges();
  }
  unApprovedPageChanged(event) {
    this.unApprovedconfig.currentPage = event;
  }
  validationNeededpageChanged(event) {
    this.validationNeededconfig.currentPage = event;
  }
  isApprovedpageChanged(event) {
    this.isApprovedconfig.currentPage = event;
  }

  allRecordsresultPerPage(event) {
    this.allrecordsConfig.itemsPerPage =
      event.target.value == 'all' ? this.allRecordsTemp.length : event.target.value;
    this.allrecordsConfig.currentPage = 1;
  }
  validationNeededresultsPerPage(event) {
    this.validationNeededconfig.itemsPerPage =
      event.target.value == 'all' ? this.validationNeededOrgTemp.length : event.target.value;
    this.validationNeededconfig.currentPage = 1;
  }
  isApprovedResultsPerPage(event) {
    this.isApprovedconfig.itemsPerPage =
      event.target.value == 'all' ? this.isApprovedRecordsTemp.length : event.target.value;
    this.isApprovedconfig.currentPage = 1;
  }
  resultsPerPage(event) {
    this.unApprovedconfig.itemsPerPage =
      event.target.value == 'all' ? this.unApprovedtemp.length : event.target.value;
    this.unApprovedconfig.currentPage = 1;
  }
  submit() {
    this.spinner.show();
    this.unApprovedRows = [], this.unApprovedtemp = [];
    this.validationNeededRows = [], this.validationNeededOrgTemp = [];
    this.isApprovedRecords = [], this.isApprovedRecordsTemp = [];
    this.allRecords = [], this.allRecordsTemp = [];
    this.reportObj.from =
      this.selectedDateRange.startDate.format('YYYY-MM-DD');
    this.reportObj.to = this.selectedDateRange.endDate.format('YYYY-MM-DD');
    this.httpGetService.getMasterList('timesheets/emp?from=' + this.reportObj.from + '&to=' +
      this.reportObj.to + '&empCode=' + this.reportObj.empCode + '&shift=' + this.reportObj.shiftCode + '&project=' + this.reportObj.projectCode + '&deptCode=' + this.reportObj.deptCode).subscribe((res: any) => {
        this.message = 'modified';
        const timesheetRes = res.response.filter(x => x.attStatus !== 'Leave' && (x.attStatus !== 'Week Off' && x.attStatus !== 'WEEK OFF'))
        if (timesheetRes.length > 0) {
          timesheetRes.forEach(r => {
            r.comments = r.comments ? r.comments.replace(/\n/g, '<br>') : '';
            r.totalHours1 = null;
            r.effectiveHrs1 = null;
            // totalHours
            const resultInMinutes = r.totalHours ? r.totalHours * 60 : 0;
            const h = Math.floor(resultInMinutes / 60);
            const hours = h < 10 ? '0' + h : h
            const m = Math.floor(resultInMinutes % 60);
            const minutes = m < 10 ? '0' + m : m
            r.totalHours1 = hours + ':' + minutes

            const resultInMinutes1 = r.effectiveHrs ? r.effectiveHrs * 60 : 0;
            const h1 = Math.floor(resultInMinutes1 / 60);
            const hours1 = h1 < 10 ? '0' + h1 : h1
            const m1 = Math.floor(resultInMinutes1 % 60);
            const minutes1 = m1 < 10 ? '0' + m1 : m1
            r.effectiveHrs1 = hours1 + ':' + minutes1
            r.logRecords = [];
            r.expand = false;
            r.OrginalInTime = r.inTime;
            r.OrginalInDate = r.inDate;
            r.OrginalOutDate = r.outDate;
            r.OrginalOutTime = r.outTime;
            r.OrginalShift = r.shift
            r.loading = 'nothing'
            r.inDateEdit = false;
            r.outDateEdit = false;
            r.inDateEditMode = false;
            r.outDateEditMode = false;
            r.approved = r.isApproved === undefined ? null : r.isApproved;
            if ((r.isApproved == false || r.isApproved == null)) {
              this.unApprovedRows.push(r);
              this.unApprovedtemp.push(r);
            }
            // && r.isApproved == false  && r.needValidation == false
            if ((r.needValidation == true)) {
              this.validationNeededRows.push(r);
              this.validationNeededOrgTemp.push(r);
            }
            if (r.isApproved == true) {
              this.isApprovedRecords.push(r);
              this.isApprovedRecordsTemp.push(r);
            }
          });

          const records = this.manageRecords(timesheetRes);        
          this.allRecords = records;
          this.allRecordsTemp = records;
          this.spinner.hide();
          this.sortData('employeeName');
        this.allrecordsConfig.totalItems = this.allRecords.length;
        this.validationNeededconfig.totalItems = this.validationNeededRows.length;
        this.unApprovedconfig.totalItems = this.unApprovedRows.length;
          this.isApprovedconfig.totalItems = this.isApprovedRecords.length;
        } else {
          this.spinner.hide();
          Swal.fire({
            title: 'info!',
            text: 'No Records Found',
            icon: 'info',
          });
        }
      },
      // err => {
      //   this.spinner.hide();
      //   Swal.fire({
      //     title: 'Error!',
      //     text: err.error.status.message,
      //     icon: 'error',
      //   });
      // }
    )
  }

  manageRecords(records) {
    const groupedRecords = records.reduce((acc, record) => {
      const key = `${record.employeeCode}-${record.inDate}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(record);
      return acc;
    }, {});

    // Process each group
    const result = [];
    Object.values(groupedRecords).forEach((group: any) => {
      if (group.length === 1) {
        // Only one record for the date, add BreakShift = false
        const singleRecord = { ...group[0], BreakShift: false };
        result.push(singleRecord);
      } else {
        // Multiple records, merge them
        const [firstRecord, secondRecord] = group.sort((a, b) => {
          return new Date(`${a.inDate}T${a.inTime}`).getTime() - new Date(`${b.inDate}T${b.inTime}`).getTime();
        });

        const mergedRecord = { ...firstRecord, BreakShift: true };
        for (const key in secondRecord) {
          if (Object.prototype.hasOwnProperty.call(secondRecord, key)) {
            mergedRecord[`Second${key.charAt(0).toUpperCase() + key.slice(1)}`] = secondRecord[key];
          }
        }
        result.push(mergedRecord);
      }
    });

    return result;
  }


  approveAllItem(event): void {
    this.approvedRowsPost = [];
    this.checked = event.target.checked;
    if (this.checked) {
      this.unApprovedRows.forEach(value => {
        if (value.OrginalOutTime && value.OrginalOutDate && value.OrginalInTime && value.OrginalInDate) {
        // if (!value.approve) {
          value.checked = true;
        value.approved = this.checked;
        this.approvedRowsPost.push(value)
        // }
      }
      // else {
      //   Swal.fire({
      //     title: 'Error!',
      //     text: 'Please Select the records with IN and OUT Time & Date',
      //     icon: 'error',
      //   });
      // }
    });
    } else {
      this.unApprovedRows.forEach(value => {
        if (value.checked) {
          value.approved = false;
          value.checked = false
        }
      })
      this.approvedRowsPost = [];
    }
  }
  timeDifference(row, index, type, source) {
    const startDateTime = new Date(`${row?.inDate}T${row?.inTime}`);
    const endDateTime = new Date(`${row?.outDate}T${row?.outTime}`);

    const diffInMilliseconds = endDateTime.getTime() - startDateTime.getTime();

    const hours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
    // const minutes = Math.floor((diffInMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 12) {
      Swal.fire({
        text: 'Marked more than 12hrs',
        icon: 'info',
      });
    }
    else if (hours < 0) {
      Swal.fire({
        title: 'Error!',
        text: 'In-time cannot be greater than Out-time',
        icon: 'error',
      });
      if (source == 'fromValiNeeded') {
        row.inTime = this.validationNeededOrgTemp[index]?.OrginalInTime;
        row.outTime = this.validationNeededOrgTemp[index]?.OrginalOutTime;
        row.outDate = this.validationNeededOrgTemp[index]?.OrginalOutDate;
        row.shift = this.validationNeededOrgTemp[index]?.OrginalShift;

      }
      else if (source == 'fromUnApproved') {
        row.inTime = this.unApprovedtemp[index]?.OrginalInTime;
        row.outTime = this.unApprovedtemp[index]?.OrginalOutTime;
        row.outDate = this.unApprovedtemp[index]?.OrginalOutDate;
        row.shift = this.unApprovedtemp[index]?.OrginalShift;

      }
      else if (source == 'allrecords') {
        row.inTime = this.allRecordsTemp[index]?.OrginalInTime;
        row.outTime = this.allRecordsTemp[index]?.OrginalOutTime;
        row.outDate = this.allRecordsTemp[index]?.OrginalOutDate;
        row.shift = this.allRecordsTemp[index]?.OrginalShift;
      }
    }
  }
  Undo(row, i, source) {
    row.inDateEdit = false;
    row.outDateEdit = false;
    row.inDateEditMode = false;
    row.outDateEditMode = false;
    if (row.BreakShift) {
      row.SecondInDateEditMode = false;
      row.SecondOutDateEditMode = false;
      if (source == 'fromValiNeeded') {
        row.SecondInTime = this.validationNeededOrgTemp[i]?.SecondOrginalInTime;
        row.SecondOutTime = this.validationNeededOrgTemp[i]?.SecondOrginalOutTime;
        row.SecondOutDate = this.validationNeededOrgTemp[i]?.SecondOrginalOutDate;
        row.SecondInDate = this.validationNeededOrgTemp[i]?.SecondOrginalInDate;
        row.SecondShift = this.validationNeededOrgTemp[i]?.SecondOrginalShift;
      }
      else if (source == 'fromUnApproved') {
        row.SecondInTime = this.unApprovedtemp[i]?.SecondOrginalInTime;
        row.SecondOutTime = this.unApprovedtemp[i]?.SecondOrginalOutTime;
        row.SecondOutDate = this.unApprovedtemp[i]?.SecondOrginalOutDate;
        row.SecondInDate = this.unApprovedtemp[i]?.SecondOrginalInDate;
        row.SecondShift = this.unApprovedtemp[i]?.SecondOrginalShift;
      }
      else if (source == 'allrecords') {
        row.SecondInTime = this.allRecordsTemp[i]?.SecondOrginalInTime;
        row.SecondOutTime = this.allRecordsTemp[i]?.SecondOrginalOutTime;
        row.SecondOutDate = this.allRecordsTemp[i]?.SecondOrginalOutDate;
        row.SecondInDate = this.allRecordsTemp[i]?.SecondOrginalInDate;
        row.SecondShift = this.allRecordsTemp[i]?.SecondOrginalShift;
      }
    }
    if (source == 'fromValiNeeded') {
      row.inTime = this.validationNeededOrgTemp[i]?.OrginalInTime;
      row.outTime = this.validationNeededOrgTemp[i]?.OrginalOutTime;
      row.outDate = this.validationNeededOrgTemp[i]?.OrginalOutDate;
      row.inDate = this.validationNeededOrgTemp[i]?.OrginalInDate;
      row.shift = this.validationNeededOrgTemp[i]?.OrginalShift;
    }
    else if (source == 'fromUnApproved') {
      row.inTime = this.unApprovedtemp[i]?.OrginalInTime;
      row.outTime = this.unApprovedtemp[i]?.OrginalOutTime;
      row.outDate = this.unApprovedtemp[i]?.OrginalOutDate;
      row.inDate = this.unApprovedtemp[i]?.OrginalInDate;
      row.shift = this.unApprovedtemp[i]?.OrginalShift;
    }
    else if (source == 'allrecords') {
      row.inTime = this.allRecordsTemp[i]?.OrginalInTime;
      row.outTime = this.allRecordsTemp[i]?.OrginalOutTime;
      row.outDate = this.allRecordsTemp[i]?.OrginalOutDate;
      row.inDate = this.allRecordsTemp[i]?.OrginalInDate;
      row.shift = this.allRecordsTemp[i]?.OrginalShift;
    }
  }
  gettimeChanges(row, index, type): void {
    if (index >= 0) {
      const inTimeStr = row?.inTime?.split(':');
      const outTimeStr = row?.outTime?.split(':');
      const inTimeinSec = parseInt(inTimeStr[0] * 3600 + inTimeStr[1] * 60 + inTimeStr[0]);
      const outTimeinSec = parseInt(outTimeStr[0] * 3600 + outTimeStr[1] * 60 + outTimeStr[0]);
      const inDate = row?.inDate;
      const outDate = row?.outDate;
      if (inDate === outDate) {
        if (outTimeinSec < inTimeinSec) {
          Swal.fire({
            title: 'Error!',
            text: 'In-time cannot be greater than Out-time',
            icon: 'error',
          });
          row.inTime = this.unApprovedtemp[index]?.inTime;
          row.outTime = this.unApprovedtemp[index]?.outTime;
          row.outDate = this.unApprovedtemp[index]?.outDate;
          //   row.inDateEdit = false;
          //  row.outDateEdit = false;
          return;
        }
      }
      this.unApprovedRows[index].inTime = row?.inTime;
      this.unApprovedRows[index].outTime = row?.outTime;
      if (type === 'IN') {
        //  row.inDateEditMode = false;
      } else {
        //  row.outDateEditMode = false;
      }
      row.inDateEdit = true;
      row.outDateEdit = true;
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
  editData(row): void {
    row.inDateEdit = true;
    row.outDateEdit = true;
    row.inDateEditMode = true;
    row.outDateEditMode = true;
    if (row.BreakShift === true) {
      row.SecondInDateEditMode = true
      row.SecondOutDateEditMode = true;


      row.SecondMinDate = row.SecondInDate !== null ? row.SecondInDate : row.SecondDateCode;
      // Assuming businessDate is in YYYY-MM-DD format, parse it and add one day
      const date = row.SecondInDate !== null ? row.SecondInDate : row.SecondDateCode;
      const parsedDatePlus1 = new Date(date);
      parsedDatePlus1.setDate(parsedDatePlus1.getDate() + 1);
      row.SecondMaxDate = parsedDatePlus1.toISOString().slice(0, 10);

      const parsedDateMinus1 = new Date(row.SecondDateCode);
      parsedDateMinus1.setDate(parsedDateMinus1.getDate() - 1);
      row.SecondMinMinDate = parsedDateMinus1.toISOString().slice(0, 10);


    }
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

  saveRow(row): void {
    if (row.BreakShift == true) {
      const obj = [
        {
          "id": row.id,
          "dateCode": row.dateCode,
          "employeeId": row.employeeId,
          "employeeCode": row.employeeCode,
          "employeeName": row.employeeName,
          "companyCode": row.companyCode,
          "branchCode": row.branchCode,
          "inDate": row.inDate ? row.inDate : row.dateCode,
          "inTime": row.inTime,
          "outDate": row.outDate ? row.outDate : row.dateCode, 
          "outTime": row.outTime,
          "totalHours": row.totalHours,
          "otHours": row.otHours,
          "totalQty": row.totalQty,
          "shift": row.shift,
          "overtimeCode": row.overtimeCode,
          "entryStatus": row.entryStatus,
          "entryHrs": row.entryHrs,
          "exitStatus": row.exitStatus,
          "exitHrs": row.exitHrs,
          "isFinalized": row.isFinalized,
          "isHoliday": row.isHoliday,
          "isWeeklyOff": row.isWeeklyOff,
          "effectiveHrs": row.effectiveHrs,
          "sessionNo": row.sessionNo,
          "isApproved": row.isApproved,
          "status": row.status,
          "insignFileName": row.insignFileName,
          "outsignFileName": row.outsignFileName,
          "createdby": row.createdby,
          "createddate": row.createddate,
          "lastmodifiedby": row.lastmodifiedby,
          "lastmodifieddate": row.lastmodifieddate,
          "approvedby": row.approvedby,
          "approveddate": row.approveddate,
          "regularHours": row.regularHours,
          "division": row.division,
          "application": row.application,
          "comments": row.comments,
          "categoryCode": row.categoryCode,
          "attStatus": row.attStatus,
          "inLocation": row.inLocation,
          "inDevice": row.inDevice,
          "lastInTime": row.lastInTime,
          "needValidation": row.needValidation,
          "outLocation": row.outLocation,
          "outDevice": row.outDevice,
          "approved": row.approved,
          "isModified": row.isModified,
          "payrollRan": row.payrollRan,
          "dayName": row.dayName,
          "earlyBy": row.earlyBy,
          "leftLateBy": row.leftLateBy,
          "lateBy": row.lateBy,
          "leftEarlyBy": row.leftEarlyBy,
          "totalHours1": row.totalHours1,
          "effectiveHrs1": row.effectiveHrs1,
          "expand": row.expand,
          "OrginalInTime": row.OrginalInTime,
          "OrginalInDate": row.OrginalInDate,
          "OrginalOutDate": row.OrginalOutDate,
          "OrginalOutTime": row.OrginalOutTime,
          "OrginalShift": row.OrginalShift,
          "loading": row.loading,
          "inDateEdit": row.inDateEdit,
          "outDateEdit": row.outDateEdit,
          "inDateEditMode": row.inDateEditMode,
          "outDateEditMode": row.outDateEditMode,
          "BreakShift": row.BreakShift,
        },
        {
          "id": row.SecondId,
          "dateCode": row.SecondDateCode,
          "employeeId": row.SecondEmployeeId,
          "employeeCode": row.SecondEmployeeCode,
          "employeeName": row.SecondEmployeeName,
          "companyCode": row.SecondCompanyCode,
          "branchCode": row.SecondBranchCode,
          "inDate": row.SecondInDate ? row.SecondInDate : row.SecondDateCode, 
          "inTime": row.SecondInTime,
          "outDate": row.SecondOutDate ? row.SecondOutDate : row.SecondDateCode, 
          "outTime": row.SecondOutTime,
          "totalHours": row.SecondTotalHours,
          "otHours": row.SecondOtHours,
          "totalQty": row.SecondTotalQty,
          "shift": row.SecondShift,
          "overtimeCode": row.SecondOvertimeCode,
          "entryStatus": row.SecondEntryStatus,
          "entryHrs": row.SecondEntryHrs,
          "exitStatus": row.SecondExitStatus,
          "exitHrs": row.SecondExitHrs,
          "isFinalized": row.SecondIsFinalized,
          "isHoliday": row.SecondIsHoliday,
          "isWeeklyOff": row.SecondIisWeeklyOff,
          "effectiveHrs": row.SecondEffectiveHrs,
          "sessionNo": row.SecondSessionNo,
          "isApproved": row.SecondIsApproved,
          "status": row.SecondStatus,
          "insignFileName": row.SecondInsignFileName,
          "outsignFileName": row.SecondOutsignFileName,
          "createdby": row.SecondCreatedby,
          "createddate": row.SecondCreateddate,
          "lastmodifiedby": row.SecondLastmodifiedby,
          "lastmodifieddate": row.SecondLastmodifieddate,
          "approvedby": row.SecondApprovedby,
          "approveddate": row.SecondApproveddate,
          "regularHours": row.SecondRegularHours,
          "division": row.SecondDivision,
          "application": row.SecondApplication,
          "comments": row.SecondComments,
          "categoryCode": row.SecondCategoryCode,
          "attStatus": row.SecondAttStatus,
          "inLocation": row.SecondInLocation,
          "inDevice": row.SecondInDevice,
          "lastInTime": row.SecondLastInTime,
          "needValidation": row.SecondNeedValidation,
          "outLocation": row.SecondOutLocation,
          "outDevice": row.SecondOutDevice,
          "approved": row.SecondApproved,
          "isModified": row.SecondIsModified,
          "payrollRan": row.SecondPayrollRan,
          "dayName": row.SecondDayName,
          "earlyBy": row.SecondEarlyBy,
          "leftLateBy": row.SecondLeftLateBy,
          "lateBy": row.SecondLateBy,
          "leftEarlyBy": row.SecondLeftEarlyBy,
          "totalHours1": row.SecondTotalHours1,
          "effectiveHrs1": row.SecondEffectiveHrs1,
          "expand": row.SecondExpand,
          "OrginalInTime": row.SecondOrginalInTime,
          "OrginalInDate": row.SecondOrginalInDate,
          "OrginalOutDate": row.SecondOrginalOutDate,
          "OrginalOutTime": row.SecondOrginalOutTime,
          "OrginalShift": row.SecondOrginalShift,
          "loading": row.SecondLoading,
          "inDateEdit": row.SecondInDateEdit,
          "outDateEdit": row.SecondOutDateEdit,
          "inDateEditMode": row.SecondInDateEditMode,
          "outDateEditMode": row.SecondOutDateEditMode,
          "BreakShift": row.BreakShift,
        }
      ]
      this.spinner.show();
      obj.forEach(X => {
        this.httpPutService.doPut('timesheet', JSON.stringify(X))
          .subscribe((res: any) => {
            this.spinner.hide();
            if (res.status.message === 'SUCCESS') {
              Swal.fire({
                title: 'Success!',
                text: 'Data updated successfully',
                icon: 'success',
              });
              this.modified();
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
      })


    } else {
      const obj = {
        ...row,
        inDate: row.inDate ? row.inDate : row.dateCode,
        outDate: row.outDate ? row.outDate : row.dateCode
      }
      this.spinner.show();
      this.httpPutService.doPut('timesheet', JSON.stringify(obj))
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
            row.totalHours = res.response.totalHours;
            row.effectiveHrs = res.response.effectiveHrs;

            Object.assign(row, res.response);
            const recordIndex = this.allRecords.findIndex(x => x.id == row.id);
            const resultInMinutes = row.totalHours ? row.totalHours * 60 : 0;
            const h = Math.floor(resultInMinutes / 60);
            const hours = h < 10 ? '0' + h : h
            const m = Math.floor(resultInMinutes % 60);
            const minutes = m < 10 ? '0' + m : m
            row.totalHours1 = hours + ':' + minutes

            const resultInMinuteseffectiveHrs = row.effectiveHrs ? row.effectiveHrs * 60 : 0;
            const heffectiveHrs = Math.floor(resultInMinuteseffectiveHrs / 60);
            const hourseffectiveHrs = heffectiveHrs < 10 ? '0' + heffectiveHrs : heffectiveHrs
            const meffectiveHrs = Math.floor(resultInMinuteseffectiveHrs % 60);
            const minuteseffectiveHrs = meffectiveHrs < 10 ? '0' + meffectiveHrs : meffectiveHrs
            row.effectiveHrs1 = hourseffectiveHrs + ':' + minuteseffectiveHrs
            this.allRecords[recordIndex] = row;
            this.allRecordsTemp[recordIndex] = row;
            const validIndex = this.validationNeededRows.findIndex(x => x.id == row.id);
            this.validationNeededRows[validIndex] = row;
            this.validationNeededOrgTemp[validIndex] = row;
            const unapprovedIndex = this.unApprovedRows.findIndex(x => x.id == row.id);
            this.unApprovedRows[unapprovedIndex] = row;
            this.unApprovedtemp[unapprovedIndex] = row;

            const approveRecIndex = this.isApprovedRecords.findIndex(x => x.id == row.id);
            this.isApprovedRecords[approveRecIndex] = row;
            this.isApprovedRecordsTemp[approveRecIndex] = row;
            // this.unApprovedtemp[index] = row;

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
  }
  approveRecord(): void {
    this.spinner.show();
    this.httpPutService.doPut('timesheet/approve', this.approvedRowsPost)
      .subscribe((res: any) => {
        this.spinner.hide();
        if (res === 'SUCCESS') {
          Swal.fire({
            title: 'Success!',
            text: 'Data updated successfully',
            icon: 'success',
          })
          this.approvedRowsPost.forEach(y => {
            const find = this.unApprovedRows.find(x => x.id == y.id)
            if (find) {
              this.isApprovedRecords.push(find);
              find.isApproved = true;
            }
          })
          this.tab2;
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
  allrecordstab() {
    this.firstTab = false;
    this.secondTab = false;
    this.thirdTab = false;
    this.allRecordsTab = true;

  }
  tab1() {
    this.firstTab = true;
    this.secondTab = false;
    this.thirdTab = false;
    this.allRecordsTab = false;

  }
  tab2() {
    this.firstTab = false;
    this.secondTab = true;
    this.thirdTab = false;
    this.allRecordsTab = false;

  }
  tab3() {
    this.firstTab = false;
    this.secondTab = false;
    this.thirdTab = true;
    this.allRecordsTab = false;
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
    this.allRecords = this.allRecords.sort((a, b) => {
      if (a[col] < b[col]) {
        return this.sortOrder === 'asc' ? -1 : 1;
      }
      if (a[col] > b[col]) {
        return this.sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });
    this.validationNeededRows = this.validationNeededRows.sort((a, b) => {
      if (a[col] < b[col]) {
        return this.sortOrder === 'asc' ? -1 : 1;
      }
      if (a[col] > b[col]) {
        return this.sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });
    this.isApprovedRecords = this.isApprovedRecords.sort((a, b) => {
      if (a[col] < b[col]) {
        return this.sortOrder === 'asc' ? -1 : 1;
      }
      if (a[col] > b[col]) {
        return this.sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });
    this.unApprovedRows = this.unApprovedRows.sort((a, b) => {
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
  saveExcel() {
    this.spinner.show();
    this.reportObj.from =
      this.selectedDateRange.startDate.format('YYYY-MM-DD');
    this.reportObj.to = this.selectedDateRange.endDate.format('YYYY-MM-DD');
    this.httpGetService.getExcel('reports/unValidatetimesheet/xls?from=' + this.reportObj.from + '&to=' + this.reportObj.to + '&deptCode=' + this.reportObj.deptCode +
      '&empCode=' + this.reportObj.empCode + '&project=' + this.reportObj.projectCode + '&shift=' + this.reportObj.shiftCode).subscribe((res: any) => {
        this.spinner.hide();
        const data: Blob = new Blob([res], { type: EXCEL_TYPE });
        FileSaver.saveAs(
          data,
          'Un_Validated_Timesheet' + new Date().getTime() + EXCEL_EXTENSION
        );
        this.global.showSuccessPopUp('Excel', 'success');
      },
        err => {
          this.spinner.hide();
          Swal.fire({
            title: 'Error!',
            text: err.error.status.message,
            icon: 'error',
          })
        });
  }
  savePDF(): void {
    this.spinner.show();
    this.httpGetService.getPdf('reports/unValidatetimesheet/pdf?empCode=' + this.reportObj.empCode + '&from=' + this.reportObj.from + '&to=' + this.reportObj.to
      + '&project=' + this.reportObj.projectCode + '&deptCode=' + this.reportObj.deptCode).subscribe((res: any) => {
        this.spinner.hide();
        const file = new Blob([res], { type: 'application/pdf' });
        FileSaver.saveAs(file, 'Timesheet-report' + new Date().getTime() + '.pdf');
        const fileURL = URL.createObjectURL(file);
        window.open(fileURL);
        this.global.showSuccessPopUp('Pdf', 'success');
      },
        err => {
          this.spinner.hide();
          Swal.fire({
            title: 'Error!',
            text: err.error.status.message,
            icon: 'error',
          });
        })
  }


  saveExcelForAllRecords() {
    this.spinner.show();
    this.reportObj.from =
      this.selectedDateRange.startDate.format('YYYY-MM-DD');
    this.reportObj.to = this.selectedDateRange.endDate.format('YYYY-MM-DD');
    this.httpGetService.getExcel('reports/presentXls?from=' + this.reportObj.from + '&to=' +
      this.reportObj.to + '&empCode=' + this.reportObj.empCode + '&shiftCode=' + this.reportObj.shiftCode).subscribe((res: any) => {
        this.spinner.hide();
        const data: Blob = new Blob([res], { type: EXCEL_TYPE });
        FileSaver.saveAs(
          data,
          'Timesheet_Present_Records' + new Date().getTime() + EXCEL_EXTENSION
        );
        this.global.showSuccessPopUp('Excel', 'success');
      },
        err => {
          this.spinner.hide();
          Swal.fire({
            title: 'Error!',
            text: err.error.status.message,
            icon: 'error',
          })
        });
  }

  savePdfForAllrecords() {
    this.spinner.show();
    this.httpGetService.getPdf('reports/present/pdf?empCode=' + this.reportObj.empCode + '&from=' + this.reportObj.from + '&to=' + this.reportObj.to
      + '&shiftCode=' + this.reportObj.shiftCode).subscribe((res: any) => {
        this.spinner.hide();
        const file = new Blob([res], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);
        this.global.showSuccessPopUp('Pdf', 'success');
        window.open(fileURL);
      },
        err => {
          this.spinner.hide();
          Swal.fire({
            title: 'Error!',
            text: err.error.status.message,
            icon: 'error',
          });
        })
  }

  savePdfForNeedApproval() {
    this.spinner.show();
    this.httpGetService.getPdf('reports/UnApprovedtimesheet/pdf?empCode=' + this.reportObj.empCode + '&from=' + this.reportObj.from + '&to=' + this.reportObj.to
      + '&shiftCode=' + this.reportObj.shiftCode + '&project=' + this.reportObj.projectCode).subscribe((res: any) => {
        this.spinner.hide();
        const file = new Blob([res], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);
        this.global.showSuccessPopUp('Pdf', 'success');
        window.open(fileURL);
      },
        err => {
          this.spinner.hide();
          Swal.fire({
            title: 'Error!',
            text: err.error.status.message,
            icon: 'error',
          });
        })
  }

  saveExcelForNeedApproval() {
    this.spinner.show();
    this.reportObj.from =
      this.selectedDateRange.startDate.format('YYYY-MM-DD');
    this.reportObj.to = this.selectedDateRange.endDate.format('YYYY-MM-DD');
    this.httpGetService.getExcel('reports/unApprovedtimesheet/xls?from=' + this.reportObj.from + '&to=' +
      this.reportObj.to + '&empCode=' + this.reportObj.empCode + '&deptCode=' + this.reportObj.deptCode + '&shift=' + this.reportObj.shiftCode + '&project=' + this.reportObj.projectCode).subscribe((res: any) => {
        this.spinner.hide();
        const data: Blob = new Blob([res], { type: EXCEL_TYPE });
        FileSaver.saveAs(
          data,
          'Timesheet_UnApproved_Records' + new Date().getTime() + EXCEL_EXTENSION
        );
        this.global.showSuccessPopUp('Excel', 'success');
      },
        err => {
          this.spinner.hide();
          Swal.fire({
            title: 'Error!',
            text: err.error.status.message,
            icon: 'error',
          })
        });
  }

  expandRow222(row: any): void {
    row.logRecords = [];
    row.expand = true;
    row.loading = 'loading';
    this.httpGetService.getMasterList('timesheetlogBytimesheetid?timesheetid=' + row.id).subscribe(
      (res: any) => {
        const newlogRecords = res.response;       
        newlogRecords.forEach((x) => {
          if (x.image) {
            x.empImage = 'data:image/jpeg;base64,' + x.image;
          }
        });
  
        row.logRecords = newlogRecords;
        row.loading = 'success';
      }, (error) => {
        row.loading = 'failed';
        console.error(error);
    })  
    if (row.BreakShift) {
      this.httpGetService.getMasterList('timesheetlogBytimesheetid?timesheetid=' + row.SecondId).subscribe(
        (res: any) => {
          const secondRecords = res.response;
          secondRecords.forEach(element => {
            if(element.image){
              element.empImage = 'data:image/jpeg;base64,' + element.image;
            }
          });
          row.logRecords = row.logRecords.concat(secondRecords);
          row.loading = 'success';
        }, (error) => {
          row.loading = 'failed';
          console.error(error);
        })
    }
  }

  expandRow(row): void {
    // row.logRecords = [];
    row.expand = true;
    row.loading = 'loading';
  
    // Helper function to process records
    const processRecords = (records: any[]) => {
      records.forEach((x) => {
        if (x.image) {
          x.empImage = 'data:image/jpeg;base64,' + x.image;
        }
      });
      return records;
    };
  
    // First API call wrapped in a promise
    const firstApiCall = new Promise<any[]>((resolve, reject) => {
      this.httpGetService.getMasterList('timesheetlogBytimesheetid?timesheetid=' + row.id).subscribe(
        (res: any) => {
          resolve(processRecords(res.response));
        },
        (error) => {
          reject(error);
        }
      );
    });
  
    // Second API call wrapped in a promise
    const secondApiCall = row.BreakShift
      ? new Promise<any[]>((resolve, reject) => {
          this.httpGetService.getMasterList('timesheetlogBytimesheetid?timesheetid=' + row.SecondId).subscribe(
            (res: any) => {
              resolve(processRecords(res.response));
            },
            (error) => {
              reject(error);
            }
          );
        })
      : Promise.resolve([]); // If BreakShift is false, resolve with an empty array
  
    // Wait for both API calls to complete
    Promise.all([firstApiCall, secondApiCall])
      .then((results) => {
        const [firstRecords, secondRecords] = results;
        row.logRecords = firstRecords.concat(secondRecords);
        row.loading = 'success';
      })
      .catch((error) => {
        row.loading = 'failed';
        console.error(error);
      });
  }
  
  

  collapseRow(row: any): void {
    row.expand = false;
    row.highlight = false;
    row.logRecords = [];
  }
  previewRow(data) {
    this.PreviewObject = 'data:image/jpeg;base64,' + data;
  }

}

import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as FileSaver from 'file-saver';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';
import { HttpPutService } from 'src/app/services/http-put.service';
import Swal from 'sweetalert2';

const EXCEL_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
@Component({
  selector: 'app-timesheet-log',
  templateUrl: './timesheet-log.component.html',
  styleUrls: ['./timesheet-log.component.scss']
})
export class TimesheetLogComponent implements OnInit, AfterViewInit {
  departments_list = [];
  employees_list = [];
  rows = [];
  failedTemp = [];
  firstTab = true;
  secondTab = false;
  failedRows = [];
  config: any;
  config1: any;
  temp = [];
  stopSpinner = true;
  dateFormat: string;
  sortOrder = 'desc';
  sortColumn = 'employeeName';
  reportObj = {
    department: 'ALL',
    employeeCode: 'ALL',
    from: '',
    to: '',
  };
  hasPermissionToApprove = false;
  hasPermissionToUpdate = false;
  searchInFailed: string;
  searchInAll: string;
  selectedDateRange = {
    startDate: moment().startOf('day'),
    endDate: moment().endOf('day'),
  };
  maxDate = {
    endDate: moment().endOf('day'),
  };
  constructor(private httpGet: HttpGetService,
    private httpPut: HttpPutService,
    private acRoute: ActivatedRoute,
    private spinner: NgxSpinnerService, private global: GlobalvariablesService,
    private router: Router) {
    this.config = {
      itemsPerPage: 25,
      currentPage: 1,
      totalItems: this.rows.length,
    };
    this.config1 = {
      itemsPerPage: 25,
      currentPage: 1,
      totalItems: this.failedRows.length,
    };
  }
  ngOnInit() {
    this.acRoute.data.subscribe(async data => {
      const permission = data.condition
      this.hasPermissionToUpdate = permission?.hasPermissionToUpdate
      this.hasPermissionToApprove = permission?.hasPermissionToApprove
    });
    this.getDepartments();
    this.dateFormat = this.global.dateFormat;
  }
  ngAfterViewInit() {
    const rightCalendar = document.getElementsByClassName('calendar right');
    if (rightCalendar.item(0)) {
      rightCalendar.item(0).remove();
    }
  }
  getDepartments() {
    this.httpGet.getMasterList('depts/active').subscribe((res: any) => {
      if (res.response.length > 0) {
        res.response.unshift({
          deptCode: 'ALL',
          deptName: 'ALL'
        })
      }
      this.departments_list = res.response;
      if (this.reportObj.department == 'ALL') {
        this.getAllEmps();
      } else {
        this.getEmpByDepartments();
      }
    },
      err => {
        console.error(err.error.status.message);
      }
    );
  }
  getAllEmps() {
    this.employees_list = [];
    this.stopSpinner = false;
    // employeesByCatAndDept?department=ALL&category=ALL
    this.httpGet.getMasterList('employeesByCatAndDept?department=all&category=ALL').subscribe(
      (res: any) => {
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
        this.employees_list = val;
      },
      err => {
        this.stopSpinner = true;
        console.error(err.error.status.message);
      })
  }
  getEmpByDepartments() {
    this.employees_list = [];
    this.stopSpinner = false;
    this.httpGet.getMasterList('employeesByCatAndDept?department=' + this.reportObj.department + '&category=ALL').subscribe(
      (res: any) => {
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
        this.employees_list = val;
      },
      err => {
        this.stopSpinner = true;
        console.error(err.error.status.message);
      })
  }
  getRecords() {
    this.submit();
    this.getAllFailedTimelogs();
  }
  submit() {
    this.spinner.show();
    this.reportObj.from =
      this.selectedDateRange.startDate.format('YYYY-MM-DD');
    this.reportObj.to = this.selectedDateRange.endDate.format('YYYY-MM-DD');
    this.httpGet.getMasterList('timesheetlogByDateCode?from=' + this.reportObj.from + '&to=' + this.reportObj.to + '&employeeCode=' +
      this.reportObj.employeeCode + '&deptCode=' + this.reportObj.department).subscribe((res: any) => {
        this.spinner.hide();
        this.rows = res.response;
        this.temp = res.response;
        this.config.totalItems = this.rows.length;
        // this.sortData('employeeName')
      },
        err => {
          this.spinner.hide();
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: err.error.status.message,
          })
        })
  }

  getAllFailedTimelogs() {
    // this.spinner.show();
    this.reportObj.from =
      this.selectedDateRange.startDate.format('YYYY-MM-DD');
    this.reportObj.to = this.selectedDateRange.endDate.format('YYYY-MM-DD');
    this.httpGet.getMasterList('failedtimesheetlogs?from=' + this.reportObj.from + '&to=' + this.reportObj.to + '&employeeCode=' +
      this.reportObj.employeeCode + '&deptCode=' + this.reportObj.department).subscribe((res: any) => {
        // this.spinner.hide();
        res.response.forEach(element => {
          element.isedit = false;
          element.Orgstatus = element.status
        });
        this.failedRows = res.response;
        this.failedTemp = res.response;
        this.config1.totalItems = this.failedRows.length
      },
        err => {
          // this.spinner.hide();
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: err.error.status.message,
          })
        })
  }
  saveExcel() {
    this.spinner.show();
    this.reportObj.from =
      this.selectedDateRange.startDate.format('YYYY-MM-DD');
    this.reportObj.to = this.selectedDateRange.endDate.format('YYYY-MM-DD');
    this.httpGet.getExcel('reports/biometric/xls?from=' + this.reportObj.from + '&to=' + this.reportObj.to + '&deptCode=' + this.reportObj.department +
      '&employeeCode=' + this.reportObj.employeeCode).subscribe((res: any) => {
        this.spinner.hide();
        const data: Blob = new Blob([res], { type: EXCEL_TYPE });
        FileSaver.saveAs(
          data,
          'Biometric Logs' + new Date().getTime() + EXCEL_EXTENSION
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
  pageChanged(event) {
    this.config.currentPage = event;
  }
  pageChangedFailed(event) {
    this.config1.currentPage = event;

  }
  resultsPerPage(event) {
    this.config.itemsPerPage =
      event.target.value == 'all' ? this.temp.length : event.target.value;
    this.config.currentPage = 1;

  }
  resultsPerPagefailed(event) {
    this.config1.itemsPerPage =
      event.target.value == 'all' ? this.failedTemp.length : event.target.value;
    this.config1.currentPage = 1;
  }
  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    if (val == '') {
      this.rows = [...this.temp];
    } else {
      const temp = this.temp.filter(function (d) {
        return (d.employeeName && d.employeeName.toLowerCase().indexOf(val) !== -1) || (d.employeeCode && d.employeeCode.toLowerCase().indexOf(val) !== -1) || !val;
      });
      this.rows = temp;


    }
  }
  updateFilterfailed(event) {
    const val = event.target.value.toLowerCase();
    if (val == '') {
      this.failedRows = [...this.failedTemp];
    } else {
      const temp = this.failedTemp.filter(function (d) {
        return (d.employeeName && d.employeeName.toLowerCase().indexOf(val) !== -1) || (d.employeeCode && d.employeeCode.toLowerCase().indexOf(val) !== -1) || !val;
      });
      this.failedRows = temp;
    }
  }
  back() {
    this.router.navigateByUrl('/dashboard');
  }

  editData(row) {
    row.isedit = true;
  }
  saveRow(row) {
    this.spinner.show();
    this.httpPut.doPut('timesheetlog', row).subscribe((res: any) => {
      this.spinner.hide();
      if (res.status.message == 'SUCCESS') {
        Swal.fire({
          title: 'Success!',
          text: 'Record Updated',
          icon: 'success'
        })
      }
      else {
        Swal.fire({
          text: res.status.message,
          icon: 'warning'
        })
      }
      row.isedit = false;
    },
      err => {
        this.spinner.hide();
        Swal.fire({
          title: 'Error!',
          text: err.error.status.message,
          icon: 'error'
        })
      })
  }
  Undo(row, i, source) {
    if (source == 'failedRecords') {
      // row.status = this.failedRows[i]?.status; 
      row.isedit = false;
      row.status = this.failedRows[i].status;
      this.getRecords();
    } else if (source == 'allRecords') {
      // row.status = this.failedRows[i]?.status;
      row.isedit = false;
      row.status = this.rows[i].status;
      this.getRecords();
      
    }
  }
  tabOne() {
    this.firstTab = true;
    this.secondTab = false;
  }
  tabTwo() {
    this.firstTab = false;
    this.secondTab = true;
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
    this.failedRows = this.failedRows.sort((a, b) => {
      if (a[col] < b[col]) {
        return this.sortOrder === 'asc' ? -1 : 1;
      }
      if (a[col] > b[col]) {
        return this.sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });
    this.rows = this.rows.sort((a, b) => {
      if (a[col] < b[col]) {
        return this.sortOrder === 'asc' ? -1 : 1;
      }
      if (a[col] > b[col]) {
        return this.sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }
}

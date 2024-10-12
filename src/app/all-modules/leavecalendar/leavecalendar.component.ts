import { Component, ViewChild, ViewEncapsulation } from '@angular/core';

import { MatDatepicker } from '@angular/material/datepicker';
import moment, { Moment } from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { HttpGetService } from 'src/app/services/http-get.service';
import Swal from 'sweetalert2';

import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
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
interface LeaveData {
  date: string;
  leave: string;
}
@Component({
  selector: 'app-leavecalendar',
  templateUrl: './leavecalendar.component.html',
  styleUrls: ['./leavecalendar.component.scss'], providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
  encapsulation: ViewEncapsulation.None,
})

export class LeavecalendarComponent {
  @ViewChild('picker') datePickerElement = MatDatepicker;
  date: any = moment();
  year: any = moment().format('YYYY');
  month: any = moment().format('MM');

  reportObj = {
    pjCode: 'ALL',
    department: 'ALL',
    empCode: 'ALL',
  };
  sortOrder = 'desc';
  sortColumn = 'name';
  temp = [];
  rows = [];
  departments = [];
  categorys = [];
  stopSpinner = false;
  employee = [];
  monthly_dates: any = [];
  config: any;
  leaveRecords = [];
  message: string;
  constructor(private httpGet: HttpGetService,
    private spinner: NgxSpinnerService
  ) {
    this.getMonthlyDates();
    this.config = {
      itemsPerPage: 25,
      currentPage: 1,
      totalItems: this.rows.length,
    };
  }

  setMonthAndYear(
    normalizedMonthAndYear: Moment,
    datepicker: MatDatepicker<Moment>
  ) {
    this.date = normalizedMonthAndYear;
    this.month = normalizedMonthAndYear.format('MM');
    this.year = normalizedMonthAndYear.format('YYYY');
    this.monthly_dates = [];
    this.rows = [];
    this.getMonthlyDates();
    datepicker.close();
  }
  getMonthlyDates() {
    let daysInMonth = moment(
      `${this.year}-${this.month}`,
      'YYYY-MM'
    ).daysInMonth();
    this.monthly_dates = [];
    while (daysInMonth) {
      const current = moment(`${this.year}-${this.month}`, 'YYYY-MM').date(
        daysInMonth
      );
      this.monthly_dates.push(current.format('YYYY-MM-DD'));
      daysInMonth--;
    }
    this.monthly_dates = this.monthly_dates.reverse();
    this.getDepartments();
  }

  getDepartments() {
    this.httpGet.getMasterList('depts/active').subscribe((res: any) => {
      res.response.unshift({
        deptCode: 'ALL',
        deptName: 'ALL'
      })
      this.departments = res.response;
    })
    this.getPayrollList();
  }
  getPayrollList() {
    this.httpGet.getMasterList('empcategorys').subscribe(
      (res: any) => {
        res.response.unshift({ categoryCode: 'ALL' })
        this.categorys = res.response;
        this.employeesByDepartmentAndProject()
      }
    );
  }
  employeesByDepartmentAndProject() {
    this.stopSpinner = false;
    this.httpGet
      .getMasterList('employeesByCatAndDept?department=' + this.reportObj.department + '&category=' + this.reportObj.pjCode)
      .subscribe((res: any) => {
        if (res.response.length > 0) {
          res.response.unshift({
            employeeCode: 'ALL',
            employeeName: 'ALL'
          })
        }
        this.employee = res.response;
        this.stopSpinner = true;
        this.reportObj.empCode = res.response[0].employeeCode;
        this.getLeaveCal();
      },
        err => {
          this.stopSpinner = false;
          console.error(err.error.status.message);
        }
      );
  }


  getLeaveCal() {
    this.spinner.show();
    this.rows = [];
    this.leaveRecords = [];
    this.httpGet.getMasterList(
      'empLeavesByDate?month=' + this.month + '&year=' + this.year + '&employeeCode=' + this.reportObj.empCode
      + '&deptCode=' + this.reportObj.department + '&projectCode=' + this.reportObj.pjCode
    ).subscribe((res: any) => {
      res.response.forEach(element => {
        if (element.status == "APPROVED") {
          this.leaveRecords.push(element)
        }
      });
      const allRecords = this.leaveRecords.flatMap(this.createRecordsForDateRange);
      const filteredRecords = allRecords.filter(record => this.monthly_dates.includes(record.date));
      this.pass(filteredRecords)
      this.spinner.hide();
      if (this.leaveRecords.length == 0) {
        this.message = 'modified';
        Swal.fire({
          icon: 'info',
          title: 'NO RECORD FOUND!',
        });
      }
    },
      (err) => {
        this.spinner.hide();
        this.message = 'error';
        console.error(err.error.status.message);
      })
  }

  createRecordsForDateRange(leaveRecord) {
    const records = [];
    const startDate = new Date(leaveRecord.leaveFromdate);
    const endDate = new Date(leaveRecord.leaveTodate);
    const employeeCode = leaveRecord.employeeCode;
    const employeeName = leaveRecord.employeeName;
    const leave = leaveRecord.leaveTypeCode;
    for (let date = startDate; date <= endDate; date.setDate(date.getDate() + 1)) {
      const formattedDate = date.toISOString().split('T')[0];
      records.push({
        employeeCode,
        employeeName,
        date: formattedDate,
        leave
      });
    }
    return records;
  }
  pass(filteredRecords) {
    const transformedData = {};
    filteredRecords.forEach(record => {
      const { employeeCode, employeeName, date, leave } = record;
      if (!transformedData[employeeCode]) {
        transformedData[employeeCode] = { code: employeeCode, name: employeeName, data: [] };
      }
      transformedData[employeeCode].data.push({ date, leave });
    });
    let resultArray = []
    resultArray = Object.values(transformedData);
    for (const employee of resultArray) {
      const employeeData = employee.data;
      for (const date of this.monthly_dates) {
        const matchingDate = employeeData.find((record) => record.date === date);
        if (!matchingDate) {
          employeeData.push({
            date: date,
            leave: '-',
          });
        }
      }
    }
    resultArray.forEach((record) => {
      record.data.sort((a, b) => (a.date < b.date ? -1 : 1));
    });
    this.rows = resultArray;
    this.temp = resultArray;
    this.sortData('name')
  }
  modified() {
    this.rows = [];
    this.temp = [];
    this.message = 'clickOnsubmit';
  }

  resultsPerPage(event) {
    this.config.itemsPerPage = event.target.value == 'all' ? this.temp.length : event.target.value;
    this.config.currentPage = 1;
  }


  pageChanged(event) {
    this.config.currentPage = event;
  }
  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    if (val == '') {
      this.rows = [...this.temp];
    } else {
      const temp = this.temp.filter(function (d) {
        return d.name.toLowerCase().indexOf(val) !== -1 || d.code.toLowerCase().indexOf(val) !== -1 || !val;
      });
      this.rows = temp;
    }
    this.config.totalItems = this.rows.length;
    this.config.currentPage = 1;
  }

  getColspan(leaveData: LeaveData[], index: number): number {
    let colspan = 1;
    for (let i = index + 1; i < leaveData.length; i++) {
      if (leaveData[i].leave === leaveData[index].leave && leaveData[i].leave !== '-') {
        colspan++;
      } else {
        break;
      }
    }
    return colspan;
  }

  shouldShowCell(leaveData: LeaveData[], index: number): boolean {
    if (index === 0) return true;
    return leaveData[index].leave !== leaveData[index - 1].leave || leaveData[index].leave === '-';
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

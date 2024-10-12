import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as FileSaver from 'file-saver';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';
import { HttpPostService } from 'src/app/services/http-post.service';
import { UtilService } from 'src/app/services/util.service';
import Swal from 'sweetalert2';

const EXCEL_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Component({
  selector: 'app-early-late-reports',
  templateUrl: './early-late-reports.component.html',
  styleUrls: ['./early-late-reports.component.scss']
})
export class EarlyLateReportsComponent implements OnInit, AfterViewInit {

  earlyList = [
    { name: 'Early-In', value: 'Early In' },
    { name: 'Early-Out', value: 'Early Out' },
    { name: 'Late-In', value: 'Late In' },
    { name: 'Late-Out', value: 'Late Out' },
    { name: 'Both Early-In & Late-Out', value: 'bothEarlyInAndLateOut' },
    { name: 'Both Late-In & Early-Out', value: 'bothLateInAndEarlyOut' },
  ];
  maxDate = {
    endDate: moment().endOf('day'),
  };
  message: string;
  config: any;
  TotalQty: string;
  rows = [];
  temp = [];

  selectedDateRange = {
    startDate: moment().startOf('day'),
    endDate: moment().endOf('day'),
  };

  employees_list = [];
  shifts = [];
  reportObj = {
    employeeCode: 'ALL',
    from: '',
    to: '',
    statusCode: 'bothLateInAndEarlyOut',
    status: '',
    shiftCode: 'ALL',

  };

  constructor(
    private httpPostService: HttpPostService,
    private spinner: NgxSpinnerService,
    private global: GlobalvariablesService,
    private httpGetService: HttpGetService,
    private utilServ: UtilService,
    private router: Router,
    private httpGet: HttpGetService,

  ) {
    this.config = {
      itemsPerPage: 25,
      currentPage: 1,
      totalItems: this.rows.length,
    };
  }

  ngOnInit(): void {
    this.getEmployees();
    this.getShifts();
  }
  ngAfterViewInit() {
    const rightCalendar = document.getElementsByClassName('calendar right');
    if (rightCalendar.item(0)) {
      rightCalendar.item(0).remove();
    }
  }
  getEmployees() {
    this.spinner.show();
    this.httpGet.getMasterList('empbydepart').subscribe(
      (res: any) => {
        this.spinner.hide();
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
        this.employees_list = val;
        this.temp = [...this.employees_list];
      },
      (err) => {
        this.spinner.hide();
        console.error(err.error.status.message);
      }
    );
  }

  getShifts() {
    this.httpGetService.getMasterList('shifts/active').subscribe(
      (res: any) => {
        res.response.sort((a, b) => {
          return a.shiftId - b.shiftId
        });
        if (res.response.length > 0) {
          res.response.unshift({
            shiftCode: 'ALL',
          })
        }
        this.shifts = res.response;
      },
      err => {
        console.error(err.error.status.message);
      }
    );
  }

  back() {
    this.router.navigateByUrl('/rpt');
  }

  submit(): void {
    this.rows = [];
    this.config.currentPage = 1;

    this.reportObj.from =
      this.selectedDateRange.startDate.format('YYYY-MM-DD');
    this.reportObj.to = this.selectedDateRange.endDate.format('YYYY-MM-DD');
    if (this.reportObj.statusCode == 'bothEarlyInAndLateOut') {
      this.reportObj.status = 'both'
      this.submitForEarlyInLateOut();
    }
    else if (this.reportObj.statusCode == 'Early In' ||
      this.reportObj.statusCode == 'Late Out') {
      this.reportObj.status = this.reportObj.statusCode
      this.submitForEarlyInLateOut();
    }
    else if (this.reportObj.statusCode == 'bothLateInAndEarlyOut') {
      this.reportObj.status = 'both'
      this.submitForEarlyOutLateIn();
    }
    else if (this.reportObj.statusCode == 'Early Out' ||
      this.reportObj.statusCode == 'Late In') {
      this.reportObj.status = this.reportObj.statusCode
      this.submitForEarlyOutLateIn();
    }
  }
  submitForEarlyInLateOut() {
    this.spinner.show();
    this.httpGetService.getMasterList('reports/earlyCheckInLateCheckOut?from=' +
      this.reportObj.from +
      '&to=' +
      this.reportObj.to +
      '&empCode=' +
      this.reportObj.employeeCode +
      '&shiftCode=' +
      this.reportObj.shiftCode +
      '&status=' +
      this.reportObj.status).subscribe(
        (res: any) => {
          res.response.forEach(element => {
            element.dayName = this.utilServ.dayNames[new Date(element.dateCode).getDay()];
            // const resultInMinutes = element.totalHours ? element.totalHours * 60 : 0;
            // const h = Math.floor(resultInMinutes / 60);
            // const hours = h < 10 ? '0' + h : h
            // const m = Math.floor(resultInMinutes % 60);
            // const minutes = m < 10 ? '0' + m : m
            // element.totalHours1 = hours + ':' + minutes
            element.totalHours1 = this.modifyTime(element.totalHours);
            element.earlyBy1 = this.modifyTime(element.earlyBy);
            element.lateBy1 = this.modifyTime(element.lateBy);
            element.leftLateBy1 = this.modifyTime(element.leftLateBy);
            element.leftEarlyBy1 = this.modifyTime(element.leftEarlyBy);
            element.entryHrs1 = this.modifyTime(element.entryHrs);
            element.exitHrs1 = this.modifyTime(element.exitHrs);


            // element.entryHrs1 = null;
            // const entryHrsMins = element.entryHrs ? element.entryHrs * 60 : 0;
            // const ehh = Math.floor(entryHrsMins / 60);
            // const ehhours = ehh < 10 ? '0' + ehh : ehh
            // const ehm = Math.floor(entryHrsMins % 60);
            // const ehminutes = ehm < 10 ? '0' + ehm : ehm
            // element.entryHrs1 = ehhours + ':' + ehminutes


            // const resultInEXHMinutes = element.exitHrs ? element.exitHrs * 60 : 0;
            // const exh = Math.floor(resultInEXHMinutes / 60);
            // const exhours = exh < 10 ? '0' + exh : exh
            // const exm = Math.floor(resultInEXHMinutes % 60);
            // const exminutes = exm < 10 ? '0' + exm : exm
            // element.exitHrs1 = exhours + ':' + exminutes
          });

          this.rows = res.response;
          this.spinner.hide();
          this.message = 'modified';
          if (this.rows.length == 0) {
            Swal.fire({
              icon: 'info',
              title: 'NO RECORD FOUND!',
              // text: 'ON SELECTED DATA',
            });
          }

          this.temp = [...this.rows];
          // this.getTotal()
        },
        (err) => {
          this.spinner.hide();
          this.message = 'error';
          Swal.fire({
            title: 'Error!',
            text: err.error.status.message,
            icon: 'error',
            timer: 3000,
          });
        }
      );
  }

  modifyTime(time) {
    const resultInEXHMinutes = time ? time * 60 : 0;
    const exh = Math.floor(resultInEXHMinutes / 60);
    const exhours = exh < 10 ? '0' + exh : exh
    const exm = Math.floor(resultInEXHMinutes % 60);
    const exminutes = exm < 10 ? '0' + exm : exm
    return exhours + ':' + exminutes
  }

  submitForEarlyOutLateIn() {
    this.spinner.show();
    this.httpGetService.getMasterList('lateIn/earlyOut?from=' +
      this.reportObj.from +
      '&to=' +
      this.reportObj.to +
      '&empCode=' +
      this.reportObj.employeeCode +
      '&shiftCode=' +
      this.reportObj.shiftCode +
      '&status=' +
      this.reportObj.status).subscribe(
        (res: any) => {
          res.response.forEach(element => {
            element.dayName = this.utilServ.dayNames[new Date(element.dateCode).getDay()];
            // element.totalHours1 = null;
            element.totalHours1 = this.modifyTime(element.totalHours);
            element.earlyBy1 = this.modifyTime(element.earlyBy);
            element.lateBy1 = this.modifyTime(element.lateBy);
            element.leftLateBy1 = this.modifyTime(element.leftLateBy);
            element.leftEarlyBy1 = this.modifyTime(element.leftEarlyBy);
            element.entryHrs1 = this.modifyTime(element.entryHrs);
            element.exitHrs1 = this.modifyTime(element.exitHrs);

            // const resultInMinutes = element.totalHours * 60;
            // const h = Math.floor(resultInMinutes / 60);
            // const hours = h < 10 ? '0' + h : h
            // const m = Math.floor(resultInMinutes % 60);
            // const minutes = m < 10 ? '0' + m : m
            // element.totalHours1 = hours + ':' + minutes

            // element.entryHrs1 = null;
            // const entryHrsMins = element.entryHrs ? element.entryHrs * 60 : 0;
            // const ehh = Math.floor(entryHrsMins / 60);
            // const ehhours = ehh < 10 ? '0' + ehh : ehh
            // const ehm = Math.floor(entryHrsMins % 60);
            // const ehminutes = ehm < 10 ? '0' + ehm : ehm
            // element.entryHrs1 = ehhours + ':' + ehminutes


            // element.exitHrs1 = null;
            // const resultInEXHMinutes = element.exitHrs ? element.exitHrs * 60 : 0;
            // const exh = Math.floor(resultInEXHMinutes / 60);
            // const exhours = exh < 10 ? '0' + exh : exh
            // const exm = Math.floor(resultInEXHMinutes % 60);
            // const exminutes = exm < 10 ? '0' + exm : exm
            // element.exitHrs1 = exhours + ':' + exminutes
          });
          this.rows = res.response;
          this.spinner.hide();
          this.message = 'modified';
          if (this.rows.length == 0) {
            Swal.fire({
              icon: 'info',
              title: 'NO RECORD FOUND!',
              // text: 'ON SELECTED DATA',
            });
          }
          this.temp = [...this.rows];
          // this.getTotal()
        },
        (err) => {
          this.spinner.hide();
          this.message = 'error';
          Swal.fire({
            title: 'Error!',
            text: err.error.status.message,
            icon: 'error',
            timer: 3000,
          });
        }
      );
  }
  saveExcel() {
    this.reportObj.from =
      this.selectedDateRange.startDate.format('YYYY-MM-DD');
    this.reportObj.to = this.selectedDateRange.endDate.format('YYYY-MM-DD');
    if (this.reportObj.statusCode == 'bothEarlyInAndLateOut') {
      this.reportObj.status = 'both'
      this.getExcelForearlyInLateOutXls();
    }
    else if (this.reportObj.statusCode == 'Early In' ||
      this.reportObj.statusCode == 'Late Out') {
      this.reportObj.status = this.reportObj.statusCode
      this.getExcelForearlyInLateOutXls();
    }
    else if (this.reportObj.statusCode == 'bothLateInAndEarlyOut') {
      this.reportObj.status = 'both'
      this.getExcelForlateInEarlyOutXls();
    }
    else if (this.reportObj.statusCode == 'Early Out' ||
      this.reportObj.statusCode == 'Late In') {
      this.reportObj.status = this.reportObj.statusCode
      this.getExcelForlateInEarlyOutXls();
    }
  }
  getExcelForearlyInLateOutXls() {
    this.spinner.show();
    this.httpGetService
      .getExcel(
        'reports/earlyInLateOutXls?empCode=' +
        this.reportObj.employeeCode +
        '&from=' +
        this.reportObj.from +
        '&to=' +
        this.reportObj.to +
        '&shiftCode=' +
        this.reportObj.shiftCode +
        '&status=' +
        this.reportObj.status
      )
      .subscribe((res: any) => {
        this.spinner.hide();
        const data: Blob = new Blob([res], { type: EXCEL_TYPE });
        FileSaver.saveAs(
          data,
          this.reportObj.statusCode + new Date().getTime() + EXCEL_EXTENSION
        ); this.global.showSuccessPopUp('Excel', 'success');
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
  getExcelForlateInEarlyOutXls() {
    this.spinner.show();
    this.httpGetService
      .getExcel(
        'reports/lateInEarlyOutXls?empCode=' +
        this.reportObj.employeeCode +
        '&from=' +
        this.reportObj.from +
        '&to=' +
        this.reportObj.to +
        '&shiftCode=' +
        this.reportObj.shiftCode +
        '&status=' +
        this.reportObj.status
      )
      .subscribe((res: any) => {
        this.spinner.hide();
        const data: Blob = new Blob([res], { type: EXCEL_TYPE });
        FileSaver.saveAs(
          data,
          this.reportObj.statusCode + new Date().getTime() + EXCEL_EXTENSION
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
  savePDF() {
    this.reportObj.from =
      this.selectedDateRange.startDate.format('YYYY-MM-DD');
    this.reportObj.to = this.selectedDateRange.endDate.format('YYYY-MM-DD');
    if (this.reportObj.statusCode == 'bothEarlyInAndLateOut') {
      this.reportObj.status = 'both'
      this.getPdfForearlyInLateOutXls();
    }
    else if (this.reportObj.statusCode == 'Early In' ||
      this.reportObj.statusCode == 'Late Out') {
      this.reportObj.status = this.reportObj.statusCode
      this.getPdfForearlyInLateOutXls();
    }
    else if (this.reportObj.statusCode == 'bothLateInAndEarlyOut') {
      this.reportObj.status = 'both'
      this.getPdfForlateInEarlyOutXls();
    }
    else if (this.reportObj.statusCode == 'Early Out' ||
      this.reportObj.statusCode == 'Late In') {
      this.reportObj.status = this.reportObj.statusCode
      this.getPdfForlateInEarlyOutXls();
    }
  }
  getPdfForlateInEarlyOutXls(): void {
    this.spinner.show();
    this.httpGetService.getPdf('reports/lateInEarlyOut/pdf?empCode=' + this.reportObj.employeeCode + '&from=' +
      this.reportObj.from + '&to=' + this.reportObj.to + '&shiftCode=' + this.reportObj.shiftCode + '&status=' + this.reportObj.status
    ).subscribe((res: any) => {
      this.spinner.hide();
      const file = new Blob([res], { type: 'application/pdf' });
      FileSaver.saveAs(file, this.reportObj.statusCode + new Date().getTime() + '.pdf');
      this.global.showSuccessPopUp('Pdf', 'success');
      // const fileURL = URL.createObjectURL(file);
      // window.open(fileURL);
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

  getPdfForearlyInLateOutXls(): void {
    this.spinner.show();
    this.httpGetService.getPdf('reports/earlyCheckInLateCheckOut/pdf?empCode=' + this.reportObj.employeeCode + '&from=' +
      this.reportObj.from + '&to=' + this.reportObj.to + '&shiftCode=' + this.reportObj.shiftCode + '&status=' + this.reportObj.status
    ).subscribe((res: any) => {
      this.spinner.hide();
      const file = new Blob([res], { type: 'application/pdf' });
      FileSaver.saveAs(file, this.reportObj.statusCode + new Date().getTime() + '.pdf');
      this.global.showSuccessPopUp('Pdf', 'success');
      // const fileURL = URL.createObjectURL(file);
      // window.open(fileURL);
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
  pageChanged(event) {
    this.config.currentPage = event;
  }
  resultsPerPage(event) {
    this.config.itemsPerPage =
      event.target.value == 'all' ? this.temp.length : event.target.value;
    this.config.currentPage = 1;
  }
  modified() {
    this.rows = [];
    this.message = 'clickOnsubmit'
  }

}

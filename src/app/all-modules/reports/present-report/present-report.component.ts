import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as FileSaver from 'file-saver';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';
import { HttpPostService } from 'src/app/services/http-post.service';
import Swal from 'sweetalert2';
import { UtilService } from '../../../services/util.service';

const EXCEL_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Component({
  selector: 'app-shifts-report',
  templateUrl: './present-report.component.html',
  styleUrls: ['./present-report.component.scss']
})
export class PresentReportComponent implements OnInit, AfterViewInit {

  config: any;
  TotalQty: string;
  rows = [];
  temp = [];
  dateFormat: string;
  selectedDateRange = {
    startDate: moment().startOf('month'),
    endDate: moment().endOf('month'),
  };
  stopSpinner = true

  employees_list = [];
  message: string;
  reportObj = {
    employeeCode: 'ALL',
    shiftCode: 'ALL',
    from: '',
    to: '',
    department: 'ALL',
  };

  shifts = [];
  departments = [];

  constructor(
    private httpPostService: HttpPostService,
    private spinner: NgxSpinnerService,
    private utilServ: UtilService,
    private global: GlobalvariablesService,
    private httpGetService: HttpGetService,
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
    this.getShifts();
    this.getDepartments();
  }
  ngAfterViewInit() {
    const rightCalendar = document.getElementsByClassName('calendar right');
    if (rightCalendar.item(0)) {
      rightCalendar.item(0).remove();
    }
  }
  getDepartments() {
    this.httpGetService.getMasterList('depts/active').subscribe((res: any) => {
      res.response.unshift({
        deptCode: 'ALL',
        deptName: 'ALL'
      })
      this.reportObj.department = 'ALL';
      this.departments = res.response;
      this.employeesByDepartmentAndProject();
    })
  }

  employeesByDepartmentAndProject() {
    this.stopSpinner = false;
    this.httpGetService
      .getMasterList('employeesByCatAndDept?department=' + this.reportObj.department + '&category=ALL')
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
        this.employees_list = val;
        this.stopSpinner = true;
      },
        err => {
          console.error(err.error.status.message);
          this.stopSpinner = true;
        });
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
    this.message = 'clickOnsubmit';
  }
  async getShifts() {
    this.httpGetService.getMasterList('shifts/active').subscribe(
      (res: any) => {
        if (res.response.length > 0) {
          res.response.unshift({
            shiftCode: 'ALL',
          })
        }
        res.response.sort((a, b) => {
          return a.shiftId - b.shiftId
        });
        this.shifts = res.response;
      },
      err => {
        Swal.fire({
          title: 'Error!',
          text: err.error.status.message,
          icon: 'error',
          timer: 3000,
        });
      }
    );
  }
  submit(): void {
    this.spinner.show();
    this.config.currentPage = 1;
    this.reportObj.from =
      this.selectedDateRange.startDate.format('YYYY-MM-DD');
    this.reportObj.to = this.selectedDateRange.endDate.format('YYYY-MM-DD');
    this.httpGetService.getMasterList('reports/present?from=' + this.reportObj.from +
      '&to=' +
      this.reportObj.to +
      '&deptCode=' + this.reportObj.department +
      '&empCode=' +
      this.reportObj.employeeCode +
      '&shiftCode=' +
      this.reportObj.shiftCode).subscribe(
        (res: any) => {
          this.spinner.hide();
          this.message = 'modified';
          this.dateFormat = this.global.dateFormat;
          const timesheetRes = res.response.map(element => {
            element.dayName = this.utilServ.dayNames[new Date(element.dateCode).getDay()];
            element.totalHours = this.convertDecimalToHours(element.totalHours);
            element.effectiveHours = this.convertDecimalToHours(element.effectiveHours)
            element.lateBy = this.convertDecimalToHours(element.lateBy)
            element.leftEarlyBy = this.convertDecimalToHours(element.leftEarlyBy)
            element.otHrs = this.convertDecimalToHours(element.otHrs)

            // const resultInMinutes = element.totalHours * 60;
            // const h = Math.floor(resultInMinutes / 60);
            // const hours = h < 10 ? '0' + h : h
            // const m = Math.floor(resultInMinutes % 60);
            // const minutes = m < 10 ? '0' + m : m
            // element.totalHours = hours + ':' + minutes

            // const lb = element.lateBy * 60;
            // const lbh = Math.floor(lb / 60);
            // const lbhours = lbh < 10 ? '0' + lbh : lbh
            // const lbm = Math.floor(lb % 60);
            // const lbminutes = lbm < 10 ? '0' + lbm : lbm
            // element.lateBy = lbhours + ':' + lbminutes

            // const leb = element.leftEarlyBy * 60;
            // const lebh = Math.floor(leb / 60);
            // const lebhours = lebh < 10 ? '0' + lebh : lebh
            // const lebm = Math.floor(leb % 60);
            // const lebminutes = lebm < 10 ? '0' + lebm : lebm
            // element.leftEarlyBy = lebhours + ':' + lebminutes

            // const ot = element.otHrs * 60;
            // const oth = Math.floor(ot / 60);
            // const otHrs = oth < 10 ? '0' + oth : oth
            // const otm = Math.floor(ot % 60);
            // const otMins = otm < 10 ? '0' + otm : otm
            // element.otHrs = otHrs + ':' + otMins;
            return element
          });
          if (res.response.length == 0) {
            Swal.fire({
              icon: 'info',
              title: 'NO RECORD FOUND!',
              // text: 'ON SELECTED DATA',
            });
          }
          const records = this.manageRecords(timesheetRes);
          records.forEach((r) => {
            if (r.BreakShift) {
              const totalEffectiveHrs1 = moment.duration(r.effectiveHours).add(moment.duration(r.SecondEffectiveHours)).asMinutes();
              const h2 = Math.floor(totalEffectiveHrs1 / 60);
              const hours2 = h2 < 10 ? '0' + h2 : h2;
              const m2 = Math.floor(totalEffectiveHrs1 % 60);
              const minutes2 = m2 < 10 ? '0' + m2 : m2;
              r.effectiveHrs1 = hours2 + ':' + minutes2;

              const formattedInTime = r.inTime ? moment(r.inTime, 'HH:mm:ss').format('HH:mm') : '-';
              const formattedSecondInTime = r.SecondInTime ? moment(r.SecondInTime, 'HH:mm:ss').format('HH:mm') : '-';
              r.mixedInTime = `${formattedInTime} <br> ${formattedSecondInTime}`;

              const formattedoutTime = r.outTime ? moment(r.outTime, 'HH:mm:ss').format('HH:mm') : '-';
              const formattedSecondoutTime = r.SecondOutTime ? moment(r.SecondOutTime, 'HH:mm:ss').format('HH:mm') : '-';
              r.mixedOutTime = `${formattedoutTime} <br> ${formattedSecondoutTime}`;

              r.mixedLateBy = `${r.lateBy} <br> ${r.SecondLateBy}`;
              r.mixedLeftEarlyBy = `${r.leftEarlyBy} <br> ${r.SecondLeftEarlyBy}`;


              const totalTotalHours1 = moment.duration(r.totalHours).add(moment.duration(r.SecondTotalHours)).asMinutes();
              const h3 = Math.floor(totalTotalHours1 / 60);
              const hours3 = h3 < 10 ? '0' + h3 : h3;
              const m3 = Math.floor(totalTotalHours1 % 60);
              const minutes3 = m3 < 10 ? '0' + m3 : m3;
              r.totalHours1 = hours3 + ':' + minutes3;
            } else {
              r.effectiveHrs1 = r.effectiveHours;
              r.totalHours1 = r.totalHours;
              r.mixedInTime = r.inTime ? `${moment(r.inTime, 'HH:mm:ss').format('HH:mm')}` : '-';
              r.mixedOutTime = r.outTime ? `${moment(r.outTime, 'HH:mm:ss').format('HH:mm')}` : '-';
            }

          });

          this.rows = records;
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
  convertDecimalToHours(decimalHours) {
    const resultInMinutes = decimalHours * 60;
    const h = Math.floor(resultInMinutes / 60);
    const hours = h < 10 ? '0' + h : h;
    const m = Math.floor(resultInMinutes % 60);
    const minutes = m < 10 ? '0' + m : m;
    return `${hours}:${minutes}`;
  }


  manageRecords(records) {
    const groupedRecords = records.reduce((acc, record) => {
      const key = `${record.employeeCode}-${record.dateCode}`;
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


  saveExcel() {
    this.spinner.show();
    const obj = {
      employee_id: this.reportObj.employeeCode,
      shiftcode: this.reportObj.shiftCode,
      start_date: this.reportObj.from,
      end_date: this.reportObj.to,
      deptCode: this.reportObj.department
    };
    this.httpGetService
      .getExcel(
        'reports/presentXls?empCode=' +
        obj.employee_id +
        '&deptCode=' +
        obj.deptCode +
        '&from=' +
        obj.start_date +
        '&shiftCode=' +
        obj.shiftcode +
        '&to=' +
        obj.end_date
      )
      .subscribe((res: any) => {
        this.spinner.hide();
        const data: Blob = new Blob([res], { type: EXCEL_TYPE });
        FileSaver.saveAs(
          data,
          'Present_Report' + new Date().getTime() + EXCEL_EXTENSION
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
    this.httpGetService.getPdf('reports/present/pdf?empCode=' + this.reportObj.employeeCode + '&from=' + this.reportObj.from + '&to=' + this.reportObj.to
      + '&shiftCode=' + this.reportObj.shiftCode + '&deptCode=' + this.reportObj.department
    ).subscribe((res: any) => {
      this.spinner.hide();
      const file = new Blob([res], { type: 'application/pdf' });
      FileSaver.saveAs(file, 'Present-report' + new Date().getTime() + '.pdf');
      // const fileURL = URL.createObjectURL(file);
      // window.open(fileURL);
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
  back() {
    this.router.navigateByUrl('/rpt');
  }


}

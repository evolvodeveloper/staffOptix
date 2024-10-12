import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
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
  selector: 'app-monthly-att-report',
  templateUrl: './monthly-att-report.component.html',
  styleUrls: ['./monthly-att-report.component.scss']
})
export class MonthlyAttReportComponent implements OnInit {
  reportObj = {
    projectCode: 'ALL',
    deptCode: 'ALL',
    empCode: 'ALL',
    fulldate: '',
    year: '',
    date: '',
    month: '',
    maxDt: ''
  };
  dateFormat: string;
  stopSpinner = true;
  config: any;
  rows = [];
  employee = [];
  temp = [];
  message = 'clickOnsubmit';
  setData: any;
  departments = [];
  projects = [];
  constructor(
    private httpPostService: HttpPostService,
    private spinner: NgxSpinnerService,
    public activeModal: NgbActiveModal,
    private global: GlobalvariablesService,
    private utilServ: UtilService,
    private httpGetService: HttpGetService,
    private router: Router
  ) {
    this.config = {
      itemsPerPage: 25,
      currentPage: 1,
      totalItems: this.rows.length,
    };
  }
  ngOnInit(): void {
    this.getProjects();
    this.getDepartments();
    this.reportObj.maxDt = moment().format('YYYY-MM');
    this.employeesByDepartmentAndProject();
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
        this.employee = val;
        this.stopSpinner = true;
      },
        err => {
          this.stopSpinner = true;
          console.error(err.error.status.message);
        });
  }
  showEmpRecord(row) {
    const groupedRecords = row.presentReport.reduce((acc, record) => {
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
          return new Date(`${a.dateCode}T${a.inTime}`).getTime() - new Date(`${b.dateCode}T${b.inTime}`).getTime();
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
    row.presentRpt = result;

    row.presentRpt.forEach((r) => {
      if (r.BreakShift) {
        r.totalHours = this.convertDecimalToHours(r.totalHours)
        r.SecondTotalHours = this.convertDecimalToHours(r.SecondTotalHours);
        r.lateBy = this.convertDecimalToHours(r.lateBy);
        r.SecondLateBy = this.convertDecimalToHours(r.SecondLateBy);
        r.SecondLeftEarlyBy = this.convertDecimalToHours(r.SecondLeftEarlyBy);
        r.leftEarlyBy = this.convertDecimalToHours(r.leftEarlyBy);

        r.regularHours = this.convertDecimalToHours(r.regularHours)
        r.SecondRegularHours = this.convertDecimalToHours(r.SecondRegularHours)

        r.effectiveHours = this.convertDecimalToHours(r.effectiveHours)
        r.SecondEffectiveHours = this.convertDecimalToHours(r.SecondEffectiveHours)
        if (r.remarks !== null && r.SecondRemarks !== null) {
          r.mixedRemark = r.remarks.concat('/').concat(r.SecondRemarks)
        } else {
          r.mixedRemark = r.remarks || r.SecondRemarks
        }
        if (r.attStatus == 'P' && r.SecondAttStatus == 'P') {
          r.mixedAttStatus = 'P'
        } else if ((r.attStatus == 'P' && r.SecondAttStatus == 'P*') || (r.attStatus == 'P*' && r.SecondAttStatus == 'P')) {
          r.mixedAttStatus = 'P*'
        } else {
          r.mixedAttStatus = r.attStatus.concat('/').concat(r.SecondAttStatus)
        }

        const totalEffectiveHrs1 = moment.duration(r.effectiveHours).add(moment.duration(r.SecondEffectiveHours)).asMinutes();
        const h2 = Math.floor(totalEffectiveHrs1 / 60);
        const hours2 = h2 < 10 ? '0' + h2 : h2;
        const m2 = Math.floor(totalEffectiveHrs1 % 60);
        const minutes2 = m2 < 10 ? '0' + m2 : m2;
        r.effectiveHrs1 = hours2 + ':' + minutes2;

        const formattedInTime = r.inTime ? moment(r.inTime, 'HH:mm:ss').format('HH:mm') : '--:--';
        const formattedSecondInTime = r.SecondInTime ? moment(r.SecondInTime, 'HH:mm:ss').format('HH:mm') : '--:--';
        r.mixedInTime = `${formattedInTime} <br> ${formattedSecondInTime}`;

        const formattedoutTime = r.outTime ? moment(r.outTime, 'HH:mm:ss').format('HH:mm') : '--:--';
        const formattedSecondoutTime = r.SecondOutTime ? moment(r.SecondOutTime, 'HH:mm:ss').format('HH:mm') : '--:--';
        r.mixedOutTime = `${formattedoutTime} <br> ${formattedSecondoutTime}`;

        r.mixedLateBy = `${(r.lateBy !== '00:00') ? r.lateBy : '--:--'} <br> ${(r.SecondLateBy !== '00:00') ? r.SecondLateBy : '--:--'}`;
        r.mixedLeftEarlyBy = `${(r.leftEarlyBy !== '00:00') ? r.leftEarlyBy : '--:--'} <br> ${(r.SecondLeftEarlyBy !== '00:00') ? r.SecondLeftEarlyBy : '--:--'}`;


        const totalReguHrs = moment.duration(r.regularHours).add(moment.duration(r.SecondRegularHours)).asMinutes();
        const totalTotalHours1 = moment.duration(r.totalHours).add(moment.duration(r.SecondTotalHours)).asMinutes();

        const h3 = Math.floor(totalTotalHours1 / 60);
        const hours3 = h3 < 10 ? '0' + h3 : h3;
        const m3 = Math.floor(totalTotalHours1 % 60);
        const minutes3 = m3 < 10 ? '0' + m3 : m3;
        r.totalHours1 = hours3 + ':' + minutes3;
      } else {
        r.mixedRemark = r.remark;
        r.mixedAttStatus = r.attStatus;
        r.lateBy = this.convertDecimalToHours(r.lateBy);
        r.leftEarlyBy = this.convertDecimalToHours(r.leftEarlyBy);
        r.effectiveHrs1 = this.convertDecimalToHours(r.effectiveHours)
        r.totalHours1 = this.convertDecimalToHours(r.totalHours)
        r.mixedInTime = r.inTime ? `${moment(r.inTime, 'HH:mm:ss').format('HH:mm')}` : '--:--';
        r.mixedOutTime = r.outTime ? `${moment(r.outTime, 'HH:mm:ss').format('HH:mm')}` : '--:--';
      }
    });
    this.setData = row;
    // row.presentReport.forEach((element: { leftEarlyBy1: string; leftEarlyBy: any; lateBy1: string; lateBy: any; totalHours1: string; totalHours: any; otHrs1: string; otHrs: any; regularHours1: string; regularHours: any; }) => {
    //   element.leftEarlyBy1 = this.modifyTime(element.leftEarlyBy);
    //   element.lateBy1 = this.modifyTime(element.lateBy);
    //   element.totalHours1 = this.modifyTime(element.totalHours);
    //   element.otHrs1 = this.modifyTime(element.otHrs);
    //   element.regularHours1 = this.modifyTime(element.regularHours);
    // });
    // this.setData = row;
    // return result;
  }
  convertDecimalToHours(decimalHours) {
    const resultInMinutes = decimalHours * 60;
    const h = Math.floor(resultInMinutes / 60);
    const hours = h < 10 ? '0' + h : h;
    const m = Math.floor(resultInMinutes % 60);
    const minutes = m < 10 ? '0' + m : m;
    return `${hours}:${minutes}`;
  }

  modifyTime(time) {
    const resultInEXHMinutes = time ? time * 60 : 0;
    const exh = Math.floor(resultInEXHMinutes / 60);
    const exhours = exh < 10 ? '0' + exh : exh
    const exm = Math.floor(resultInEXHMinutes % 60);
    const exminutes = exm < 10 ? '0' + exm : exm
    return exhours + ':' + exminutes
  }
  getDepartments() {
    this.httpGetService.getMasterList('depts/active').subscribe((res: any) => {
      if (res.response.length > 0) {
        res.response.unshift({
          deptCode: 'ALL',
          deptName: 'ALL'
        })
      }
      this.departments = res.response
    }, (err) => {
      console.error(err.error.status.message);
    })
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
      },
      (err) => {
        console.error(err.error.status.message);
      }
    );
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
  submit() {
    if (this.reportObj.fulldate) {
      const dateSplit = this.reportObj.fulldate.split('-');
      if (dateSplit.length > 2) {
        this.reportObj.date = dateSplit[2];
        this.reportObj.month = dateSplit[1];
        this.reportObj.year = dateSplit[0];
      } else {
        this.reportObj.date = '01';
        this.reportObj.month = dateSplit[1];
        this.reportObj.year = dateSplit[0];
      }
      this.spinner.show();
      this.config.currentPage = 1;
      this.httpGetService.getMasterList('reports/attSummaryForMonth?empCode=' + this.reportObj.empCode + '&year=' + this.reportObj.year + '&month=' + this.reportObj.month +
        '&date=' + this.reportObj.date + '&deptCode=' + this.reportObj.deptCode
      ).subscribe((res: any) => {
        this.spinner.hide();
        this.message = 'modified';
        // const records = this.manageRecords(res.response);

        this.rows = res.response;
        this.temp = res.response
        this.dateFormat = this.global.dateFormat;
      },
        err => {
          this.spinner.hide();
          this.message = 'error';
          Swal.fire({
            title: 'Error!',
            text: err.error.status.message,
            icon: 'error',
          });
        })
    } else {
      Swal.fire({
        title: 'Info!',
        text: 'Please, Select the Date field',
        icon: 'info',
      });
    }
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


  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    if (val == '') {
      this.rows = [...this.temp];
    } else {
      const temp = this.temp.filter(function (d) {
        return d.empName.toLowerCase().indexOf(val) !== -1 || d.empCode.toLowerCase().indexOf(val) !== -1 || !val;
      });
      this.rows = temp;
    }
    this.config.totalItems = this.rows.length;
    this.config.currentPage = 1;
  }
  closeModel(dismiss) {
    this.activeModal.dismiss(dismiss);
  }
  saveExcel() {
    const dateSplit = this.reportObj.fulldate.split('-');
    if (dateSplit.length > 2) {
      this.reportObj.date = dateSplit[2];
      this.reportObj.month = dateSplit[1];
      this.reportObj.year = dateSplit[0];
    } else {
      this.reportObj.date = '01';
      this.reportObj.month = dateSplit[1];
      this.reportObj.year = dateSplit[0];
    }
    if (window.location.pathname === '/rpt/montlyAttByEmpReport') {
      this.spinner.show();
      this.httpGetService.getExcel('reports/attSummaryForMonthByEmp/xls?empCode=' + this.reportObj.empCode + '&year=' + this.reportObj.year + '&month=' + this.reportObj.month +
        '&date=' + this.reportObj.date + '&deptCode=' + this.reportObj.deptCode
      ).subscribe((res: any) => {
        this.spinner.hide();
        const data: Blob = new Blob([res], { type: EXCEL_TYPE });
        FileSaver.saveAs(
          data,
          'Monthly_attendance_report-' + this.reportObj.month + '-' + new Date().getTime() + EXCEL_EXTENSION
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
    } else {
      this.spinner.show();
      this.httpGetService.getExcel('reports/attSummaryForMonth/xls?empCode=' + this.reportObj.empCode + '&year=' + this.reportObj.year + '&month=' + this.reportObj.month +
        '&date=' + this.reportObj.date + '&deptCode=' + this.reportObj.deptCode
      ).subscribe((res: any) => {
        this.spinner.hide();
        const data: Blob = new Blob([res], { type: EXCEL_TYPE });
        FileSaver.saveAs(
          data,
          'Monthly_attendance_report' + this.reportObj.month + '-' + new Date().getTime() + EXCEL_EXTENSION
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
  }
}

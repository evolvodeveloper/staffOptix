import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as FileSaver from 'file-saver';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';
import Swal from 'sweetalert2';
const EXCEL_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
@Component({
  selector: 'app-attendance-summary-report',
  templateUrl: './attendance-summary-report.component.html',
  styleUrls: ['./attendance-summary-report.component.scss']
})
export class AttendanceSummaryReportComponent implements OnInit, AfterViewInit {
  reportObj = {
    // branch: '',
    project: 'ALL',
    department: 'ALL',
    empCode: 'ALL',
    from: '',
    to: '',
  };

  departments = [];
  projects = [];
  message: string;
  stopSpinner = true;
  config: any;
  rows = [];
  temp = [];
  dateFormat: string;
  employee = [];
  selectedDateRange = {
    startDate: moment().startOf('week'),
    endDate: moment().endOf('week'),
  };
  constructor(
    private httpGet: HttpGetService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private global: GlobalvariablesService,
  ) {
    this.config = {
      itemsPerPage: 25,
      currentPage: 1,
      totalItems: this.rows.length,
    };
  }
  ngOnInit(): void {
    this.getDepartments();
    this.getProjects();
    this.employeesByDepartmentAndProject();
  }

  getDepartments() {
    this.spinner.show();
    this.httpGet.getMasterList('depts/active').subscribe((res: any) => {
      if (res.response.length > 0) {
        res.response.unshift({
          deptCode: 'ALL',
          deptName: 'ALL'
        })
      }
      this.spinner.hide();
      this.departments = res.response
    },
      err => {
        this.spinner.hide();
        console.error(err);

      })
  }
  getProjects() {
    this.httpGet.getMasterList('empcategorys').subscribe(
      (res: any) => {
        if (res.response.length > 0) {
          res.response.unshift({
            categoryCode: 'ALL',
          })
        }
        this.projects = res.response;
      },
      err => {
        console.error(err);

      }
    );
  }
  ngAfterViewInit() {
    const rightCalendar = document.getElementsByClassName('calendar right');
    if (rightCalendar.item(0)) {
      rightCalendar.item(0).remove();
    }
  }
  employeesByDepartmentAndProject() {
    this.stopSpinner = false;
    this.httpGet
      .getMasterList('employeesByCatAndDept?department=' + this.reportObj.department + '&category=' + this.reportObj.project)
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

        this.temp = [...res.response];
      },
        err => {
          this.stopSpinner = false;
          Swal.fire({
            title: 'Error!',
            text: err.error.status.message,
            icon: 'error',
            timer: 3000,
          });
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
    this.message = 'clickOnsubmit'
  }
  submit() {
    this.spinner.show();
    this.config.currentPage = 1;
    this.reportObj.from =
      this.selectedDateRange.startDate.format('YYYY-MM-DD');
    this.reportObj.to = this.selectedDateRange.endDate.format('YYYY-MM-DD');
    // https://localhost:555/api/reports/lateComeLeftEarlySmry?empCode=slx-010&from=2024-01-25&to=2024-01-30&deptCode=IT-BE
    this.httpGet.getMasterList('reports/lateComeLeftEarlySmry?empCode=' + this.reportObj.empCode + '&from=' + this.reportObj.from + '&to=' + this.reportObj.to +
      '&deptCode=' + this.reportObj.department
    ).subscribe((res: any) => {
      this.spinner.hide();
      this.message = 'modified';
      this.rows = res.response;
      this.temp = res.response;
      this.dateFormat = this.global.dateFormat;
    },
      err => {
        this.spinner.hide();
        this.message = 'error';
        Swal.fire({
          title: 'Error!',
          text: err.error.status.message,
          icon: 'error',
          timer: 3000,
        });
      })
  }
  savePDF() {
    this.spinner.show();
    this.httpGet.getPdf('reports/lateComeLeftEarlySmry/pdf?empCode=' + this.reportObj.empCode + '&from=' + this.reportObj.from + '&to=' + this.reportObj.to +
      '&deptCode=' + this.reportObj.department
    ).subscribe((res: any) => {
      this.spinner.hide();
      const file = new Blob([res], { type: 'application/pdf' });
      FileSaver.saveAs(file, 'Attendance-summary-report' + new Date().getTime() + '.pdf');
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
  saveExcel() {
    this.spinner.show();
    this.reportObj.from =
      this.selectedDateRange.startDate.format('YYYY-MM-DD');
    this.reportObj.to = this.selectedDateRange.endDate.format('YYYY-MM-DD');
    this.httpGet.getExcel('reports/lateComeLeftEarlySmry/xls?empCode=' + this.reportObj.empCode + '&from=' + this.reportObj.from + '&to=' + this.reportObj.to +
      '&deptCode=' + this.reportObj.department
    ).subscribe((res: any) => {
      this.spinner.hide();
      const data: Blob = new Blob([res], { type: EXCEL_TYPE });
      FileSaver.saveAs(
        data,
        'Attendance-summary-report' + new Date().getTime() + EXCEL_EXTENSION
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


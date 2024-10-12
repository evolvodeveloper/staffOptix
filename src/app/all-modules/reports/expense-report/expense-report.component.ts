import { Component, OnInit } from '@angular/core';
import * as FileSaver from 'file-saver';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { UtilService } from 'src/app/services/util.service';
import Swal from 'sweetalert2';
import { HttpGetService } from '../../../services/http-get.service';
const EXCEL_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
const PDF_EXTENSION = '.pdf';

@Component({
  selector: 'app-expense-report',
  templateUrl: './expense-report.component.html',
  styleUrls: ['./expense-report.component.scss']
})
export class ExpenseReportComponent implements OnInit {
  stopSpinner = true;
  message = 'clickOnsubmit';

  reportObj = {
    department: 'ALL',
    projectCode: 'ALL',
    empCode: 'ALL',
    status: 'ALL',
    year: '',
    month: '',
    fulldate: '',
    maxDt: ''
  };
  departments = [];
  projects = [];
  temp = [];
  employee = [];
  rows = [];
  config: any;


  constructor(
    private httpGet: HttpGetService,
    private spinner: NgxSpinnerService,
    private utilServ: UtilService,
    public global: GlobalvariablesService
  ) {
    this.config = {
      itemsPerPage: 25,
      currentPage: 1,
      totalItems: this.rows.length,
    };
  }

  ngOnInit() {
    this.getDepartments();
    this.getProjects();
    this.employeesByDepartmentAndProject();
    this.reportObj.maxDt = moment().format('YYYY-MM');
    this.reportObj.fulldate = moment().subtract(1, 'months').format('YYYY-MM');
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
      (err) => {
        console.error(err.error.status.message);
      }
    );
  }
  getDepartments() {
    this.httpGet.getMasterList('depts/active').subscribe((res: any) => {
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
  employeesByDepartmentAndProject() {
    this.stopSpinner = false;
    this.httpGet
      .getMasterList('employeesByCatAndDept?department=' + this.reportObj.department + '&category=' + this.reportObj.projectCode)
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
  modified() {
    this.rows = [];
    this.message = 'clickOnsubmit';
  }
  pageChanged(event) {
    this.config.currentPage = event;
  }
  resultsPerPage(event) {
    this.config.itemsPerPage =
      event.target.value == 'all' ? this.temp.length : event.target.value;
    this.config.currentPage = 1;
  }

  submit() {
    this.spinner.show();
    const dateSplit = this.reportObj.fulldate.split('-');
    this.reportObj.month = dateSplit[1];
    this.reportObj.year = dateSplit[0];
    this.httpGet.getMasterList('reports/expenses?month=' + this.reportObj.month + '&year=' + this.reportObj.year + '&empCode=' + this.reportObj.empCode + '&status=' + this.reportObj.status)
      .subscribe((res: any) => {
        this.spinner.hide();
        const rows = res.response.map(element => ({
          ...element,
          dayName: this.utilServ.dayNames[new Date(element.billDate).getDay()],
        }))
        this.rows = rows;
        this.temp = rows;
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
  }

  savePDF(): void {
    this.spinner.show();
    this.httpGet.getPdf('reports/expenses/pdf?month=' + this.reportObj.month + '&year='
      + this.reportObj.year + '&empCode=' + this.reportObj.empCode + '&status=' + this.reportObj.status
    ).subscribe((res: any) => {
      this.spinner.hide();
      const file = new Blob([res], { type: 'application/pdf' });
      // const fileURL = URL.createObjectURL(file);
      // window.open(fileURL);
      FileSaver.saveAs(file, 'Expense-report' + new Date().getTime() + PDF_EXTENSION);
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
  saveExcel() {
    this.spinner.show();
    this.httpGet.getExcel('reports/expense/xls?month=' + this.reportObj.month + '&year=' + this.reportObj.year + '&empCode=' +
      this.reportObj.empCode + '&status=' + this.reportObj.status
    ).subscribe((res: any) => {
      this.spinner.hide();
      const data: Blob = new Blob([res], { type: EXCEL_TYPE });
      FileSaver.saveAs(
        data,
        'Expense-report' + new Date().getTime() + EXCEL_EXTENSION
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

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as FileSaver from 'file-saver';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';
import { UtilService } from 'src/app/services/util.service';
import Swal from 'sweetalert2';


const EXCEL_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Component({
  selector: 'app-emp-bankinfo',
  templateUrl: './emp-bankinfo.component.html',
  styleUrls: ['./emp-bankinfo.component.scss']
})
export class EmpBankinfoComponent implements OnInit{
  reportObj = {
    deptCode: 'ALL',
    empCode: 'ALL',
    category: 'ALL',
    fulldate: '',
    year: '',
    date: '',
    month: '',
    maxDt: '',
    payrollCode: ''
  };
  stopSpinner = true
  rows = [];
  employee = [];
  temp = [];
  message = 'clickOnsubmit';
  setData: any;
  departments = [];
  dateFormat: string;
  projects = [];
  config: any;
  payrollCodesList = [];
  reportsList = [];
  salaryFrequency: string;
  date;
  month;
  year;

  constructor(
    private httpGet: HttpGetService,
    private utilServ: UtilService,
    private spinner: NgxSpinnerService,
    private router: Router,
    private global: GlobalvariablesService
  ) {
    this.config = {
      itemsPerPage: 25,
      currentPage: 1,
      totalItems: this.rows.length,
    };
   }


  ngOnInit(): void {
    this.getDepartments();
    this.getPayrollCodes();
    this.reportObj.maxDt = moment().format('YYYY-MM');
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

  getPayrollCodes() {
    this.spinner.show();
    this.httpGet.getMasterList('payrollsetups').subscribe((res: any) => {
      const isDefaultRow = res.response.find(x => x.isDefault == true);
      this.payrollCodesList = res.response;     
      if (isDefaultRow) {
        this.reportObj.payrollCode = isDefaultRow.payrollCode;
        this.onPayrollChange();
        this.getEmpByCategoryndPayroll();
      }
      this.spinner.hide();
    },
      err => {
        console.error(err);
        this.spinner.hide();
      })
  }

  onPayrollChange() {
    const foundRecord = this.payrollCodesList.find(x => x.payrollCode == this.reportObj.payrollCode)
    this.salaryFrequency = foundRecord.salaryFrequency;
    if (foundRecord.salaryFrequency === 'Month') {
      this.reportObj.fulldate = moment().format('YYYY-MM');
      this.reportObj.maxDt = moment().format('YYYY-MM');
    } else {
      this.reportObj.fulldate = moment().format('YYYY-MM-DD');
      this.reportObj.maxDt = moment().format('YYYY-MM-DD');
    }
  }

  getEmpByCategoryndPayroll() {
    this.stopSpinner = false;
    this.rows = [];
    this.reportsList = [];
    this.httpGet.getMasterList('employeesByCatAndDept?category=' + this.reportObj.category + '&department=' + this.reportObj.deptCode +
      '&payrollCode=' + this.reportObj.payrollCode).subscribe(
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
          this.employee = val;
        this.stopSpinner = true;
        }, err => {
          console.error(err);
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
    this.reportsList = [];
    this.message = 'clickOnsubmit'
  }
  back() {
    this.router.navigateByUrl('/rpt');
  }
  submit(): void {
    this.spinner.show();
    const dateSplit = this.reportObj.fulldate.split('-');
    if (dateSplit.length > 2) {
      this.date = dateSplit[2];
      this.month = dateSplit[1];
      this.year = dateSplit[0];
    } else {
      this.date = '01';
      this.month = dateSplit[1];
      this.year = dateSplit[0];
    }
    this.config.currentPage = 1;
    this.httpGet.
      getMasterList('reports/payrollBankInfo?payrollCode=' +
        this.reportObj.payrollCode +
        '&empCode=' +
        this.reportObj.empCode +
        '&deptCode=' +
        this.reportObj.deptCode +
        '&year=' +
        this.year +
        '&date=' +
        this.date + '&month=' +
        this.month)
      .subscribe(
        (res: any) => {
          this.reportsList = res.response;
          this.spinner.hide();
          this.message = 'modified'
          if (this.reportsList.length == 0) {
            Swal.fire({
              icon: 'info',
              title: 'NO RECORD FOUND!',
              // text: 'ON SELECTED DATA',
            });
          }
          this.rows = this.reportsList;
          this.temp = [...this.rows];
        },
        (err) => {
          this.message = 'error'

          this.spinner.hide();
          Swal.fire({
            title: 'Error!',
            text: err.error.status.message,
            icon: 'error',
            timer: 3000,
          });
        }
      );
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
  saveExcel() {
    const dateSplit = this.reportObj.fulldate.split('-');
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
    this.httpGet
      .getExcel(
        'reports/payrollBankInfo/xls?payrollCode=' +
        this.reportObj.payrollCode +
        '&empCode=' +
        this.reportObj.empCode +
        '&deptCode=' +
        this.reportObj.deptCode +
        '&year=' +
        this.year +
        '&date=' +
        this.date + '&month=' +
        this.month
      )
      .subscribe((res: any) => {
        this.spinner.hide();
        const data: Blob = new Blob([res], { type: EXCEL_TYPE });
        FileSaver.saveAs(
          data,
          'Employee_Bank_Details' + new Date().getTime() + EXCEL_EXTENSION
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
    const dateSplit = this.reportObj.fulldate.split('-');
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
    this.httpGet.getPdf('reports/payrollBankInfo/pdf?payrollCode=' +
    this.reportObj.payrollCode +
    '&empCode=' +
    this.reportObj.empCode +
    '&deptCode=' +
    this.reportObj.deptCode +
    '&year=' +
    this.year +
    '&date=' +
    this.date + '&month=' +
    this.month
    ).subscribe((res: any) => {
      this.spinner.hide();
      const file = new Blob([res], { type: 'application/pdf' });
      FileSaver.saveAs(file, 'Employee_Bank_Details' + new Date().getTime() + '.pdf');
      // const fileURL = URL.createObjectURL(file);
      this.global.showSuccessPopUp('Pdf', 'success');
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

}

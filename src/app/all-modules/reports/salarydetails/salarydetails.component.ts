import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as FileSaver from 'file-saver';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';
import { HttpPostService } from 'src/app/services/http-post.service';
import Swal from 'sweetalert2';

const EXCEL_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Component({
  selector: 'app-salarydetails',
  templateUrl: './salarydetails.component.html',
  styleUrls: ['./salarydetails.component.scss'],
})
export class SalarydetailsComponent implements OnInit, AfterViewInit {
  reportObj = {
    category: 'ALL',
    department: 'ALL',
    payrollCode: '',
    employeeCode: 'ALL',
    fulldate: '',
    maxDt: '',
  };
  date;
  month;
  year;
  salaryFrequency: string;

  searchedFor: string;
  stopSpinner = true;
  message = 'clickOnsubmit';
  empCat: any = [];
  payrollCodesList = [];
  employee = [];
  reportsList = [];
  totalQty = 0;

  config: any;
  TotalQty: string;
  rows = [];
  temp = [];
  selectedDateRange = {
    startDate: moment().startOf('month'),
    endDate: moment().endOf('month'),
  };
  departments = [];
  constructor(
    private httpPostService: HttpPostService,
    private spinner: NgxSpinnerService,
    private global: GlobalvariablesService,
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
    this.getProjectList();
    this.getDepartments();
    this.getPayrollCodes();
    // this.getBranchList();
    // this.getEmployeesList();
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
    })
  }
  getPayrollCodes() {
    this.spinner.show();
    this.httpGetService.getMasterList('payrollsetups').subscribe((res: any) => {
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
  getProjectList() {
    this.httpGetService.getMasterList('empcategorys').subscribe(
      (res: any) => {
        res.response.unshift({ categoryCode: 'ALL' })
        this.empCat = res.response;
      }
    );
  }
  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    if (val == '') {
      this.rows = [...this.temp];
    } else {
      const temp = this.temp.filter(function (d) {
        return d.employeeName.toLowerCase().indexOf(val) !== -1 || d.employeeCode.toLowerCase().indexOf(val) !== -1 || !val;
      });
      this.rows = temp;
    }
    this.config.totalItems = this.rows.length;
    this.config.currentPage = 1;
  }
  getEmpByCategoryndPayroll() {
    this.stopSpinner = false;
    this.rows = [];
    this.reportsList = [];
    this.httpGetService.getMasterList('employeesByCatAndDept?category=' + this.reportObj.category + '&department=' + this.reportObj.department +
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
    // https://localhost:555/api/reports/salcomponents?empCode=ALL&deptCode=ALL&payrollCode=OFFICE_WAGES&runId=64&year=2024&date=01&month=03
    this.httpGetService.
      getMasterList('reports/salcomponents?payrollCode=' +
        this.reportObj.payrollCode +
        '&empCode=' +
        this.reportObj.employeeCode +
        '&deptCode=' +
        this.reportObj.department +
        '&year=' +
        this.year +
        '&date=' +
        this.date + '&month=' +
        this.month)
      .subscribe(
        (res: any) => {
          this.reportsList = res.response;
          const newData = res.response.map(item => {
            const newArray = item.componentWithAmount.map(component => ({
              componentCode: component.componentCode,
              amount: component.amount
            }));
            return { ...item, newArray };
          });
          this.spinner.hide();
          this.message = 'modified'
          if (this.reportsList.length == 0) {
            Swal.fire({
              icon: 'info',
              title: 'NO RECORD FOUND!',
              // text: 'ON SELECTED DATA',
            });
          }
          this.rows = newData;
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
    const obj = {
      category_code: this.reportObj.category,
      branch_code: JSON.parse(localStorage.getItem('user-data')).branch,
      payrollCode: this.reportObj.payrollCode,
      year: this.year,
      month: this.month,
      date: this.date,
    };
    this.httpGetService
      .getExcel(
        'reports/salcomponents/xls?empCode=' +
        this.reportObj.employeeCode +
        '&deptCode=' +
        this.reportObj.department +
        '&payrollCode=' +
        obj.payrollCode +
        '&year=' +
        obj.year +
        '&month=' +
        obj.month +
        '&date=' +
        obj.date
      )
      .subscribe((res: any) => {
        this.spinner.hide();
        const data: Blob = new Blob([res], { type: EXCEL_TYPE });
        FileSaver.saveAs(
          data,
          'salary_Details' + new Date().getTime() + EXCEL_EXTENSION
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
    this.httpGetService
      .getPdf('reports/salcomponents/pdf?empCode=' + this.reportObj.employeeCode + '&payrollCode=' + this.reportObj.payrollCode + '&deptCode=' + this.reportObj.department +
        '&year=' + this.year + '&date=' + this.date + '&month=' + this.month
      )
      .subscribe((res: any) => {
        this.spinner.hide();
        const file = new Blob([res], { type: 'application/pdf' });
        FileSaver.saveAs(file, 'Salary-Components-report' + new Date().getTime() + '.pdf');
        this.global.showSuccessPopUp('Pdf', 'success');
        // const fileURL = URL.createObjectURL(file);
        // window.open(fileURL);
      });
  }
  expandRow(row: any): void {
    row.expand = true;
    row.highlight = true;
  }
  collapseRow(row: any): void {
    row.expand = false;
    row.highlight = false;
  }

  back() {
    this.router.navigateByUrl('/rpt');
  }
}

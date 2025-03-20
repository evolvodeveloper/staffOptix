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
  selector: 'app-salary-master-report',
  templateUrl: './salary-master-report.component.html',
  styleUrls: ['./salary-master-report.component.scss']
})
export class SalaryMasterReportComponent implements OnInit, AfterViewInit {
  reportObj = {
    department: 'ALL',
    payrollCode: '',
    employeeCode: 'ALL'
  };
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
    public globalServ: GlobalvariablesService,
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
    this.globalServ.getMyCompLabels('salaryMaster');
    this.globalServ.getMyCompPlaceHolders('salaryMaster');
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
      if (isDefaultRow) {
        this.reportObj.payrollCode = isDefaultRow.payrollCode;
        this.getEmpByCategoryndPayroll();
      }
      this.payrollCodesList = res.response;
      this.spinner.hide();
    },
      err => {
        console.error(err);
        this.spinner.hide();
      })
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
    this.httpGetService.getMasterList('employeesByCatAndDept?category=All&department=' + this.reportObj.department +
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
    this.config.currentPage = 1;
    this.httpGetService.getMasterList('reports/salCompMaster?payrollCode=' +
        this.reportObj.payrollCode +
        '&empCode=' +
        this.reportObj.employeeCode +
        '&deptCode=' +
        this.reportObj.department)
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
    this.spinner.show();
    this.httpGetService
      .getExcel(
        'reports/salCompMaster/xls?empCode=' +
        this.reportObj.employeeCode +
        '&deptCode=' +
        this.reportObj.department +
        '&payrollCode=' +
        this.reportObj.payrollCode
      )
      .subscribe((res: any) => {
        this.spinner.hide();
        const data: Blob = new Blob([res], { type: EXCEL_TYPE });
        const fileName = 'salary_Master_' + new Date().toTimeString().split(' ')[0].replace(/:/g, '_');
        FileSaver.saveAs(
          data,
          fileName + EXCEL_EXTENSION
        );
        this.globalServ.showSuccessPopUp('Excel', 'success', fileName);
      },
        err => {
          this.spinner.hide();
          const error = err.error.status ? err.error.status.message : 'UNKNOWN ERROR OCCURRED'
          Swal.fire({
            title: 'Error!',
            text: error,
            icon: 'error',
          })
        });
  }

  savePDF() {
    this.spinner.show();
    this.httpGetService
      .getPdf('reports/salCompMaster/pdf?empCode=' + this.reportObj.employeeCode + '&payrollCode=' + this.reportObj.payrollCode + '&deptCode=' + this.reportObj.department)
      .subscribe((res: any) => {
        this.spinner.hide();
        const file = new Blob([res], { type: 'application/pdf' });
        const fileName = 'salary_Master_' + new Date().toTimeString().split(' ')[0].replace(/:/g, '_');
        FileSaver.saveAs(file, fileName + '.pdf');
        this.globalServ.showSuccessPopUp('Pdf', 'success', fileName);
        // const fileURL = URL.createObjectURL(file);
        // window.open(fileURL);
      },
        err => {
          this.spinner.hide();
          const error = err.error.status ? err.error.status.message : 'UNKNOWN ERROR OCCURRED'
          Swal.fire({
            title: 'Error!',
            text: error,
            icon: 'error',
          })
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
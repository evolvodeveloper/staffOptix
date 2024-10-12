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
  selector: 'app-dailyoutput',
  templateUrl: './dailyoutput.component.html',
  styleUrls: ['./dailyoutput.component.scss'],
})
export class DailyoutputComponent implements OnInit, AfterViewInit {
  reportObj = {
    branch: '',
    category: 'ALL',
    payrollType: 'ALL',
    empCode: 'ALL',
    from: '',
    to: '',
  };
  message: string;
  stopSpinner = true;
  reportsList = [];
  showMessage = false;
  totalQty = 0;
  TotalQty: any;
  config: any;
  temp = [];
  dateFormat: string;

  pytypes = [
    { code: 'ALL', name: 'ALL' },
    { code: 'Salaried', name: 'Salary' },
    { code: 'PieceWork', name: 'PieceWork' },
  ];
  categorys = [];
  rows = [];
  employee = [];
  categoryListDropdownConfig = {
    displayKey: 'categoryCode',
    search: true,
    height: '300px',
    placeholder: 'Select',
    moreText: 'more',
    noResultsFound: 'No results found!',
    searchPlaceholder: 'Search',
    searchOnKey: 'categoryCode',
  };
  empListDropdownConfig = {
    displayKey: 'employeeName',
    search: true,
    height: '300px',
    placeholder: 'Select',
    moreText: 'more',
    noResultsFound: 'No results found!',
    searchPlaceholder: 'Search',
    searchOnKey: 'employeeName',
  };
  branchListDropdownConfig = {
    displayKey: 'branchCode',
    search: true,
    height: '300px',
    placeholder: 'Select',
    moreText: 'more',
    noResultsFound: 'No results found!',
    searchPlaceholder: 'Search',
    searchOnKey: 'branchCode',
  };
  selectedDateRange = {
    startDate: moment().startOf('day'),
    endDate: moment().endOf('day'),
  };
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
    this.getPayrollList();
  }
  ngAfterViewInit() {
    const rightCalendar = document.getElementsByClassName('calendar right');
    if (rightCalendar.item(0)) {
      rightCalendar.item(0).remove();
    }
  }
  getPayrollList() {
    this.httpGetService.getMasterList('empcategorys').subscribe(
      (res: any) => {
        res.response.unshift({ categoryCode: 'ALL' })
        this.categorys = res.response;
        this.getEmpByCategory(this.reportObj.category)
      }
    );
  }
  getEmpByCategory(value) {
    this.stopSpinner = false;
    this.rows = [];
    this.reportsList = [];
    this.httpGetService.getMasterList('payrolls?category=' + value).subscribe(
      (res: any) => {
        if (res.response.length > 0) {
          res.response.unshift({
            employeeCode: 'ALL',
            employeeName: 'ALL'
          })
        }
        this.employee = res.response;
        this.stopSpinner = true;
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
  saveExcel() {
    this.spinner.show();
    const obj = {
      branch_code: JSON.parse(localStorage.getItem('user-data')).branch,
      payroll_type: this.reportObj.payrollType,
      category_code: this.reportObj.category,
      empCode: this.reportObj.empCode,
      start_date: this.reportObj.from,
      end_date: this.reportObj.to,
    };
    this.httpGetService
      .getExcel(
        'reports/dailyOutputxls?branch=' +
          obj.branch_code +
          '&payrollType=' +
          obj.payroll_type +
          '&category=' +
          obj.category_code +
        '&empCode=' +
        obj.empCode +
          '&from=' +
          obj.start_date +
          '&to=' +
          obj.end_date
      )
      .subscribe((res: any) => {
        this.spinner.hide();
        const data: Blob = new Blob([res], { type: EXCEL_TYPE });
        FileSaver.saveAs(
          data,
          'Daily-Output' + new Date().getTime() + EXCEL_EXTENSION
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
  modified() {
    this.rows = [];
    this.reportsList = [];
    this.message = 'clickOnsubmit'
  }
  submit(): void {
    this.config.currentPage = 1;
    (this.rows = []),
      (this.reportsList = []),
      (this.TotalQty = 0),
      (this.totalQty = 0);
      this.spinner.show();
      this.reportObj.from =
        this.selectedDateRange.startDate.format('YYYY-MM-DD');
      this.reportObj.to = this.selectedDateRange.endDate.format('YYYY-MM-DD');
    this.httpGetService.getMasterList('reports/outputdtls?category=' +
      this.reportObj.category +
      '&payrollType=' +
      this.reportObj.payrollType +
      '&empCode=' +
      this.reportObj.empCode +
      '&from=' +
      this.reportObj.from +
      '&to=' +
      this.reportObj.to).subscribe(
        (res: any) => {
          this.reportsList = res.response;
          if (this.reportsList.length == 0) {
            this.spinner.hide();
            this.message = 'modified'
            Swal.fire({
              icon: 'info',
              title: 'NO RECORD FOUND!',
            });
          }
          this.totalQty = 0;
          this.TotalQty = 0;
          this.reportsList.forEach((r) => {
            this.totalQty += r.quantity;
            this.TotalQty = this.totalQty.toLocaleString('en-IN');
          });
          if (this.reportsList.length > 0) {
            const obj = {
              branchCode: '',
              companyCode: '',
              employeeName: '',
              divison: '',
              payrollType: '',
              itemCode: 'Total',
              quantity: this.totalQty,
              // totalAmount: this.totalAmount
            };
            this.reportsList.push(obj);
            this.rows = this.reportsList;
            this.dateFormat = this.global.dateFormat;
            this.temp = [...this.rows];
            this.config.totalItems = this.rows.length;
            // this.getTotal()
          }
          this.spinner.hide();
        },
        (err) => {
          this.message = 'error'
          this.showMessage = true;
          this.spinner.hide();
          Swal.fire({
            title: 'Error!',
            text: err.error.status.message,
            icon: 'error',
          });
        }
      );
  }

  savePDF() {
    Swal.fire({
      title: 'Error!',
      text: 'Not Implemented',
      icon: 'error',
    });
  }
  back() {
    this.router.navigateByUrl('/rpt');
  }
}

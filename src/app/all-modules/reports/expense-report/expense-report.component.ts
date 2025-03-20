import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
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
  currentTable = 'expRpt'
  activeColumns = [];
  colKeys = [];

  constructor(
    private httpGet: HttpGetService,
    private spinner: NgxSpinnerService,
    private utilServ: UtilService,
    public globalServ: GlobalvariablesService
  ) {
    this.config = {
      itemsPerPage: 25,
      currentPage: 1,
      totalItems: this.rows.length,
    };
  }
  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.activeColumns, event.previousIndex, event.currentIndex);
    this.activeColumns.forEach((x, i) => x.SortId = i + 1);
    this.updateColumnOrder();
    this.apply();
  }
  apply() {
    this.colKeys.forEach(x => {
      if (x.view == true) {
        x.checked = true
      } else {
        x.checked = false
      }
    })

    const savedConfig = localStorage.getItem('tableConfigs');
    const configs = savedConfig ? JSON.parse(savedConfig) : {};
    if (!configs[this.currentTable]) {
      configs[this.currentTable] = this.colKeys;
    } else {
      configs[this.currentTable] = this.colKeys;
    }
    this.activeColumns = this.colKeys.filter(x => x.checked == true)
    this.activeColumns.sort((a, b) => a.SortId - b.SortId);
    localStorage.setItem('tableConfigs', JSON.stringify(configs));
  }
  updateColumnOrder() {
    const orderedKeys = this.activeColumns.map(col => col.key);
    this.colKeys.forEach(col => {
      const index = orderedKeys.indexOf(col.key);
      if (index !== -1) {
        col.SortId = index + 1;
      }
    });
  }
  toggleColumnVisibility(colKey: string, event: Event) {
    const checkbox = (event.target as HTMLInputElement);
    const column = this.colKeys.find(col => col.key === colKey);
    if (column) {
      column.view = checkbox.checked;
    }
  }
  close() {
    this.colKeys.forEach(x => {
      if (x.checked == true) {
        x.view = true
      } else {
        x.view = false
      }
    })
  }


  loadColumnsConfig() {
    const savedConfig = localStorage.getItem('tableConfigs');
    const keysToRemove = ['tenantCode', 'buCode', 'divisionCode', 'billDate', 'costCenterCode', 'totalQty', 'subcategoryCode', 'paidAmt', 'paymentStatus',
      'notes', 'approved', 'createdby', 'createddate', 'lastmodifiedby', 'lastmodifieddate', 'approvedby', "approveddate", "modifiedStatus",
      "employeeExpenseLines", "empExpenseDocuments"];
    if (savedConfig) {
      const configs = JSON.parse(savedConfig);
      this.colKeys = configs[this.currentTable] || [];
      // const keys = Object.keys(this.rows[0] || {});
      // console.warn(keys);
      // const filteredList = keys.filter((item: any) => !keysToRemove.includes(item));
      // this.colKeys = filteredList.map(key => ({ key, view: true, checked: true }));
      // this.activeColumns = this.colKeys.filter(x => x.view == true)
      // this.activeColumns.sort((a, b) => a.SortId - b.SortId);
      // this.saveColumnsConfig();
      if (!configs[this.currentTable]) {
        const keys = Object.keys(this.rows[0] || {});
        const filteredList = keys.filter((item: any) => !keysToRemove.includes(item));
        this.colKeys = filteredList.map(key => ({ key, view: true, checked: true }));
        this.activeColumns = this.colKeys.filter(x => x.view == true)
        this.activeColumns.sort((a, b) => a.SortId - b.SortId);
        this.saveColumnsConfig();
      } else {
        this.activeColumns = this.colKeys.filter(x => x.view == true)
        this.activeColumns.sort((a, b) => a.SortId - b.SortId);
      }

    } else {
      const keys = Object.keys(this.rows[0] || {});
      const filteredList = keys.filter((item: any) => !keysToRemove.includes(item));
      this.colKeys = filteredList.map(key => ({ key, view: true, checked: true }));
      this.activeColumns = this.colKeys.filter(x => x.view == true)
      this.activeColumns.sort((a, b) => a.SortId - b.SortId);
      this.saveColumnsConfig();
    }
  }
  isNumber(value: any): boolean {
    return !isNaN(value) && typeof value === 'number';
  }
  saveColumnsConfig() {
    const savedConfig = localStorage.getItem('tableConfigs');
    const configs = savedConfig ? JSON.parse(savedConfig) : {};
    configs[this.currentTable] = this.colKeys;
    localStorage.setItem('tableConfigs', JSON.stringify(configs));
  }

  ngOnInit() {
    this.globalServ.getMyCompLabels('expensesComp');
    this.globalServ.getMyCompPlaceHolders('expensesComp');
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
          billDt: moment(element.billDate).format('YYYY-MM-DD'),
          dayName: this.utilServ.dayNames[new Date(element.billDate).getDay()],
        }))
        this.rows = rows;
        if (this.rows.length > 0) {
          this.loadColumnsConfig();
        }
        this.temp = rows;
        this.message = 'modified';
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
    const keys = this.activeColumns.map(item => item.key).join(',');
    this.spinner.show();
    this.httpGet.getPdf('reports/expenses/pdf?month=' + this.reportObj.month + '&year='
      + this.reportObj.year + '&empCode=' + this.reportObj.empCode + '&status=' + this.reportObj.status + '&reqColumns=' + keys
    ).subscribe((res: any) => {
      this.spinner.hide();
      const file = new Blob([res], { type: 'application/pdf' });
      // const fileURL = URL.createObjectURL(file);
      // window.open(fileURL);
      const fileName = 'Expense_report_' + new Date().toTimeString().split(' ')[0].replace(/:/g, '_')
      FileSaver.saveAs(file, fileName + PDF_EXTENSION);
      this.globalServ.showSuccessPopUp('Pdf', 'success', fileName);
    },
      err => {
        this.spinner.hide();
        const error = err.error.status ? err.error.status.message : 'UNKNOWN ERROR OCCURRED'
        Swal.fire({
          title: 'Error!',
            text: error,
            icon: 'error',
          })
      })
  }
  saveExcel() {
    const keys = this.activeColumns.map(item => item.key).join(',');
    this.spinner.show();
    this.httpGet.getExcel('reports/expense/xls?month=' + this.reportObj.month + '&year=' + this.reportObj.year + '&empCode=' +
      this.reportObj.empCode + '&status=' + this.reportObj.status + '&reqColumns=' + keys
    ).subscribe((res: any) => {
      this.spinner.hide();
      const data: Blob = new Blob([res], { type: EXCEL_TYPE });
      const fileName = 'Expense_report_' + new Date().toTimeString().split(' ')[0].replace(/:/g, '_')
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
}

import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
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
const PDF_EXTENSION = '.pdf';

@Component({
  selector: 'app-absent-report',
  templateUrl: './absent-report.component.html',
  styleUrls: ['./absent-report.component.scss']
})
export class AbsentReportComponent implements OnInit, AfterViewInit {
  @ViewChild('todoList1') todoList1: any;
  reportObj = {
    // branch: '',
    projectCode: 'ALL',
    department: 'ALL',
    empCode: 'ALL',
    from: '',
    to: '',
  };
  message: string;
  stopSpinner = true;
  config: any;
  temp = [];
  dateFormat: string;
  employee = [];
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
  selectedDateRange = {
    startDate: moment().startOf('week'),
    endDate: moment().endOf('week'),
  };
  rows = [];
  departments = [];
  projects = [];
  constructor(
    private httpPostService: HttpPostService,
    private spinner: NgxSpinnerService,
    private utilServ: UtilService,
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
  currentTable = 'absentRpt'
  activeColumns = [];
  colKeys = [];
  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.activeColumns, event.previousIndex, event.currentIndex);
    this.activeColumns.forEach((x, i) => x.SortId = i + 1);
    this.updateColumnOrder();
    this.apply();
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
  ngOnInit(): void {
    this.globalServ.getMyCompLabels('absentReport');
    this.globalServ.getMyCompPlaceHolders('absentReport');
    this.getProjects();
    this.getDepartments();
    this.employeesByDepartmentAndProject();
  }
  toggleColumnVisibility(colKey: string, event: Event) {
    const checkbox = (event.target as HTMLInputElement);
    const column = this.colKeys.find(col => col.key === colKey);
    if (column) {
      column.view = checkbox.checked;
    }
    // this.apply();
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

  loadColumnsConfig() {
    const savedConfig = localStorage.getItem('tableConfigs');
    const keysToRemove = ["fromDate", "toDate"]
    if (savedConfig) {
      const configs = JSON.parse(savedConfig);

      this.colKeys = configs[this.currentTable] || [];
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
  saveColumnsConfig() {
    const savedConfig = localStorage.getItem('tableConfigs');
    const configs = savedConfig ? JSON.parse(savedConfig) : {};
    configs[this.currentTable] = this.colKeys;
    localStorage.setItem('tableConfigs', JSON.stringify(configs));
  }
  ngAfterViewInit() {
    const rightCalendar = document.getElementsByClassName('calendar right');
    if (rightCalendar.item(0)) {
      rightCalendar.item(0).remove();
    }
  }
  employeesByDepartmentAndProject() {
    this.stopSpinner = false;
    this.httpGetService
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
  getEmpByProjects(project) {
    this.stopSpinner = false;
    this.rows = [];
    this.httpGetService.getMasterList('payrolls?category=' + project).subscribe(
      (res: any) => {
        this.employee = res.response;
        this.stopSpinner = true;
      },
      (err) => {
        this.stopSpinner = true;
        console.error(err.error.status.message);
      }
    );
  }
  isNumber(value: any): boolean {
    return !isNaN(value) && typeof value === 'number';
  }
  submit() {
    this.spinner.show();
    this.config.currentPage = 1;
    this.reportObj.from =
      this.selectedDateRange.startDate.format('YYYY-MM-DD');
    this.reportObj.to = this.selectedDateRange.endDate.format('YYYY-MM-DD');
    this.httpGetService.getMasterList('reports/AbsentReport?employeeCode=' + this.reportObj.empCode + '&from=' + this.reportObj.from + '&to=' + this.reportObj.to +
      '&projectCode=' + this.reportObj.projectCode + '&departmentCode=' + this.reportObj.department
    ).subscribe((res: any) => {
      this.spinner.hide();
      this.message = 'modified';
      const rows = res.response.map(element => ({
        dayName: this.utilServ.dayNames[new Date(element.dateCode).getDay()],
        ...element,
      }))
      this.rows = rows;
      this.temp = rows;
      if (this.rows.length > 0) {
        this.loadColumnsConfig();
      }

      // localStorage.setItem('tableConfigs', JSON.stringify(this.colKeys));
      // this.activeColumns = this.colKeys.filter(x => x.view == true)
      this.dateFormat = this.globalServ.dateFormat;
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
    this.httpGetService.getPdf('reports/absent/pdf?employeeCode=' + this.reportObj.empCode + '&from=' + this.reportObj.from + '&to=' + this.reportObj.to +
      '&projectCode=' + this.reportObj.projectCode + '&deptCode=' + this.reportObj.department + '&reqColumns=' + keys 
    ).subscribe((res: any) => {
      this.spinner.hide();
      const file = new Blob([res], { type: 'application/pdf' });
      // const fileURL = URL.createObjectURL(file);
      // window.open(fileURL);
      FileSaver.saveAs(file, 'Absent-report' + new Date().getTime() + PDF_EXTENSION);
      this.globalServ.showSuccessPopUp('Pdf', 'success');
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
    const keys = this.activeColumns.map(item => item.key).join(',');
    this.spinner.show();
    this.reportObj.from =
      this.selectedDateRange.startDate.format('YYYY-MM-DD');
    this.reportObj.to = this.selectedDateRange.endDate.format('YYYY-MM-DD');
    this.httpGetService.getExcel('reports/AbsentReportxls?employeeCode=' + this.reportObj.empCode + '&from=' + this.reportObj.from + '&to=' + this.reportObj.to +
      '&projectCode=' + this.reportObj.projectCode + '&departmentCode=' + this.reportObj.department + '&reqColumns=' + keys
    ).subscribe((res: any) => {
      this.spinner.hide();
      const data: Blob = new Blob([res], { type: EXCEL_TYPE });
      FileSaver.saveAs(
        data,
        'Absent-report' + new Date().getTime() + EXCEL_EXTENSION
      );
      this.globalServ.showSuccessPopUp('Excel', 'success');
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

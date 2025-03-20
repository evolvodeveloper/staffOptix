import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
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
    public globalServ: GlobalvariablesService,
  ) {
    this.config = {
      itemsPerPage: 25,
      currentPage: 1,
      totalItems: this.rows.length,
    };
  }
  currentTable = 'AttenSumRpt';
  activeColumns = [];
  colKeys = [];
  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.activeColumns, event.previousIndex, event.currentIndex);
    this.activeColumns.forEach((x, i) => x.SortId = i + 1);
    this.updateColumnOrder();
    this.apply();
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
    this.globalServ.getMyCompLabels('attendanceSummaryReport');
    this.globalServ.getMyCompPlaceHolders('attendanceSummaryReport');
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
  toggleColumnVisibility(colKey: string, event: Event) {
    const checkbox = (event.target as HTMLInputElement);
    const column = this.colKeys.find(col => col.key === colKey);
    if (column) {
      column.view = checkbox.checked;
    }
  }

  loadColumnsConfig() {
    const savedConfig = localStorage.getItem('tableConfigs');
    if (savedConfig) {
      const configs = JSON.parse(savedConfig);
      this.colKeys = configs[this.currentTable] || [];
      if (!configs[this.currentTable]) {
        const keys = Object.keys(this.rows[0] || {});
        const keysToRemove = ['holidaydates', 'weekenddates', 'presentReport', 'joinDate'];
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
      const keysToRemove = ['holidaydates', 'weekenddates', 'presentReport', 'joinDate'];
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
    this.httpGet.getMasterList('reports/lateComeLeftEarlySmry?empCode=' + this.reportObj.empCode + '&from=' + this.reportObj.from + '&to=' + this.reportObj.to +
      '&deptCode=' + this.reportObj.department
    ).subscribe((res: any) => {
      this.spinner.hide();
      this.message = 'modified';
      this.rows = res.response;
      this.temp = res.response;

      if (this.rows.length > 0) {
        this.loadColumnsConfig();
      }
      this.dateFormat = this.globalServ.dateFormat;
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
    const keys = this.activeColumns.map(item => item.key).join(',');
    this.spinner.show();
    this.httpGet.getPdf('reports/lateComeLeftEarlySmry/pdf?empCode=' + this.reportObj.empCode + '&from=' + this.reportObj.from + '&to=' + this.reportObj.to +
      '&deptCode=' + this.reportObj.department + '&reqColumns=' + keys
    ).subscribe((res: any) => {
      this.spinner.hide();
      const file = new Blob([res], { type: 'application/pdf' });
      const fileName = 'Attendance_summary_report_' + new Date().toTimeString().split(' ')[0].replace(/:/g, '_')
      FileSaver.saveAs(file, fileName + '.pdf');
      this.globalServ.showSuccessPopUp('Pdf', 'success', fileName);
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
    const keys = this.activeColumns.map(item => item.key).join(',');
    this.spinner.show();
    this.reportObj.from =
      this.selectedDateRange.startDate.format('YYYY-MM-DD');
    this.reportObj.to = this.selectedDateRange.endDate.format('YYYY-MM-DD');
    this.httpGet.getExcel('reports/lateComeLeftEarlySmry/xls?empCode=' + this.reportObj.empCode + '&from=' + this.reportObj.from + '&to=' + this.reportObj.to +
      '&deptCode=' + this.reportObj.department + '&reqColumns=' + keys
    ).subscribe((res: any) => {
      this.spinner.hide();
      const data: Blob = new Blob([res], { type: EXCEL_TYPE });
      const fileName = 'Attendance_summary_report_' + new Date().toTimeString().split(' ')[0].replace(/:/g, '_')
      FileSaver.saveAs(
        data,
        fileName + EXCEL_EXTENSION
      );
      this.globalServ.showSuccessPopUp('Excel', 'success', fileName);
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


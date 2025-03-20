import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as FileSaver from 'file-saver';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';
import { HttpPostService } from 'src/app/services/http-post.service';
import Swal from 'sweetalert2';
import { UtilService } from '../../../services/util.service';

const EXCEL_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Component({
  selector: 'app-shifts-report',
  templateUrl: './present-report.component.html',
  styleUrls: ['./present-report.component.scss']
})
export class PresentReportComponent implements OnInit, AfterViewInit {

  config: any;
  TotalQty: string;
  rows = [];
  temp = [];
  dateFormat: string;
  selectedDateRange = {
    startDate: moment().startOf('month'),
    endDate: moment().endOf('month'),
  };
  stopSpinner = true

  employees_list = [];
  message: string;
  reportObj = {
    employeeCode: 'ALL',
    shiftCode: 'ALL',
    from: '',
    to: '',
    department: 'ALL',
  };

  shifts = [];
  departments = [];
  currentTable = 'presentRpt'
  activeColumns = [];
  colKeys = [];
  constructor(
    private httpPostService: HttpPostService,
    private spinner: NgxSpinnerService,
    public globalServ: GlobalvariablesService,
    private utilServ: UtilService,
    private httpGetService: HttpGetService,
    private router: Router,
    private httpGet: HttpGetService,

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
  toggleColumnVisibility(colKey: string, event: Event) {
    const checkbox = (event.target as HTMLInputElement);
    const column = this.colKeys.find(col => col.key === colKey);
    if (column) {
      column.view = checkbox.checked;
    }
  }

  loadColumnsConfig() {
    const savedConfig = localStorage.getItem('tableConfigs');
    const keysToRemove = ['regularHours', 'lastName', 'BreakShift', 'totalHours', ''];
    if (savedConfig) {
      const configs = JSON.parse(savedConfig);
      this.colKeys = configs[this.currentTable] || [];
      if (!configs[this.currentTable]) {
        const keys = Object.keys(this.rows[0] || {});
        const filteredList = keys.filter((item: any) => !keysToRemove.includes(item));
        this.colKeys = filteredList.map(key => ({ key, view: true, checked: true }));
        // this.colKeys = keys.map(key => ({ key, view: true, checked: true }));
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



  ngOnInit(): void {
    this.globalServ.getMyCompLabels('presentReport');
    this.globalServ.getMyCompPlaceHolders('presentReport');
    this.getShifts();
    this.getDepartments();
  }
  ngAfterViewInit() {
    const rightCalendar = document.getElementsByClassName('calendar right');
    if (rightCalendar.item(0)) {
      rightCalendar.item(0).remove();
    }
  }
  getDepartments() {
    this.httpGetService.getMasterList('depts/active').subscribe((res: any) => {
      res.response.unshift({
        deptCode: 'ALL',
        deptName: 'ALL'
      })
      this.reportObj.department = 'ALL';
      this.departments = res.response;
      this.employeesByDepartmentAndProject();
    })
  }

  employeesByDepartmentAndProject() {
    this.stopSpinner = false;
    this.httpGetService
      .getMasterList('employeesByCatAndDept?department=' + this.reportObj.department + '&category=ALL')
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
        this.employees_list = val;
        this.stopSpinner = true;
      },
        err => {
          console.error(err.error.status.message);
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
    this.message = 'clickOnsubmit';
  }
  async getShifts() {
    this.httpGetService.getMasterList('shifts/active').subscribe(
      (res: any) => {
        if (res.response.length > 0) {
          res.response.unshift({
            shiftCode: 'ALL',
          })
        }
        res.response.sort((a, b) => {
          return a.shiftId - b.shiftId
        });
        this.shifts = res.response;
      },
      err => {
        Swal.fire({
          title: 'Error!',
          text: err.error.status.message,
          icon: 'error',
          timer: 3000,
        });
      }
    );
  }
  submit(): void {
    this.spinner.show();
    this.config.currentPage = 1;
    this.reportObj.from =
      this.selectedDateRange.startDate.format('YYYY-MM-DD');
    this.reportObj.to = this.selectedDateRange.endDate.format('YYYY-MM-DD');
    this.httpGetService.getMasterList('reports/present?from=' + this.reportObj.from +
      '&to=' +
      this.reportObj.to +
      '&deptCode=' + this.reportObj.department +
      '&empCode=' +
      this.reportObj.employeeCode +
      '&shiftCode=' +
      this.reportObj.shiftCode).subscribe(
        (res: any) => {
          this.spinner.hide();
          this.message = 'modified';
          this.dateFormat = this.globalServ.dateFormat;
          const timesheetRes = res.response.map(element => {
            element.dayName = this.utilServ.dayNames[new Date(element.dateCode).getDay()];
            element.totalHours = this.convertDecimalToHours(element.totalHours);
            element.effectiveHours = this.convertDecimalToHours(element.effectiveHours)
            element.lateBy = this.convertDecimalToHours(element.lateBy)
            element.leftEarlyBy = this.convertDecimalToHours(element.leftEarlyBy)
            element.otHrs = this.convertDecimalToHours(element.otHrs)        
            return element
          });
          if (res.response.length == 0) {
            Swal.fire({
              icon: 'info',
              title: 'NO RECORD FOUND!',
              // text: 'ON SELECTED DATA',
            });
          }
          const records = this.manageRecords(timesheetRes);
          records.forEach((r) => {
            if (r.BreakShift) {
              const totalEffectiveHrs1 = moment.duration(r.effectiveHours).add(moment.duration(r.SecondEffectiveHours)).asMinutes();
              const h2 = Math.floor(totalEffectiveHrs1 / 60);
              const hours2 = h2 < 10 ? '0' + h2 : h2;
              const m2 = Math.floor(totalEffectiveHrs1 % 60);
              const minutes2 = m2 < 10 ? '0' + m2 : m2;
              r.effectiveHrs1 = hours2 + ':' + minutes2;

              const formattedInTime = r.inTime ? moment(r.inTime, 'HH:mm:ss').format('HH:mm') : '-';
              const formattedSecondInTime = r.SecondInTime ? moment(r.SecondInTime, 'HH:mm:ss').format('HH:mm') : '-';
              r.mixedInTime = `${formattedInTime} <br> ${formattedSecondInTime}`;

              const formattedoutTime = r.outTime ? moment(r.outTime, 'HH:mm:ss').format('HH:mm') : '-';
              const formattedSecondoutTime = r.SecondOutTime ? moment(r.SecondOutTime, 'HH:mm:ss').format('HH:mm') : '-';
              r.mixedOutTime = `${formattedoutTime} <br> ${formattedSecondoutTime}`;

              r.mixedLateBy = `${r.lateBy} <br> ${r.SecondLateBy}`;
              r.mixedLeftEarlyBy = `${r.leftEarlyBy} <br> ${r.SecondLeftEarlyBy}`;


              const totalTotalHours1 = moment.duration(r.totalHours).add(moment.duration(r.SecondTotalHours)).asMinutes();
              const h3 = Math.floor(totalTotalHours1 / 60);
              const hours3 = h3 < 10 ? '0' + h3 : h3;
              const m3 = Math.floor(totalTotalHours1 % 60);
              const minutes3 = m3 < 10 ? '0' + m3 : m3;
              r.totalHours1 = hours3 + ':' + minutes3;
            } else {
              r.effectiveHrs1 = r.effectiveHours;
              r.totalHours1 = r.totalHours;
              r.mixedInTime = r.inTime ? `${moment(r.inTime, 'HH:mm:ss').format('HH:mm')}` : '-';
              r.mixedOutTime = r.outTime ? `${moment(r.outTime, 'HH:mm:ss').format('HH:mm')}` : '-';
              r.mixedLateBy = r.lateBy !== '00:00' ? r.lateBy : '--:--';
              r.mixedLeftEarlyBy = r.leftEarlyBy !== '00:00' ? r.leftEarlyBy : '--:--';
            }
          });

          this.rows = records;
          this.temp = [...this.rows];
          this.config.totalItems = this.rows.length;

          // this.getTotal()
          if (this.rows.length > 0) {
            this.loadColumnsConfig();
          }
        },
        (err) => {
          this.spinner.hide();
          this.message = 'error';
          Swal.fire({
            title: 'Error!',
            text: err.error.status.message,
            icon: 'error',
            timer: 3000,
          });
        }
      );
  }
  convertDecimalToHours(decimalHours) {
    const resultInMinutes = decimalHours * 60;
    const h = Math.floor(resultInMinutes / 60);
    const hours = h < 10 ? '0' + h : h;
    const m = Math.floor(resultInMinutes % 60);
    const minutes = m < 10 ? '0' + m : m;
    return `${hours}:${minutes}`;
  }


  manageRecords(records) {
    const groupedRecords = records.reduce((acc, record) => {
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

  saveExcel() {
    const keys = this.activeColumns.map(item => item.key).join(',');
    this.spinner.show();
    const obj = {
      employee_id: this.reportObj.employeeCode,
      shiftcode: this.reportObj.shiftCode,
      start_date: this.reportObj.from,
      end_date: this.reportObj.to,
      deptCode: this.reportObj.department
    };
    this.httpGetService
      .getExcel(
        'reports/presentXls?empCode=' +
        obj.employee_id +
        '&deptCode=' +
        obj.deptCode +
        '&from=' +
        obj.start_date +
        '&shiftCode=' +
        obj.shiftcode +
        '&to=' +
        obj.end_date
      )
      .subscribe((res: any) => {
        this.spinner.hide();
        const data: Blob = new Blob([res], { type: EXCEL_TYPE });
        const fileName = 'Present_Report_' + new Date().toTimeString().split(' ')[0].replace(/:/g, '_');
        FileSaver.saveAs(data, fileName + EXCEL_EXTENSION);
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

  savePDF(): void {
    const keys = this.activeColumns.map(item => item.key).join(',');
    this.spinner.show();
    this.httpGetService.getPdf('reports/present/pdf?empCode=' + this.reportObj.employeeCode + '&from=' + this.reportObj.from + '&to=' + this.reportObj.to
      + '&shiftCode=' + this.reportObj.shiftCode + '&deptCode=' + this.reportObj.department
    ).subscribe((res: any) => {
      this.spinner.hide();
      const file = new Blob([res], { type: 'application/pdf' });
      const fileName = 'Present_Report_' + new Date().toTimeString().split(' ')[0].replace(/:/g, '_');
      FileSaver.saveAs(file, fileName + '.pdf');
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
  back() {
    this.router.navigateByUrl('/rpt');
  }


}

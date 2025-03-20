import { Component } from '@angular/core';
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
@Component({
  selector: 'app-missing-swipes',
  templateUrl: './missing-swipes.component.html',
  styleUrl: './missing-swipes.component.scss'
})
export class MissingSwipesComponent {
  reportObj = {
    // branch: '',
    project: 'ALL',
    department: 'ALL',
    empCode: 'ALL',
    shiftCode: 'ALL',
    from: '',
    to: '',
  };
  hasBreakShift = false;
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
    startDate: moment().startOf('day'),
    endDate: moment().endOf('day'),
  };
  rows = [];
  departments = [];
  projects = [];
  shifts = [];
  constructor(
    private httpPostService: HttpPostService,
    private spinner: NgxSpinnerService,
    public globalServ: GlobalvariablesService,
    private httpGetService: HttpGetService,
    private utilServ: UtilService,
    private router: Router,
  ) {
    this.config = {
      itemsPerPage: 25,
      currentPage: 1,
      totalItems: this.rows.length,
    };
  }
  ngOnInit(): void {
    this.globalServ.getMyCompLabels('missingPunch');
    this.getProjects();
    this.getDepartments();
    this.getShifts();
    this.employeesByDepartmentAndProject();
  }
  ngAfterViewInit() {
    const rightCalendar = document.getElementsByClassName('calendar right');
    if (rightCalendar.item(0)) {
      rightCalendar.item(0).remove();
    }
  }
  getShifts() {
    this.httpGetService.getMasterList('shifts/active').subscribe(
      (res: any) => {
        const shiftRes = res.response;
        if (shiftRes.length > 0) {
          shiftRes.unshift({
            shiftId: '1',
            shiftCode: 'ALL',
          })
          this.reportObj.shiftCode = 'ALL';
        }
        shiftRes.sort((a, b) => {
          return a.shiftId - b.shiftId
        });
        this.shifts = shiftRes;
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
  employeesByDepartmentAndProject() {
    this.stopSpinner = false;
    this.httpGetService
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
  getDepartments() {
    this.httpGetService.getMasterList('depts/active').subscribe((res: any) => {
      res.response.unshift({
        deptCode: 'ALL',
        deptName: 'ALL'
      })
      this.departments = res.response
    })
  }
  getProjects() {
    this.httpGetService.getMasterList('empcategorys').subscribe(
      (res: any) => {
        res.response.unshift({
          categoryCode: 'ALL',
        })
        this.projects = res.response;
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

  formatTime(timeString: string | null | undefined): string {
    // Check if the input is null or undefined
    if (!timeString) {
      console.log('Input time string cannot be null or undefined');
    }
    const parts = timeString.split(':');
    if (parts.length === 3) {
      return `${parts[0]}:${parts[1]}`;
    } else {
      console.log('Invalid time format. Expected format is hh:mm:ss');
    }
  }
  submit() {
    this.hasBreakShift = false;
    this.spinner.show();
    this.config.currentPage = 1;
    this.reportObj.from =
      this.selectedDateRange.startDate.format('YYYY-MM-DD');
    this.reportObj.to = this.selectedDateRange.endDate.format('YYYY-MM-DD');
    this.httpGetService.getMasterList('reports/missingPunch?empCode=' + this.reportObj.empCode + '&from=' + this.reportObj.from + '&to=' + this.reportObj.to +
      '&deptCode=' + this.reportObj.department + '&shiftCode=' + this.reportObj.shiftCode
    ).subscribe((res: any) => {
      this.spinner.hide();
      this.message = 'modified';

      const rows = res.response.map(element => ({
        ...element,
        fromDay: this.utilServ.dayNames[new Date(element.fromDt).getDay()],
        toDay: this.utilServ.dayNames[new Date(element.toDt).getDay()]
      }))
      rows.forEach(element => {
        const inTime = element.inTime !== null && element.inTime !== '' ? element.inTime : '';
        const secondInTime = element.secondInTime !== null && element.secondInTime !== '' ? element.secondInTime : '';
        const outTime = element.outTime !== null && element.outTime !== '' ? element.outTime : '';
        const secondOutTime = element.secondOutTime !== null && element.secondOutTime !== '' ? element.secondOutTime : '';
        element.inTime = this.formatTime(inTime);
        element.outTime = this.formatTime(outTime);
        element.secondInTime = this.formatTime(secondInTime);
        element.secondOutTime = this.formatTime(secondOutTime);
      });
      this.hasBreakShift = rows.some(x => x.hasBreakShift === true)
      this.rows = rows;
      this.dateFormat = this.globalServ.dateFormat;
      if (this.rows.length == 0) {
        Swal.fire({
          icon: 'info',
          title: 'NO RECORD FOUND!',
          // text: 'ON SELECTED DATA',
        });
      }
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

  savePDF(): void {
    this.spinner.show();
    this.httpGetService.getPdf('reports/MissingPunch/pdf?empCode=' + this.reportObj.empCode + '&from=' + this.reportObj.from + '&to=' + this.reportObj.to +
      '&deptCode=' + this.reportObj.department + '&shiftCode=' + this.reportObj.shiftCode
    ).subscribe((res: any) => {
      this.spinner.hide();
      const file = new Blob([res], { type: 'application/pdf' });
      const fileName = 'Missing_punch_' + new Date().toTimeString().split(' ')[0].replace(/:/g, '_')
      FileSaver.saveAs(file, fileName + '.pdf');
      // const fileURL = URL.createObjectURL(file);
      // window.open(fileURL);
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
    this.spinner.show();
    this.reportObj.from =
      this.selectedDateRange.startDate.format('YYYY-MM-DD');
    this.reportObj.to = this.selectedDateRange.endDate.format('YYYY-MM-DD');
    this.httpGetService.getExcel('reports/missingPunch/xls?empCode=' + this.reportObj.empCode + '&from=' + this.reportObj.from + '&to=' + this.reportObj.to +
      '&deptCode=' + this.reportObj.department + '&shiftCode=' + this.reportObj.shiftCode
    ).subscribe((res: any) => {
      this.spinner.hide();
      const data: Blob = new Blob([res], { type: EXCEL_TYPE });
      const fileName = 'Missing_punch_' + new Date().toTimeString().split(' ')[0].replace(/:/g, '_');
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

import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';

import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { Router } from '@angular/router';
import { Moment } from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { forkJoin } from 'rxjs';
import { ExcelService } from 'src/app/services/excel.service';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';
import { HttpPutService } from 'src/app/services/http-put.service';
import { UtilService } from 'src/app/services/util.service';
import Swal from 'sweetalert2';
import { HttpPostService } from '../../../services/http-post.service';
import { AttendanceModelComponent } from '../attendance-model/attendance-model.component';
export const MY_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-admin-attendance',
  templateUrl: './attendance-summary.component.html',
  styleUrls: ['./attendance-summary.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
  encapsulation: ViewEncapsulation.None,
})
export class AdminAttendanceComponent implements OnInit {
  @ViewChild('picker') datePickerElement = MatDatepicker;
  attendance_list: any = [];
  config: any;
  monthly_dates: any = [];
  maxDate = moment().add(1, 'months');

  date: any = moment()
  year: any = moment().format('YYYY');
  month: any = moment().format('MM');
  temp: any = [];
  option: any;
  searchedFor: string;
  isHovered = false;
  message = 'clickOnsubmit';
  hoveredItemPosition = { x: 0, y: 0 };
  hoveredItem: any;
  sortOrder = 'asc';
  dateFormat: string;
  selectedCells: { rowIndex: number, colIndex: number, data: any }[] = [];
  recordss = [];
  isMouseDown = false;
  hideMarkAttendance = false;
  sortColumn = 'employeeName';
  attendStatus = ['Full Day', 'Half Day'];
  selected_department: string;
  departments_list: any[];
  projects = [];
  projectCode: string;
  hideAtt = false;
  hideWeekOff = false;
  hideLeave = false;

  showWeekOff: boolean;
  constructor(
    private httpGet: HttpGetService,
    private httpPost: HttpPostService,
    private spinner: NgxSpinnerService,
    public global: GlobalvariablesService,
    private modalService: NgbModal,
    private router: Router,
    private excelService: ExcelService,
    private httpPut: HttpPutService,
    private utilServ: UtilService,

  ) {
    this.getMonthlyDates();
    this.config = {
      itemsPerPage: 25,
      currentPage: 1,
      totalItems: this.attendance_list.length,
    };
  }

  ngOnInit(): void {
    this.getDepartments();
    this.getProjects();
    this.showWeekOff = this.global.hasFlexibleWeekends === 'N' ? false : true;
    this.global.getMyCompLabels('attSummaryComp');
  }

  getProjects() {
    this.spinner.show();
    this.httpGet.getMasterList('accprojects').subscribe(
      (res: any) => {
        if (res.response.length > 0) {
          res.response.unshift({
            project: 'All',
          })
          this.projectCode = 'All'
          this.projects = res.response;
        } else {
          this.projectCode = null;
        }
        this.spinner.hide();
      },
      err => {
        this.spinner.hide();
        console.error(err.error.status.message);
        // Swal.fire({
        //   icon: "error",
        //   text: err.error.status.message,
        //   title: "Error",
        // })
      })
  }
  getDepartments() {
    this.httpGet.getMasterList('accdepts').subscribe((res: any) => {
      if (res.response.length > 0) {
        res.response.unshift({
          dept: 'All',
          permission: null,
        })
        this.departments_list = res.response;
        this.selected_department = 'All'
      } else {
        this.selected_department = null;
      }
    },
      err => {
        console.error(err.error.status.message);
      });
  }

  setMonthAndYear(
    normalizedMonthAndYear: Moment,
    datepicker: MatDatepicker<Moment>
  ) {
    this.date = normalizedMonthAndYear;
    this.month = normalizedMonthAndYear.format('MM');
    this.year = normalizedMonthAndYear.format('YYYY');
    this.monthly_dates = [];
    this.attendance_list = [];
    this.message = 'clickOnsubmit';
    this.getMonthlyDates();
    datepicker.close();
  }


  getAttendanceSummary() {
    this.spinner.show();
    // this.httpGet.getMasterList('timesheet?empCode=625&month=10&year=2023').subscribe(
    this.httpGet.getEmployeeAttendance(this.year, this.month, this.selected_department, this.projectCode).subscribe(
      (res: any) => {
        const unique = [
          ...new Set(res.response.map((e: any) => e.employeeCode)),
        ];
        const employee_data = [];
        unique.forEach((u) => {
          const arr = [];
          let p = 0, ab = 0, l = 0, od=0, hd = 0, w = 0, h = 0, workingDays = 0;

          res.response.forEach((a) => {
            if (a.employeeStatus == 'Full Day') {
              a.employeeStatus = 'P'
            }
            if (u == a.employeeCode) {
              if (moment(a.inDate).format('YYYY-MM-DD') <= moment().format('YYYY-MM-DD')) {
                // a.status == 'Full Day' ? a.shortStatus = 'P' : a.status == 'Missing Swipe' ? a.shortStatus = 'P/*' : a.shortStatus;
                a.employeeStatus == 'P' || a.employeeStatus == 'Full Day' || a.employeeStatus == 'Missing Swipe' || a.employeeStatus == 'W/P' || a.employeeStatus == 'H/P' || a.employeeStatus == 'Half Day' ? ++p : p;
                a.employeeStatus == 'Reported' ? ++l : l;
                a.employeeStatus == 'OD' ? ++od : od;
                a.employeeStatus == 'L' || a.employeeStatus == '-' ? ++ab : ab;
                a.employeeStatus == 'Half Day' ? ++hd : hd;
                a.employeeStatus == 'W' || a.employeeStatus == 'W/P' ? ++w : w;
                a.employeeStatus == 'H' || a.employeeStatus == 'H/P' ? ++h : h;
                a.employeeStatus !== 'H' && a.employeeStatus !== 'H/P' && a.employeeStatus !== 'W' && a.employeeStatus !== 'W/P' ? ++workingDays : workingDays;
              }
              arr.push({
                date: a.inDate,
                status: a.employeeStatus,
                shortStatus: a.employeeStatus == 'Half Day' ? 'HD' :
                  a.employeeStatus == 'Shift Not Assigned' ? '-' :
                    a.employeeStatus == 'Reported' ? 'L' :
                      a.employeeStatus == 'L' ? 'X' :
                        a.employeeStatus == 'Full Day' ? 'P' :
                          a.employeeStatus,
                employeeName: a.employeeName,
                aliasName: a.aliasName,
                inTime: a.inTime ? a.inTime : '00:00:00',
                outTime: a.outTime ? a.outTime : '00:00:00',
                employeeCode: a.employeeCode, deptCode: a.deptCode, projectCode: a.projectCode, shift: a.shiftCode ? a.shiftCode : 'No Shift Assigned'
              });
            }
          });
          employee_data.push({
            name: '', code: u, empType: '', deptCode:'', data: arr, 'workingDays': workingDays, 'present': p, 'od': od, 'leave': l, 'absent': ab, 'halfDay': hd,
            weekOff: w, holiday: h
          });
        });

        for (const employee of employee_data) {
          const employeeCode = employee;
          for (const record of res.response) {

            if (record.employeeCode == employeeCode.code) {
              employeeCode.name = record.employeeName,
                employeeCode.employeeType = record.employeeType,
                employeeCode.deptCode = record.deptCode,
              employeeCode.aliasName = record.aliasName
            }
          }
        }
        for (const employee of employee_data) {
          const employeeData = employee.data;
          // Loop through the monthDates
          for (const date of this.monthly_dates) {
            // Check if the date exists in the employee's data
            const matchingDate = employeeData.find((record) => record.date === date);

            // If the date is missing, add a record with status "-"
            if (!matchingDate) {
              employeeData.push({
                date: date,
                status: "-",
                shift: 'Not Assigned',
                inTime: '00:00',
                outTime: '00:00',
                projectCode: '-'
              });
            }
          }
          const uniqueDates = {};
          const filtered = employeeData.filter((item) => {
            if (uniqueDates[item.date]) {
              return false
            } else {
              uniqueDates[item.date] = true;
              return true
            }
          });
          employee.data = filtered
        }
        employee_data.forEach((record) => {
          record.data.sort((a, b) => (a.date < b.date ? -1 : 1));
        });
        const attendance_list = employee_data;
        this.temp = [...attendance_list];
        if (this.searchedFor !== '' && this.searchedFor !== undefined) {
          const val = this.searchedFor.toLowerCase();
          this.attendance_list = attendance_list.filter(function (d) {
            return (d.name && d.name.toLowerCase().indexOf(val) !== -1) ||
              (d.aliasName && d.aliasName.toLowerCase().indexOf(val) !== -1) ||
              (d.code && d.code.toLowerCase().indexOf(val) !== -1) ||
              !val;
          });
        }
        else {
          this.attendance_list = attendance_list
        }
        this.spinner.hide();
        this.message = 'clicked'
        this.dateFormat = this.global.dateFormat;
        this.checkInTimeStatisticsChart();
      },
      (err) => {
        this.spinner.hide();
        this.message = 'error';
        Swal.fire({
          title: 'Error!',
          text: err.error.status.message,
          icon: 'error',
        });
      }
    );
  }


  saveAsExcel() {
    const transformedData = [];   
    this.attendance_list.forEach((item) => {
      let p = 0, a = 0, l = 0, hd = 0, od=0, w = 0, h = 0, workingDays = 0;
      const record = {
        'Employee Code': item.code,
        'Employee Name': item.name,
        'Employee Type': item.employeeType !== null ? item.employeeType : '',
        'Dept': item.deptCode !== null ? item.deptCode :'',
      };
      item.data.forEach((day) => {
        day.status == 'Full Day' ? day.shortStatus = 'P' : day.status == 'Missing Swipe' ? day.shortStatus = 'P/*' : day.status == null ? day.shortStatus = '' : day.shortStatus;
        if (moment(day.date).format('YYYY-MM-DD') <= moment().format('YYYY-MM-DD')) {
          record[day.date] = day.shortStatus == null ? '' : day.shortStatus;
          day.status == 'P' || day.status == 'Full Day' || day.status == 'Half Day' || day.status == 'Missing Swipe' || day.status == 'W/P' || day.status == 'H/P' ? ++p : p;
          day.status == 'Reported' ? ++l : l;
          day.status == 'OD' ? ++od: od;
          day.status == 'L' || day.status == '-' ? ++a : a;
          day.status == 'Half Day' ? ++hd : hd;
          day.status == 'W' || day.status == 'W/P' ? ++w : w;
          day.status == 'H' || day.status == 'H/P' ? ++h : h;
          day.status !== 'H' && day.status !== 'H/P' && day.status !== 'W' && day.status !== 'W/P' ? ++workingDays : workingDays;
        }
        else {
          record[day.date] = day.shortStatus == null ? '' : day.shortStatus;
        }
      });
      record[''] = '';
      record['Working Days'] = workingDays;
      record['Present'] = p;
      record['OD'] = od;
      record['Leave'] = l;
      record['Absent'] = a;
      // record['Half Day'] = hd;
      record['Week Off'] = w;
      record['Holiday'] = h;
      transformedData.push(record);
    });
    this.excelService.exportAsExcelFile(transformedData, 'Attendance_');
  }


  resultsPerPage(event) {
    this.config.itemsPerPage = event.target.value == 'all' ? this.temp.length : event.target.value;
    this.config.currentPage = 1;
  }
  sortData(col: string): void {
    if (this.sortColumn === col) {
      if (this.sortOrder === 'asc') {
        this.sortOrder = 'desc';
      }
      else {
        this.sortOrder = 'asc';
      }
    }
    else {
      this.sortColumn = col;
      this.sortOrder = 'asc';
    }
    this.attendance_list = this.attendance_list.sort((a, b) => {
      if (a[col] < b[col]) {
        return this.sortOrder === 'asc' ? -1 : 1;
      }
      if (a[col] > b[col]) {
        return this.sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }
  filterRecords(ev) {
    const date = moment().format('YYYY-MM-DD');
    if (ev.target.value == 'All') {
      this.attendance_list = this.temp
    } else {
      const filteredEmployees = this.temp.filter(employee =>
        employee.data.some(record => record.status === ev.target.value && record.date == date)
      );
      this.attendance_list = filteredEmployees
    }
  }

  async checkInTimeStatisticsChart() {
    const status = ['P', 'Full Day', 'L', 'Reported', 'Half Day']
    let record = [];
    const date = moment().format('YYYY-MM-DD')
    status.forEach(element => {
      const filteredEmployees = this.temp.filter(employee =>
        employee.data.some(r => r.status === element && r.date == date)
      );
      record.push({
        name: element === "P" || element === "Full Day" ? 'Present' : element === "L" ? 'Not Reported' : element === "Reported" ? 'Leave' : 'Half Day',
        value: filteredEmployees.length,
        code: element
      })
    });
    let filtered = [], filteredData = [];
    filteredData = record.reduce((acc, x) => {
      if (!filtered.includes(x.name)) {
        filtered.push(x.name);
        acc.push(x);
      } else {
        const data = acc.find(y => y.name === x.name);
        if (data) {
          data.value += x.value;
        }
      }
      return acc;
    }, []);
    const colorPalette = ['#55ce63 ', '#cc7b4a', '#FF4C6C', '#FFBF00'];
    this.option = {
      title: {
        text: this.global.showLabel('attSnapshot'),
        left: 'center'
      },
      tooltip: {
        trigger: 'item'
      },
      legend: {
        orient: 'vertical',
        left: 'right',
        bottom: '2%',

      },
      series: [
        {
          // name: 'Access From',
          type: 'pie',
          radius: ['40%', '70%'],
          color: colorPalette,
          avoidLabelOverlap: false,

          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            // borderWidth: 2,
            // shadowBlur: 2,
            // shadowOffsetX: 0,
            // shadowOffsetY: 0,
            shadowColor: '#0080fc'
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 40,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: filteredData,
        }
      ]
    };
  }

  pageChanged(event) {
    this.config.currentPage = event;
  }
  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    if (val == '') {
      this.attendance_list = [...this.temp];
    } else {
      const temp = this.temp.filter(function (d) {
        return (d.name && d.name.toLowerCase().indexOf(val) !== -1) ||
          (d.aliasName && d.aliasName.toLowerCase().indexOf(val) !== -1) ||
          (d.code && d.code.toLowerCase().indexOf(val) !== -1) ||
          !val;
      });
      this.attendance_list = temp;
    }
    this.config.totalItems = this.attendance_list.length;
    this.config.currentPage = 1;
  }

  back() {
    this.router.navigateByUrl('/dashboard');
  }

  onMouseDown(rowIndex: number, colIndex: number, data: any) {
    this.hideAtt = false;
    this.hideWeekOff = false;
    this.hideLeave = false;
    const find = this.departments_list.find(x => x.dept == data.deptCode);
    if (find && find.permission == 'WRITE') {
      if (moment().format('YYYY-MM-DD') >= data.date) {
        this.hideMarkAttendance = false;
      }
      else {
        this.hideMarkAttendance = true;
      }
      this.isMouseDown = true;
      this.selectedCells = [{ rowIndex, colIndex, data }];
    }
  }

  onMouseOver(rowIndex: number, colIndex: number, data: any) {
    if (this.isMouseDown) {
      const find = this.departments_list.find(x => x.dept == data.deptCode)
      if (find && find.permission == 'WRITE') {
        if (this.selectedCells[0].rowIndex === rowIndex) {
          const currentIndex = { rowIndex, colIndex, data };
          if (!this.selectedCells.some(cell => this.areEqual(cell, currentIndex))) {
            this.selectedCells.push(currentIndex);
          }
        }
      }
    }
  }


  isSelected(rowIndex: number, colIndex: number, data: any): boolean {
    return this.selectedCells.some(cell => this.areEqual(cell, { rowIndex, colIndex, data }));
  }
  onMouseUp(ev: MouseEvent) {
    this.isMouseDown = false;
    if (ev.which == 1) {
      this.recordss = this.selectedCells
      this.hideDetails();
    }
    else if (ev.which == 3 && this.recordss.length > 0) {
      this.showDetails(ev, this.recordss)
      this.selectedCells = [];
      this.selectedCells = this.recordss
    }
  }
  onRightClick(event: Event) {
    this.selectedCells = [];
    event.preventDefault();
    this.selectedCells = this.recordss
  }
  private areEqual(cell1: any, cell2: any): boolean {
    return cell1.rowIndex === cell2.rowIndex && cell1.colIndex === cell2.colIndex;
  }
  showDetails(event: MouseEvent, item: any) {
    this.isHovered = true;
    this.hoveredItem = item;
    this.hoveredItemPosition.x = Math.min(event.clientX - 200, window.innerWidth);
    if (event.clientY + 121 > window.innerHeight) {
      this.hoveredItemPosition.y = event.clientY - 170
    } else {
      this.hoveredItemPosition.y = event.clientY + 20
    }
  }

  hideDetails() {
    this.isHovered = false;
    this.hoveredItem = null;
  }
  modified() {
    this.attendance_list = [];
    this.temp = [];
    this.message = 'clickOnsubmit';
  }
  openModal(val) {
    if (this.hoveredItem.length > 0) {
      const modalRef = this.modalService.open(AttendanceModelComponent, {
        scrollable: true,
        windowClass: 'myCustomModalClass',
        size: 'lg',
        backdrop: 'static',
      });
      modalRef.componentInstance.attendDetails = {
        details: this.hoveredItem,
        source: val
      };
      modalRef.result.then(
        (x) => {
          this.hideDetails();
          // const find = this.attendance_list.find(c => c.code == result.employeeCode)
          // const row = find['data'].find(x => x.date == result.dateCode)
          // row.status = result.attStatus
          if (x !== '') {
            this.attendance_list = []
            this.getAttendanceSummary();
          }
        },
      );
    }
    else {
      this.hideDetails();
      Swal.fire({
        text: 'Left click to select and Right click to modify',
        icon: 'info',
      })
    }
  }

  markWeekoffFunction() {

    Swal.fire({
      title: "Are you sure?",
      html: `Do you want to mark week off for <b>` + this.hoveredItem[0].data.employeeName + '</b>',
      showDenyButton: true,
      confirmButtonText: "Yes",
      denyButtonText: `No`
    }).then((result) => {
      if (result.isConfirmed) {
        this.spinner.show();

        const requests = [];
        this.hoveredItem.forEach(element => {
          const request = this.httpPut.doPut('emp/timesheet?empCode=' + element.data.employeeCode + '&date=' + element.data.date + '&shift='
            + '&status=Week Off', '')
          requests.push(request);
        });
        forkJoin(requests).subscribe(
          (responses: any[]) => {
            this.spinner.hide();
            let success = true;
            let errorMessage = '';

            // Check the responses for success or failure
            responses.forEach(res => {
              if (res.status.message != 'SUCCESS') {
                success = false;
                errorMessage = res.status.message;
              }
            });
            // Show appropriate alert based on the result
            if (success) {
              this.sweetAlert_topEnd('success', 'Attendance Modified');
              this.attendance_list = [];
              this.hideDetails();
              this.getAttendanceSummary();          // Optionally close modals or perform additional actions
            } else {
              Swal.fire({
                title: 'Error!',
                text: errorMessage,
                icon: 'warning',
                showConfirmButton: true,
              });
            }
          },
          (err) => {
            this.spinner.hide();
            this.sweetAlert_topEnd('error', err.error.status.message);
          }
        );
      }
    })


    // this.httpPut.doPut('emp/timesheet?empCode=' + this.hoveredItem[0].data.employeeCode + '&date=' + this.hoveredItem[0].data.date + '&shift='
    //   + '&status=Week Off', '').subscribe(
    //     (res: any) => {
    //       this.spinner.hide();
    //       if (res.status.message == 'SUCCESS') {
    //         this.sweetAlert_topEnd('success', 'Attendance Modified');
    //         this.attendance_list = [];
    //         this.hideDetails();
    //         this.getAttendanceSummary();
    //       }
    //       else {
    //         Swal.fire({
    //           title: 'Error!',
    //           text: res.status.message,
    //           icon: 'warning',
    //           showConfirmButton: true,
    //         });
    //       }
    //     },
    //     (err) => {
    //       this.spinner.hide();
    //       this.sweetAlert_topEnd('error', err.error.status.message);
    //     }
    //   );
    //   }
    // });
  }

  async markOdFunction() {
    Swal.fire({
  // Swal.fire({
      title: 'Are you sure ?',
      html: `Do you want to mark OD for <b>` + this.hoveredItem[0].data.employeeName + '</b>',
      input: 'text',
      inputPlaceholder: 'Enter the comments',
      inputAttributes: {
        autocapitalize: 'off'
      },
      showDenyButton: true,
      confirmButtonText: "Yes",
      denyButtonText: `No`,
    }).then((result) => {
      if (result.isConfirmed) {
        this.spinner.show();
        const requests = [];
        this.hoveredItem.forEach(element => {
          const request = this.httpPut.doPut('emp/timesheet?empCode=' + element.data.employeeCode + '&date=' + element.data.date + '&shift='
            + '&status=OD' + '&userComments=' + result.value, '')
          requests.push(request);
        });
        forkJoin(requests).subscribe(
          (responses: any[]) => {
            this.spinner.hide();
            let success = true;
            let errorMessage = '';

            // Check the responses for success or failure
            responses.forEach(res => {
              if (res.status.message != 'SUCCESS') {
                success = false;
                errorMessage = res.status.message;
              }
            });
            // Show appropriate alert based on the result
            if (success) {
              this.sweetAlert_topEnd('success', 'Attendance Modified');
              this.attendance_list = [];
              this.hideDetails();
              this.getAttendanceSummary();          // Optionally close modals or perform additional actions
            } else {
              Swal.fire({
                title: 'Error!',
                text: errorMessage,
                icon: 'warning',
                showConfirmButton: true,
              });
            }
          },
          (err) => {
            this.spinner.hide();
            this.sweetAlert_topEnd('error', err.error.status.message);
          }
        );
      }
    })



    // this.httpPut.doPut('emp/timesheet?empCode=' + this.hoveredItem[0].data.employeeCode + '&date=' + this.hoveredItem[0].data.date + '&shift='
    //   + '&status=OD', '').subscribe(
    //     (res: any) => {
    //       this.spinner.hide();
    //       if (res.status.message == 'SUCCESS') {
    //         this.sweetAlert_topEnd('success', 'Attendance Modified');
    //         this.attendance_list = [];
    //         this.hideDetails();
    //         this.getAttendanceSummary();
    //       }
    //       else {
    //         Swal.fire({
    //           title: 'Error!',
    //           text: res.status.message,
    //           icon: 'warning',
    //           showConfirmButton: true,
    //         });
    //       }
    //     },
    //     (err) => {
    //       this.spinner.hide();
    //       this.sweetAlert_topEnd('error', err.error.status.message);
    //     }
    //   );
    //   }
    // });
  }
  noRepFun() {
    Swal.fire({
      icon: 'warning',
      title: "Are you sure?",
      html: `Do you want to mark Not Reported for  <b>` + this.hoveredItem[0].data.employeeName + '</b> <br> <span style="color:red">This Timesheet record will be deleted permanently.</span>',
      showDenyButton: true,
      confirmButtonText: "Yes",
      denyButtonText: `No`,
      input: 'text',
      inputPlaceholder: 'Enter the comments',
      inputAttributes: {
        autocapitalize: 'off'
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.spinner.show();
        const requests = [];
        this.hoveredItem.forEach(element => {
          const request = this.httpPut.doPut('emp/timesheet?empCode=' + element.data.employeeCode + '&date=' + element.data.date + '&shift=""'
            + '&status=Not Reported' + '&currentStatus=' + element.data.status + '&userComments=' + result.value, '')
          requests.push(request);
        });

        forkJoin(requests).subscribe(
          (responses: any[]) => {
            this.spinner.hide();
            let success = true;
            let errorMessage = '';

            // Check the responses for success or failure
            responses.forEach(res => {
              if (res.status.message != 'SUCCESS') {
                success = false;
                errorMessage = res.status.message;
              }
            });
            // Show appropriate alert based on the result
            if (success) {
              this.sweetAlert_topEnd('success', 'Attendance Modified');
              this.attendance_list = [];
              this.hideDetails();
              this.getAttendanceSummary();          // Optionally close modals or perform additional actions
            } else {
              Swal.fire({
                title: 'Error!',
                text: errorMessage,
                icon: 'warning',
                showConfirmButton: true,
              });
            }
          },
          (err) => {
            this.spinner.hide();
            this.sweetAlert_topEnd('error', err.error.status.message);
          }
        );
      }
    })



    // this.spinner.show();
    // this.httpPut.doPut('emp/timesheet?empCode=' + this.hoveredItem[0].data.employeeCode + '&date=' + this.hoveredItem[0].data.date + '&shift=""'
    //   + '&status=Not Reported' + '&currentStatus=' + this.hoveredItem[0].data.status, '').subscribe(
    //     (res: any) => {
    //       this.spinner.hide();
    //       if (res.status.message == 'SUCCESS') {
    //         this.sweetAlert_topEnd('success', 'Attendance Modified');
    //         this.attendance_list = [];
    //         this.hideDetails();
    //         this.getAttendanceSummary();
    //       }
    //       else {
    //         Swal.fire({
    //           title: 'Error!',
    //           text: res.status.message,
    //           icon: 'warning',
    //           showConfirmButton: true,
    //         });
    //       }
    //     },
    //     (err) => {
    //       this.spinner.hide();
    //       this.sweetAlert_topEnd('error', err.error.status.message);
    //     }
    //   );
    //   }
    // });
  }
  sweetAlert_topEnd(icon, title) {
    Swal.fire({
      icon: icon,
      title: title,
      showConfirmButton: false,
      timer: 5000,
    });
  }


  getMonthlyDates() {
    let daysInMonth = moment(
      `${this.year}-${this.month}`,
      'YYYY-MM'
    ).daysInMonth();
    this.monthly_dates = [];
    while (daysInMonth) {
      const current = moment(`${this.year}-${this.month}`, 'YYYY-MM').date(
        daysInMonth
      );
      this.monthly_dates.push(current.format('YYYY-MM-DD'));
      daysInMonth--;
    }
    this.monthly_dates = this.monthly_dates.reverse();
  }
}


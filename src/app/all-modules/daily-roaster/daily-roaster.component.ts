import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { MatDatepicker } from '@angular/material/datepicker';
import moment, { Moment } from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { HttpGetService } from 'src/app/services/http-get.service';
import Swal from 'sweetalert2';

import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { HttpPutService } from 'src/app/services/http-put.service';
import { UtilService } from 'src/app/services/util.service';
import { ShiftmodifyModalComponent } from './shiftmodify-modal/shiftmodify-modal.component';
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
  selector: 'app-daily-roaster',
  templateUrl: './daily-roaster.component.html',
  styleUrls: ['./daily-roaster.component.scss'],
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
export class DailyRoasterComponent implements OnInit {
  className = 'DailyRoasterComponent';

  @ViewChild('picker') datePickerElement = MatDatepicker;
  @ViewChild('table') table: ElementRef | undefined;
  groupedObjects = [];
  message = 'clickOnsubmit';
  date: any = moment();
  year: any = moment().format('YYYY');
  month: any = moment().format('MM');
  pjCode: string;
  shiftCode: string;
  empCode: string;
  shifts = [];
  option: any;
  rows = [];
  searchedFor: string;
  temp = [];
  categorys = [];
  departments_list: any[];
  stopSpinner = false;
  employee = [];
  listOfshiftCode = [];
  collection = [];
  sortOrder = 'asc';
  sortColumn = 'name';
  selected_department = 'ALL';
  colorCombinations = [
    { color: '#FCF6F5FF', bgColor: '#0063b2', backcolor: 'rgb(0, 99, 178,13%)' },
    { color: '#FCF6F5FF', bgColor: '#27b965', backcolor: 'rgb(255, 170, 0,13%)' },
    { color: '#FFFFFFF', bgColor: '#ff763c', backcolor: 'rgb(0, 0, 0,13%)' },
    { color: '#FCF6F5FF', bgColor: '#8b3dff', backcolor: 'rgb(139, 61, 255,13%)' },
    { color: '#FCF6F5FF', bgColor: '#FF4C6C', backcolor: 'rgb(43, 174, 102 ,13%)' },
    { color: '#FFFFFFFF', bgColor: '#f95700', backcolor: 'rgb(249, 87, 0,13%)' },
    { color: '#FCF6F5FF', bgColor: '#0063b2', backcolor: 'rgb(0, 32, 63, 13%)' },
    { color: '#FCF6F5FF', bgColor: '#FFBF00', backcolor: 'rgb(0, 32, 63, 13%)' },

  ]; 
  // const colorPalette = ['#0063b2', '#27b965 ', '#ff763c', '#8b3dff', '#FF4C6C', '#f95700', '#0063b2', '#FFBF00',];

  monthly_dates: any = [];
  config: any;
  // isMouseDown = false;
  // selectedCells: number[] = [];
  isMouseDown = false;
  selectedCells: { rowIndex: number, colIndex: number, data: any }[] = [];
  disableTillDateRecords: any;
  isHovered = false;
  hoveredItemPosition = { x: 0, y: 0 };
  hoveredItem: any;
  recordss = [];
  constructor(private httpGet: HttpGetService,
    private spinner: NgxSpinnerService,
    private modalService: NgbModal,
    private httpPut: HttpPutService,
    private utilServ: UtilService
  ) {
    this.getMonthlyDates();
    this.config = {
      itemsPerPage: 25,
      currentPage: 1,
      totalItems: this.rows.length,
    };
  }
  ngOnInit() {
    this.getDepartments();
    this.getShifts();
    this.disableTillDateRecords = moment().format('YYYY-MM-DD')
  }
  isRecordDisabled(index: number, j): boolean {
    // Compare the date of the record with the current date
    const recordDate = moment(this.rows[index].data[j].date).format('YYYY-MM-DD');
    return recordDate <= this.disableTillDateRecords;
  }
  isSelected(rowIndex: number, colIndex: number, data: any): boolean {
    return this.selectedCells.some(cell => this.areEqual(cell, { rowIndex, colIndex, data }));
  }
  onRightClick(event: Event) {
    this.selectedCells = [];
    event.preventDefault();
    this.selectedCells = this.recordss
  }
  async checkInTimeStatisticsChart() {
    const record = [];
    const date = moment().format('YYYY-MM-DD')
    this.listOfshiftCode.forEach(element => {
      const filteredEmployees = this.temp.filter(employee =>
        employee.data.some(record => record.shiftCode === element && record.date == date)
      );
      record.push({
        name: element,
        value: filteredEmployees.length
      })
    });
    // const colorPalette = ['#ff763c', '#27b965 ', '#f95700', '#8b3dff', '#FFBF00', '#FF4C6C'];
    const colorPalette = this.collection.filter(item => item.background).map(item => item.background);
    //  ['#0063b2', '#27b965 ', '#ff763c', '#8b3dff', '#FF4C6C', '#f95700', '#0063b2', '#FFBF00',];
    this.option = {
      title: {
        text: "Today's Shifts Snapshot",
        // subtext: 'Employee check-in times'
        left: 'center'
      },
      tooltip: {
        trigger: 'item'
      },
      legend: {
        // orient: 'vertical',
        // left: 'right',
        // bottom: '2%',
        show: false

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
          data: record,

        }
      ]
    };
  }


  onMouseDown(rowIndex: number, colIndex: number, data: any) {
    const find = this.departments_list.find(x => x.dept == data.deptCode)
    if (find && find.permission == 'WRITE') {
      this.isMouseDown = true;
      // if (moment().format('YYYY-MM-DD') < data.date && data.shift !== 'W' && data.shift !== 'H') {
        this.selectedCells = [{ rowIndex, colIndex, data }];
      // }
    }
  }

  onMouseOver(rowIndex: number, colIndex: number, data: any) {
    if (this.isMouseDown) {
      const find = this.departments_list.find(x => x.dept == data.deptCode)
      if (find && find.permission == 'WRITE') {
        // if (moment().format('YYYY-MM-DD') < data.date) {
        const currentIndex = { rowIndex, colIndex, data };
        if (!this.selectedCells.some(cell => this.areEqual(cell, currentIndex))) {
          this.selectedCells.push(currentIndex);
        }
        // }
      }
    }
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


  private areEqual(cell1: any, cell2: any): boolean {
    return cell1.rowIndex === cell2.rowIndex && cell1.colIndex === cell2.colIndex;
    // return false;
  }

  showDetails(event: MouseEvent, item: any) {
    this.isHovered = true;
    this.hoveredItem = item;   
    this.hoveredItemPosition.x = Math.min(event.clientX - 200, window.innerWidth);
    this.hoveredItemPosition.y = event.clientY + 14
  }

  hideDetails() {
    this.isHovered = false;
    this.hoveredItem = null;
  }


  openModal(source) {
    if (this.hoveredItem.length > 0) {
      const modalRef = this.modalService.open(ShiftmodifyModalComponent, {
        scrollable: true,
        windowClass: 'myCustomModalClass',
        size: 'lg',
        backdrop: 'static',
      });

      modalRef.componentInstance.empShiftData = {
        userProfile: this.hoveredItem,
        source: source
      };
      modalRef.result.then(
        () => {
          this.hideDetails();
          this.getDailyRoaster();
        },
      );
    }
    else {
      this.hideDetails();
      Swal.fire({
        text: 'click and drag on cells to modify the shift',
        icon: 'info',
      })
    }
  }


  getDepartments() {
    this.httpGet.getMasterList('accdepts').subscribe((res: any) => {
      res.response.unshift({ dept: 'ALL', permission: null })
      this.departments_list = res.response;
      this.employeesByDepartment();
    },
      err => {
        console.error(err.error.status.message);
      });
  }

  employeesByDepartment() {
    this.stopSpinner = false;
    this.temp = [];
    this.rows = [];
    this.employee = [];
    this.spinner.show();
    this.httpGet
      .getEmployeesByDepartment(this.selected_department)
      .subscribe((res: any) => {
        if (res.response.length > 0) {
          res.response.unshift({ employeeCode: 'ALL', employeeName: 'ALL' })
          this.employee = res.response;
          this.empCode = res.response[0].employeeCode;
        }
        this.stopSpinner = true;
      });
    this.spinner.hide();
  }

  setMonthAndYear(
    normalizedMonthAndYear: Moment,
    datepicker: MatDatepicker<Moment>
  ) {
    this.date = normalizedMonthAndYear;
    this.month = normalizedMonthAndYear.format('MM');
    this.year = normalizedMonthAndYear.format('YYYY');
    this.monthly_dates = [];
    this.rows = [];
    this.getMonthlyDates();
    datepicker.close();
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

  getEmpByCategory() {
    this.stopSpinner = false;
    this.temp = [];
    this.rows = [];
    this.spinner.show();
    this.httpGet.getMasterList('payrolls?category=ALL').subscribe(
      (res: any) => {
        if (res.response.length > 0) {
          res.response.unshift({ employeeCode: 'ALL', employeeName: 'ALL' })
          this.employee = res.response;
          this.empCode = res.response[0].employeeCode;
        }
      }, (err) => {
        this.spinner.hide();
        console.error(err);
      }
    );
  }

  getShifts() {
    this.listOfshiftCode = [];
    this.httpGet.getMasterList('shifts/active').subscribe(
      (res: any) => {
        res.response.forEach(element => {
          this.listOfshiftCode.push(element.shiftCode);
        });
        if (res.response.length > 0) {
          res.response.color = '';
          this.shifts = res.response.sort((a, b) => {
            return a.shiftId - b.shiftId
          });
          res.response.unshift({ shiftCode: 'ALL' })
          this.shiftCode = this.shifts[0].shiftCode;
        }
        for (let i = 0; i < this.shifts.length; i++) {
          const j = i % this.colorCombinations.length;
          this.shifts[i].color = this.colorCombinations[j].color;
          this.shifts[i].bgcolor = this.colorCombinations[j].bgColor;
        }
        this.spinner.hide();
      },
      (err) => {
        this.spinner.hide();
        console.error(err);
      }
    );
  }
  getDailyRoaster() {
    this.selectedCells = [];
    this.recordss = [];
    this.hideDetails();
    this.collection = [];
    this.spinner.show();
    this.rows = [];
    this.temp = [];
    this.httpGet.getMasterList(
      'dailyRoster?shiftCode=' + this.shiftCode + '&month=' + this.month + '&year=' + this.year + '&empCode=' + this.empCode + '&department=' + this.selected_department
    ).subscribe((res: any) => {
      const unique = [
        ...new Set(res.response.map((e: any) => e.employeeCode)),
      ];
      const employee_data = [];
      unique.forEach((u) => {
        const arr = [];
        res.response.forEach((a) => {
          if (u == a.employeeCode) {
            arr.push({ date: a.dateCode, empName: a.employeeName, aliasName: a.aliasName, employeeCode: a.employeeCode, deptCode: a.deptCode, shiftCode: a.shiftCode, shift: this.replaceShiftCodeWithName(a.shiftCode), color: this.getcolor(a.shiftCode), bgColor: this.getbgcolor(a.shiftCode) });
          }
        });
        employee_data.push({ name: '', code: u, deptCode: '', aliasName: '', data: arr });
      });
      this.collection.forEach(x => x.shift = x.shift.charAt(0))
      for (const employee of employee_data) {
        const employeeCode = employee;
        for (const record of res.response) {

          if (record.employeeCode == employeeCode.code) {
            employeeCode.name = record.employeeName
            employeeCode.deptCode = record.deptCode
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
              shift: null,
              color: '#000000',
              empName: employee.name,
              bgColor: null,
              aliasName: employee.aliasName,
              deptCode: employee.deptCode,
              employeeCode: employee.code,
              shiftCode: null,
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
      this.temp = attendance_list;
      if (this.className == this.utilServ.universalSerchedData?.componentName) {
        this.searchedFor = this.utilServ.universalSerchedData.searchedText
        if (this.searchedFor !== '' && this.searchedFor !== undefined) {
          const val = this.searchedFor.toLowerCase();
          this.rows = attendance_list.filter(function (d) {
            return (d.name && d.name.toLowerCase().indexOf(val) !== -1) ||
              (d.aliasName && d.aliasName.toLowerCase().indexOf(val) !== -1) ||
              (d.code && d.code.toLowerCase().indexOf(val) !== -1) ||
              !val;
          });
        }
        else {  
          this.rows = attendance_list
        }
      } else {
        this.rows = attendance_list
      }
      this.checkInTimeStatisticsChart();
      // this.getRandomColor();
      this.spinner.hide();
      if (this.rows.length == 0) {
        this.message = 'modified';
        Swal.fire({
          icon: 'info',
          title: 'NO RECORD FOUND!',
        });
      }
    },
      (err) => {
        this.spinner.hide();
        this.message = 'error'
        Swal.fire({
          title: 'Error!',
          text: err.error.status.message,
          icon: 'error',
        });
      })
  }

  modified() {
    this.rows = [];
    this.temp = [];
    this.message = 'clickOnsubmit';
  }
  getcolor(code) {
    for (let index = 0; index < this.shifts.length; index++) {
      if (code == 'H') {
        return this.shifts[index].color = 'rgb(252, 136, 124)';
      }
      else if (code == 'W') {
        return this.shifts[index].color = 'rgb(43, 148, 219)';
      }
      else if (this.shifts[index].shortName == code || this.shifts[index].shiftCode == code) {
        return this.shifts[index].color;
      }
    }
  }
  getbgcolor(code) {
    for (let index = 0; index < this.shifts.length; index++) {
      if (code == 'H') {
        return this.shifts[index].bgcolor = 'rgb(255, 255, 255)';
      }
      else if (code == 'W') {
        return this.shifts[index].bgcolor = 'rgb(255, 255, 255)';
      }
      if (this.shifts[index].shortName == code || this.shifts[index].shiftCode == code) {
        return this.shifts[index].bgcolor;
      }
    }
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
    this.rows = this.rows.sort((a, b) => {
      if (a[col] < b[col]) {
        return this.sortOrder === 'asc' ? -1 : 1;
      }
      if (a[col] > b[col]) {
        return this.sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }
  replaceShiftCodeWithName(code) {
    if (code == 'W') {
      if (!this.collection.some(item => item.shift === code)) {
        this.collection.push({
          shift: 'W',
          shiftCode: 'Weekend',
          color: '#2B94DB',
          background: null
        })
      }
      return code
    }
    if (code == 'H') {
      if (!this.collection.some(item => item.shift === code)) {
        this.collection.push({
          shift: 'H',
          shiftCode: 'Holiday',
          color: 'rgb(252, 136, 124)',
          background: null
        })
      }
      return code
    }
    const row = this.shifts.find((x) => x.shiftCode == code);
    if (row?.shortName) {
      if (row?.shortName && !this.collection.some(item => item.shift === row.shortName || item.shift === row.shiftCode)) {
        this.collection.push({
          shift: row.shortName,
          shiftCode: row.shiftCode,
          color: row.color,
          background: row.bgcolor
        })
      }
      return row.shortName.charAt(0)
    }
    else {
      if (row?.shiftCode && !this.collection.some(item => item.shift === row.shortName || item.shift === row.shiftCode)) {
        this.collection.push({
          shift: row.shiftCode,
          shiftCode: row.shiftCode,
          color: row.color,
          background: row.bgcolor,
        })
      }
      return row?.shiftCode.charAt(0)
    }

  }
  resultsPerPage(event) {
    this.config.itemsPerPage = event.target.value == 'all' ? this.temp.length : event.target.value;
    this.config.currentPage = 1;
  }
  pageChanged(event) {
    this.config.currentPage = event;
  }
  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    if (val == '') {
      this.rows = [...this.temp];
    } else {
      const temp = this.temp.filter(function (d) {
        return (d.name && d.name.toLowerCase().indexOf(val) !== -1) ||
          (d.aliasName && d.aliasName.toLowerCase().indexOf(val) !== -1) ||
          (d.code && d.code.toLowerCase().indexOf(val) !== -1) ||
          !val;
      });
      this.rows = temp;
    }
    this.config.totalItems = this.rows.length;
    this.config.currentPage = 1;
    this.utilServ.universalSerchedData = {
      componentName: this.className,
      searchedText: this.searchedFor,
    }
  }
}

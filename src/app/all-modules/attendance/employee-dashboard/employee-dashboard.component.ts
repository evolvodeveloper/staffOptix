import { Component, OnInit, Renderer2 } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';
import { HttpPostService } from 'src/app/services/http-post.service';
import { UtilService } from 'src/app/services/util.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-employee-dashboard',
  templateUrl: './employee-dashboard.component.html',
  styleUrls: ['./employee-dashboard.component.scss']
})
export class EmployeeDashboardComponent implements OnInit {
  leavesClaimed: number;
  dateFormat: string;
  leavesRemaining: number;
  punchInMarked: string;
  totalExpenses: number;
  totalClaimed: number;
  holidayList = [];
  empTimeDetails = [] as any;
  selectedDate: any = moment().format('YYYY-MM-DD');
  selecedYear: number;
  selectedMonth: number;
  yearsArray = [];
  empCode: string;
  empName: string;
  userProfile: any;
  selectedDay: any;
  timeSheet: any;

  otHrs = 0;

  punchInDate: any;
  punchInTime: any;
  effectiveHrs: any;
  regularhrs: any;
  shiftCode: any;
  percentage: any;
  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'determinate';
  value = 0;
  statistics = [];
  constructor(
    private httpGetService: HttpGetService,
    private acRoute: ActivatedRoute,
    private global: GlobalvariablesService,
    private router: Router,
    private httpPost: HttpPostService,
    private spinner: NgxSpinnerService,
    private renderer: Renderer2,
    private utilServ: UtilService,

  ) { }

  getUserProfile() {
    this.userProfile = this.utilServ?.userProfileData;
    this.empName = this.userProfile?.name;
    if (this.utilServ.userProfileData !== undefined) {
      this.empCode = (this.userProfile.employeeCode);
      this.getTimeSheetRecords(this.empCode);
      this.getPunchDetails();

      // if (this.utilServ.userProfileData.image) {
      //   const header = 'data:image/' + this.utilServ.userProfileData.fileType + ';base64,';
      //   this.profilePic = header.concat(this.utilServ.userProfileData.image)
      // }
    }
    else {
      setTimeout(() => {
        this.getUserProfile.call(this);
      });
    }

  }

  ngOnInit() {
    this.getUserProfile.call(this);
    this.getLeaves();
    this.getExpenses();
    this.getUpcomingHolidays();

    this.getTimeSheet();
    this.getTimesheetLogs();
    this.getHrSummary();
  }
  callme() {
    setTimeout(() => {
      this.runTimer();
    }, 1000);
  }
  getTimesheetLogs() {
    this.httpGetService.getMasterList('usertimesheetlogs').subscribe(
      (res: any) => {
        this.utilServ.todayTimeSheetRecord = res.response;
        // this.utilServ.todayTimeSheetRecord = res.response;
        // this.punchInDate = res.response[0].inDate;
        // this.punchInTime = res.response.inTime;
        // this.effectiveHrs = res.response.effectiveHrs;
        // this.regularhrs = res.response.regularhours;
        // this.shiftCode = res.response.shift;
        // this.otHrs = res.response.otHours;
        if (res.response.length > 0) {
          this.callme.call(this);
        }
      },
      (err) => {
        this.spinner.hide();
        console.error(err.error.status.message);
      }
    );
  }
  getHrSummary() {
    this.httpGetService.getMasterList('emp/hourssummary').subscribe(
      (res: any) => {
        const data = res.response
        data.forEach(element => {
          const workedHours1 = this.convertDecimalToHours(element.workedHours);
          element.workHrs = parseFloat(workedHours1).toFixed(2);
          // const work = (parseFloat(workedHours1) / element.workingHours) * 100;
          element.workedHrs = workedHours1;
        });
        this.statistics = data;
      },
      (err) => {
        this.spinner.hide();
        console.error(err.error.status.message);
      }
    );
  }
  convertDecimalToHours(decimalHours) {
    const resultInMinutes = decimalHours ? decimalHours * 60 : 0;
    const h = Math.floor(resultInMinutes / 60);
    const hours = h < 10 ? '0' + h : h;
    const m = Math.floor(resultInMinutes % 60);
    const minutes = m < 10 ? '0' + m : m;

    return `${hours}:${minutes}`;
  }

  getTimeSheetRecords(empCode) {
    this.httpGetService.getMasterList('timesheet/date?empCode=' + empCode + '&date=' + this.selectedDate).subscribe(
      (res: any) => {
        const records = res.response;
        this.dateFormat = this.global.dateFormat
        records.forEach(element => {
          element.totalHours1 = this.convertDecimalToHours(element.totalHours);
        });
        this.empTimeDetails = records
      },
      (err) => {
        console.error('err', err.error.status.message);
        // Swal.fire({
        //   title: 'Error!',
        //   text: err.error.status.message,
        //   icon: 'error',
        //   timer: 3000,
        // });
      }
    );
  }

  goToExpensePage() {
    this.router.navigateByUrl('expenses')
  }
  goToLeavePage() {
    this.router.navigateByUrl('leavehistory')
  }


  getLeaves() {
    this.httpGetService.getMasterList('leave/validate').subscribe((res: any) => {
      this.leavesClaimed = res.response.claimed;
      this.leavesRemaining = res.response.remaining;
    });
  }

  getTimeSheet() {
    this.httpGetService.getMasterList('timesheet').subscribe((res: any) => {
      // // this.utilServ.todayTimeSheetRecord = res.response;
      this.punchInDate = res.response.inDate;
      this.punchInTime = res.response.inTime;
      // // this.effectiveHrs = res.response.effectiveHrs;
      this.regularhrs = res.response.regularhours;
      this.shiftCode = res.response.shift;
      this.otHrs = res.response.otHours;
      // if (res.response.inTime) {
      //   this.callme.call(this);
      // }
    });

    // Example usage
  }
  runTimer() {
    // this.punchInDate = this.utilServ.todayTimeSheetRecord[0].attDate;
    // this.punchInTime = this.utilServ.todayTimeSheetRecord[0].attTime;

    // this.punchInDate = this.utilServ.todayTimeSheetRecord.inDate;
    // this.punchInTime = this.utilServ.todayTimeSheetRecord?.inTime;
    // this.effectiveHrs = res.response.effectiveHrs;
    // this.regularhrs = this.utilServ.todayTimeSheetRecord?.regularhours;
    // this.shiftCode = this.utilServ.todayTimeSheetRecord?.shift;
    // this.otHrs = this.utilServ.todayTimeSheetRecord?.otHours;

    if (this.utilServ.todayTimeSheetRecord.length === 1) {
      this.calculateForOneTimesheetRecord();
    } else {
      let passedRecords = [];
      const Records = this.utilServ.todayTimeSheetRecord.filter(record => record.attStatus === "PASSED").sort((a, b) => a.id - b.id);
      passedRecords = Records
      if (Records.length % 2 !== 0) {

        passedRecords.push({
          "dateCode": Records[Records.length - 1].dateCode,
          "attStatus": "PASSED",
          "attDate": Records[Records.length - 1].attDate,
          "attTime": moment().format('HH:mm:ss'),
          "shift": Records[Records.length - 1].shift,
          "status": 'currentTime',
          "modifyStatus": 'currentTime',
        })
      }
      // const sortTheRecordsById = this.utilServ.todayTimeSheetRecord.sort((a, b) => a.id - b.id);
      const timeDifferences = this.calculateTimeDifferences(passedRecords);
      const sum = timeDifferences.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
      this.effectiveHrs = new Date(sum).toISOString().substr(11, 8);
      const percentage = this.calculatePercentage(this.effectiveHrs, '12:00:00')
      this.percentage = percentage.toFixed(2);
      this.setKeyframes(percentage);
      this.callme();
    }
  }
  calculateTimeDifferences(passedRecords) {
    const timeDifferences = [];
    let lastInTime = null;
    passedRecords.forEach(record => {
      if (record.modifyStatus === "IN") {
        lastInTime = record.attTime;
      } else if (record.modifyStatus === "OUT" && lastInTime) {
        const inTime = moment(`${record.attDate} ${lastInTime}`);
        const outTime = moment(`${record.attDate} ${record.attTime}`);
        const timeDiff = outTime.diff(inTime);

        // const timeDiff = (outTime - inTime) / 1000; // time difference in seconds
        timeDifferences.push(timeDiff);
        lastInTime = null; // reset for the next IN-OUT pair
      }
      else if (record.modifyStatus === "currentTime" && lastInTime) {
        const inTime = moment(`${record.attDate} ${lastInTime}`);
        const outTime = moment(`${record.attDate} ${record.attTime}`);
        const timeDiff = outTime.diff(inTime);
        // const timeDiff = (outTime - inTime) / 1000; // time difference in seconds
        timeDifferences.push(timeDiff);
        lastInTime = null; // reset for the next IN-OUT pair
      }
    });

    return timeDifferences;
  }

  calculateForOneTimesheetRecord() {
    const currentDateTime = moment(); // Current date and time
    if (this.utilServ.todayTimeSheetRecord[0].attDate !== null || this.utilServ.todayTimeSheetRecord[0].attTime !== null) {
      const inDateTime = moment(`${this.utilServ.todayTimeSheetRecord[0].attDate} ${this.utilServ.todayTimeSheetRecord[0].attTime}`); // Combine inDate and inTime
      const timeDifferenceInMilliseconds = currentDateTime.diff(inDateTime);
      const hoursDifference = moment.duration(timeDifferenceInMilliseconds).asHours();
      const milliseconds = hoursDifference * 60 * 60 * 1000;
      this.effectiveHrs = new Date(milliseconds).toISOString().substr(11, 8);
      const percentage = this.calculatePercentage(this.effectiveHrs, '12:00:00')
      this.percentage = percentage.toFixed(2);
      this.setKeyframes(percentage);
      this.callme();
    }
  }

  setKeyframes(degrees) {
    const deg = degrees * (360 / 100)
    const firstHalf = Math.min(deg, 180); // Assign degrees to firstHalf up to 180
    const secondHalf = Math.max(deg - 180, 0); // Assign remaining degrees to secondHalf, ensure it's not negative
    if (secondHalf <= 180) {
      const keyframes = `@keyframes loading-1 {
      0% {
          -webkit-transform: rotate(0deg);
          transform: rotate(0deg);
      }
  
      100% {
          -webkit-transform: rotate(${firstHalf}deg);
          transform: rotate(${firstHalf}deg);
      }
    }
    @keyframes loading-2 {
      0% {
          -webkit-transform: rotate(0deg);
          transform: rotate(0deg);
      }

      100% {
          -webkit-transform: rotate(${secondHalf}deg);
          transform: rotate(${secondHalf}deg);
      }
    }
    
    `;
      const styleEl = this.renderer.createElement('style');
      this.renderer.appendChild(document.head, styleEl);
      this.renderer.appendChild(styleEl, this.renderer.createText(keyframes));
    }
  }
  calculatePercentage(time: string, totalTime: string): number {
    // Convert time and totalTime to seconds
    const timeInSeconds = this.timeToSeconds(time);
    const totalTimeInSeconds = this.timeToSeconds(totalTime);

    // Calculate the percentage
    const percentage = (timeInSeconds / totalTimeInSeconds) * 100;
    return percentage;
  }

  timeToSeconds(time: string): number {
    const [hours, minutes, seconds] = time.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  }


  getExpenses() {
    this.httpGetService.getMasterList('emp/expenses').subscribe((res: any) => {
      this.totalExpenses = res.response.total;
      this.totalClaimed = res.response.claimed;
    });
  }

  getUpcomingHolidays() {
    this.httpGetService.getMasterList('calendarholiday').subscribe((res: any) => {

      res.response.forEach(element => {
        element.day = null;
        const d = new Date(element?.dateCode);
        switch (d.getDay()) {
          case 0:
            element.day = "Sunday";
            break;
          case 1:
            element.day = "Monday";
            break;
          case 2:
            element.day = "Tuesday";
            break;
          case 3:
            element.day = "Wednesday";
            break;
          case 4:
            element.day = "Thursday";
            break;
          case 5:
            element.day = "Friday";
            break;
          case 6:
            element.day = "Saturday";
        }
      });
      this.holidayList = res.response;
    });
  }

  async getPunchDetails() {
    const ip = localStorage?.getItem('Ipaddress');
    await this.httpGetService.getMasterList(
      'employeestatus?employeeCode=' + this.empCode + '&source=web' + '&address=' + ip
    ).subscribe((res: any) => {
      if (res && res.response == 'isNotPresent') {
        this.punchInMarked = 'false';
      }
      if (res && res.response !== 'isNotPresent' && res.response !== 'isPresent') {
        this.punchInMarked = 'not assigned';
      }
      if (res && res.response == 'isPresent') {
        this.punchInMarked = 'true';
      }
    });
  }

  getDateAndTime() {
    const currentDate = new Date();
    // Extract year, month, day, hours, minutes, and seconds
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1; // Months are zero-based
    const day = currentDate.getDate();
    const hours = currentDate.getHours();
    const minutes = currentDate.getMinutes();
    const seconds = currentDate.getSeconds();

    // Format the date and time as strings
    const date = `${year}-${month < 10 ? '0' : ''}${month}-${day < 10 ? '0' : ''}${day}`;
    const time = `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    return {
      date, time
    }
  }
  punchIn() {
    this.spinner.show();
    const getTimeAndDate = this.getDateAndTime();
    if (getTimeAndDate && this.userProfile) {
      const obj = {
        "timesheetdto": {
          "dateCode": getTimeAndDate.date,
          "employeeId": this.userProfile.id,
          "employeeCode": this.userProfile.employeeCode,
          "employeeName": this.userProfile.name,
          "inTime": getTimeAndDate.time,
          'inLocation': localStorage.getItem('Ipaddress'),
          'inDevice': 'system',
          "inDate": getTimeAndDate.date,
        },
        "type": "IN"
      }
      this.httpPost.create('timesheet', obj).subscribe((res: any) => {
        this.spinner.hide();
        if (res.status.message === 'Record Already exist') {
          this.sweetAlert_topEnd('error', 'Attendance already marked');
        }
        else if (res.status.message === 'SUCCESS') {
          this.sweetAlert_topEnd('success', 'Attendance marked');
          this.getTimesheetLogs();
        }
        else {
          this.sweetAlert_topEnd('', res.status.message);
        }
        this.getPunchDetails();
        // this.sweetAlert_topEnd('error', 'In Attendance Marked');

      },
        (err) => {
          console.error(err);
          this.spinner.hide();
          this.sweetAlert_topEnd('error', err.error.status.message);
        })
    }
  }
  punchOut() {
    this.spinner.show();
    const getTimeAndDate = this.getDateAndTime();
    const obj = {
      "timesheetdto": {
        "dateCode": getTimeAndDate.date,
        "employeeId": this.userProfile.id,
        "employeeCode": this.userProfile.employeeCode,
        "employeeName": this.userProfile.username,
        "outTime": getTimeAndDate.time,
        'outLocation': localStorage.getItem('Ipaddress'),
        'outDevice': 'system',
        "outDate": getTimeAndDate.date,
      },
      "type": "OUT"
    }

    this.httpPost.create('timesheet', obj).subscribe((RES: any) => {
      this.spinner.hide();
      if (RES.status.message === 'Record Already exist') {
        this.sweetAlert_topEnd('error', 'Out Attendance already marked');
      }
      else if (RES.status.message === 'SUCCESS') {
        this.getTimesheetLogs();
        this.sweetAlert_topEnd('success', 'Out Attendance Marked');
      }
      else {
        this.sweetAlert_topEnd('', RES.status.message);
      }
      this.getPunchDetails(); 
    },
      (err) => {
        console.error(err);
        this.spinner.hide();
        this.sweetAlert_topEnd('error', err.error.status.message);
      })
  }
  sweetAlert_topEnd(icon, title) {
    Swal.fire({
      // position: 'top-end',
      icon: icon,
      title: title,
      showConfirmButton: false,
      timer: 5000,
    });
  }
}

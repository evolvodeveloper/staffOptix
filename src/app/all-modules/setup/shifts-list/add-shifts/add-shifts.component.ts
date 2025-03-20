import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { canLeaveComponent } from 'src/app/authentication/guards/unsaved-changes.guard';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';
import { HttpPostService } from 'src/app/services/http-post.service';
import { HttpPutService } from 'src/app/services/http-put.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-add-shifts',
  templateUrl: './add-shifts.component.html',
  styleUrls: ['./add-shifts.component.scss'],
  // changeDetection: ChangeDetectionStrategy.Default,
})
export class AddShiftsComponent implements OnInit, canLeaveComponent {
  @Input() public fromParent;
  update = false;
  view = false;
  active = false;
  charLimit: number; reportingTime: any;
  shiftForm: FormGroup;
  timeZones: any = [];
  shiftBreaksArray = [];
  modifyisDefaultRecord: any;
  totalworkHoursPerDay: any;
  totalworkhoursPerWeek: any;
  decimalTimes: any; reportLate: any;
  calenderCodes: any = [];
  shiftHrs = [];
  shiftHasBreaks = false;
  sectionTwo = false;
  breakShift = { startTime: null, endTime: null, startTime2: null, endTime2: null, previous1TimeWrng: false, previous2TimeWrng: false, }

  days = [
    {
      code: 'Mon',
      dayName: 'MONDAY',
      isactive: true,
      startTime: null,
      startTime2: null,
      endTime2: null,
      endTime: null,
      sessionNo: null,
      totalTime: null,
    },
    {
      code: 'Tue',
      dayName: 'TUESDAY',
      isactive: true,
      startTime: null,
      endTime: null,
      startTime2: null,
      endTime2: null,
      sessionNo: null,
      totalTime: null,
    },
    {
      code: 'Wed',
      dayName: 'WEDNESDAY',
      isactive: true,
      startTime: null,
      endTime: null,
      startTime2: null,
      endTime2: null,
      sessionNo: null,
      totalTime: null,
    },
    {
      code: 'Thu',
      dayName: 'THURSDAY',
      isactive: true,
      startTime: null,
      endTime: null,
      startTime2: null,
      endTime2: null,
      sessionNo: null,
      totalTime: null,
    },
    {
      code: 'Fri',
      dayName: 'FRIDAY',
      isactive: true,
      startTime: null,
      endTime: null,
      startTime2: null,
      endTime2: null,
      sessionNo: null,
      totalTime: null,
    },
    {
      code: 'Sat',
      dayName: 'SATURDAY',
      isactive: true,
      startTime: null,
      endTime: null,
      startTime2: null,
      endTime2: null,
      sessionNo: null,
      totalTime: null,
      branchCode: null,
      companyCode: null,
      createdby: null,
      createddate: null,
      lastmodifiedby: null,
      lastmodifieddate: null,
      shiftCode: null,
      shiftId: null,
    },
    {
      code: 'Sun',
      dayName: 'SUNDAY',
      isactive: true,
      startTime: null,
      startTime2: null,
      endTime2: null,
      endTime: null,
      sessionNo: null,
      totalTime: null,
    }
  ];
  weeks = [
    { code: 'MONDAY', name: 'MONDAY' },
    { code: 'TUESDAY', name: 'TUESDAY' },
    { code: 'WEDNESDAY', name: 'WEDNESDAY' },
    { code: 'THURSDAY', name: 'THURSDAY' },
    { code: 'FRIDAY', name: 'FRIDAY' },
    { code: 'SATURDAY', name: 'SATURDAY' },
    { code: 'SUNDAY', name: 'SUNDAY' },
  ];
  timeFrame = [
    { code: 'DAILY', name: 'DAILY' },
    { code: 'WEEKLY', name: 'WEEKLY' },
    { code: 'MONTHLY', name: 'MONTHLY' },
  ];
  modified = false;
  totalSelectedDays: number;
  firstSelectedDayIndex: number;
  time: any;
  labels: any;
  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private httpPut: HttpPutService,
    private httpGet: HttpGetService,
    private httpPost: HttpPostService,
    private spinner: NgxSpinnerService,
    public globalServ: GlobalvariablesService,
    private cd: ChangeDetectorRef
  ) { }
  canLeave(): boolean {
    if (this.shiftForm.dirty) {
      Swal.fire({
        text: 'Oops! you have unsaved changes on this page',
        icon: 'info',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Stay',
        cancelButtonText: 'Leave',
      }).then((result) => {
        if (result.isConfirmed) {
          return true;
        } else if (result.isDismissed) {
          this.shiftForm.reset();
          this.closeModal('');
        }
      })
      return false
    } else {
      return true;
    }
  }



  ngOnInit(): void {
    this.globalServ.getMyCompPlaceHolders('shiftMaster');
    this.shiftForm = this.fb.group({
      shiftCode: [null, [Validators.required, this.httpPost.customValidator()]],
      shortName: [null, [Validators.required, this.httpPost.customValidator()]],
      calendarCode: [null, [Validators.required]],
      timezone: [null, [Validators.required]],
      isDefault: [false],
      workHoursPerDay: [null],
      workhoursPerWeek: [null],
      noOfWorkdaysInWeek: [null],
      graceTimeInHrs: [null],
      reportLateAfterInHrs: [null],
      allowHalfDays: [true],
      minHrsTimeframe: [null],
      minHrsInTimeframe: [null],
      minHrsToMarkHalfDay: [null],
      shiftHasBreaks: [null],
      hasFlexibleWorkhours: [false],
      hasFlexibleWeekends: [false],
      isStrict: [true],
      isactive: [true],
      description: [null],

      minHrsToMarkFullDay: [null],
      weekends: [],

      // workingDays: ['', [Validators.required]],
    });
    this.shiftForm.controls.minHrsTimeframe.disable();
    this.shiftForm.controls.minHrsTimeframe.setValue('DAILY');
    if (this.fromParent?.prop2 == '') {
      this.shiftForm.controls.minHrsTimeframe.setValue(this.timeFrame[0].code)
      this.shiftForm.controls.hasFlexibleWeekends.setValue(false);
      this.shiftForm.controls.hasFlexibleWorkhours.setValue(false);
      this.shiftForm.controls.noOfWorkdaysInWeek.disable();
      this.shiftForm.controls.workHoursPerDay.disable();

      this.shiftForm.controls.shiftHasBreaks.setValue(false);
      this.cd.detectChanges();
      this.charLimit = this.globalServ.charLimitValue;
      this.getFirstandTotalSelectDays();
    }
    else {
      if (this.fromParent.prop1.shiftHasBreaks == true) {
        this.shiftForm.controls.shiftHasBreaks.setValue(true);
        this.cd.detectChanges();
      }
      else {
        this.shiftForm.controls.shiftHasBreaks.setValue(false);
        this.cd.detectChanges();
      }
      if (this.fromParent.prop1.hasFlexibleWeekends == true) {
        // this.shiftForm.controls.weekends.disable();
        this.shiftForm.controls.hasFlexibleWeekends.setValue(true);
        this.cd.detectChanges();
      }
      else {
        // this.shiftForm.controls.weekends.enable();
        this.shiftForm.controls.hasFlexibleWeekends.setValue(false);
        this.cd.detectChanges();
      }
      if (this.fromParent.prop1.hasFlexibleWorkhours == true) {
        // this.shiftForm.controls.weekends.disable();
        this.shiftForm.controls.hasFlexibleWorkhours.setValue(true);
        this.shiftForm.controls.workHoursPerDay.enable();
        this.cd.detectChanges();
      }
      else {
        // this.shiftForm.controls.weekends.enable();
        this.shiftForm.controls.workHoursPerDay.disable();
        this.shiftForm.controls.hasFlexibleWorkhours.setValue(false);
        this.cd.detectChanges();
      }
    }
    this.getTimezones();
    this.getCalenderCodes();
    this.init();
    // this.shiftForm.controls.noOfWorkdaysInWeek.disable();
    this.shiftForm.controls.workhoursPerWeek.disable();
    // this.shiftForm.controls.workHoursPerDay.disable();
    const branchCode = (localStorage.getItem('branchCode'))
    const branchList = JSON.parse(localStorage.getItem('branch'))
    const row = branchList.find(x => x.branchCode == branchCode)
    if (row) {
      this.shiftForm.controls.timezone.setValue(row.timezone)
    }
  }
  init() {
    if (this.fromParent?.prop2 == 'view') {
      // this.getShiftHrs();
      const num = this.fromParent.prop1.graceTimeInHrs;
      this.convertDecimaltoTime(num);
      this.convertDecimaltoTimereporting(this.fromParent.prop1.reportLateAfterInHrs);

      this.shiftForm.disable();
      this.update = false;
      this.view = true;
      this.shiftForm.controls.shiftCode.setValue(
        this.fromParent.prop1.shiftCode
      );

      this.shiftForm.controls.shortName.setValue(
        this.fromParent.prop1.shortName
      );
      this.shiftForm.controls.shiftHasBreaks.setValue(
        this.fromParent.prop1.shiftHasBreaks
      );

      this.shiftForm.controls.description.setValue(
        this.fromParent.prop1.description
      );
      this.shiftForm.controls.reportLateAfterInHrs.setValue(this.reportingTime)

      this.shiftForm.controls.timezone.setValue(this.fromParent.prop1.timezone);
      this.shiftForm.controls.timezone.setValue(this.fromParent.prop1.timezone);
      // this.shiftForm.controls.reportLateAfterInHrs.setValue(
      //   this.fromParent.prop1.reportLateAfterInHrs
      // );
      this.shiftForm.controls.allowHalfDays.setValue(
        this.fromParent.prop1.allowHalfDays
      );
      this.shiftForm.controls.hasFlexibleWorkhours.setValue(
        this.fromParent.prop1.hasFlexibleWorkhours
      );

      this.shiftForm.controls.minHrsToMarkFullDay.setValue(
        this.fromParent.prop1.minHrsToMarkFullDay
      );
      this.shiftForm.controls.minHrsToMarkHalfDay.setValue(
        this.fromParent.prop1.minHrsToMarkHalfDay
      );
      this.shiftForm.controls.workhoursPerWeek.setValue(
        this.fromParent.prop1.workhoursPerWeek
      );
      this.shiftForm.controls.workHoursPerDay.setValue(
        this.fromParent.prop1.workhoursPerDay
      );
      this.shiftForm.controls.calendarCode.setValue(
        this.fromParent.prop1.calendarCode
      );
      this.shiftForm.controls.graceTimeInHrs.setValue(this.time
      );
      this.shiftForm.controls.isDefault.setValue(
        this.fromParent.prop1.isdefault
      );
      this.shiftForm.controls.isStrict.setValue(
        this.fromParent.prop1.isStrict
      );
      this.shiftForm.controls.isactive.setValue(
        this.fromParent.prop1.isactive
      );
      this.shiftForm.controls.minHrsInTimeframe.setValue(
        this.fromParent.prop1.minHrsInTimeframe
      );
      this.shiftForm.controls.minHrsTimeframe.setValue(
        this.fromParent.prop1.minHrsTimeframe
      );
      if (this.fromParent.prop1.weekends !== '') {

        this.shiftForm.controls.weekends.setValue(
          this.fromParent.prop1.weekends?.split(',')
        );
      }
      this.getShiftHrs(this.fromParent.prop1.shiftCode)
      this.changeWeekends(this.fromParent.prop1.weekends?.split(','))
      this.breaKShift(); this.weekendquestion();
      this.workhoursquestion();
    } else if (this.fromParent?.prop2 == 'edit') {
      this.shiftForm.enable();
      const num = this.fromParent.prop1.graceTimeInHrs;
      this.convertDecimaltoTime(num);
      this.convertDecimaltoTimereporting(this.fromParent.prop1.reportLateAfterInHrs);


      this.update = true;
      this.view = false;
      this.shiftForm.controls.shiftCode.setValue(
        this.fromParent.prop1.shiftCode
      );
      this.shiftForm.controls.shortName.setValue(
        this.fromParent.prop1.shortName
      );
      this.shiftForm.controls.shiftHasBreaks.setValue(
        this.fromParent.prop1.shiftHasBreaks
      );
      this.shiftForm.controls.description.setValue(
        this.fromParent.prop1.description
      );
      this.shiftForm.controls.hasFlexibleWorkhours.setValue(
        this.fromParent.prop1.hasFlexibleWorkhours
      );
      this.shiftForm.controls.workhoursPerWeek.setValue(
        this.fromParent.prop1.workhoursPerWeek
      );
      this.shiftForm.controls.workHoursPerDay.setValue(
        this.fromParent.prop1.workhoursPerDay
      );
      this.shiftForm.controls.noOfWorkdaysInWeek.setValue(
        this.fromParent.prop1.noOfWorkdaysInWeek
      );
      if (this.fromParent.prop1.weekends !== '') {

        this.shiftForm.controls.weekends.setValue(
          this.fromParent.prop1.weekends?.split(',')
        );
      }
      this.shiftForm.controls.isStrict.setValue(
        this.fromParent.prop1.isStrict
      );
      this.shiftForm.controls.isactive.setValue(
        this.fromParent.prop1.isactive
      );
      this.shiftForm.controls.workhoursPerWeek.setValue(
        this.fromParent.prop1.workhoursPerWeek
      );
      this.shiftForm.controls.timezone.setValue(this.fromParent.prop1.timezone);
      this.shiftForm.controls.timezone.setValue(this.fromParent.prop1.timezone);
      this.shiftForm.controls.reportLateAfterInHrs.setValue(this.reportingTime)
      this.shiftForm.controls.allowHalfDays.setValue(
        this.fromParent.prop1.allowHalfDays
      );
      this.shiftForm.controls.minHrsToMarkFullDay.setValue(
        this.fromParent.prop1.minHrsToMarkFullDay
      );
      this.shiftForm.controls.minHrsToMarkHalfDay.setValue(
        this.fromParent.prop1.minHrsToMarkHalfDay
      );
      this.shiftForm.controls.calendarCode.setValue(
        this.fromParent.prop1.calendarCode
      );
      this.shiftForm.controls.graceTimeInHrs.setValue(this.time);
      this.shiftForm.controls.isDefault.setValue(
        this.fromParent.prop1.isdefault
      );

      this.shiftForm.controls.minHrsInTimeframe.setValue(
        this.fromParent.prop1.minHrsInTimeframe
      );
      this.shiftForm.controls.minHrsTimeframe.setValue(
        this.fromParent.prop1.minHrsTimeframe
      );
      this.getShiftHrs(this.fromParent.prop1.shiftCode)
      this.shiftForm.controls.shiftCode.disable();
      this.changeWeekends(this.fromParent.prop1.weekends?.split(','));
      this.breaKShift(); this.weekendquestion();
      this.workhoursquestion();
      this.shiftForm.controls.minHrsTimeframe.disable();
    }
  }
  convertDecimaltoTime(num) {
    const decimalTime = parseFloat(num);
    this.time = Math.floor(decimalTime * 60);
  }
  convertDecimaltoTimereporting(num) {
    const decimalTime = parseFloat(num);
    this.reportingTime = Math.floor(decimalTime * 60);
  }
  minHrsPerDay() {
    if (this.shiftForm.controls.minHrsInTimeframe.value > 23) {
      this.shiftForm.controls.minHrsInTimeframe.setValue(0);
      this.shiftForm.controls.minHrsInTimeframe.markAsDirty();
    }
  }
  minHrsToMarkHalfDay() {
    if (this.shiftForm.controls.minHrsToMarkHalfDay.value > 23) {
      this.shiftForm.controls.minHrsToMarkHalfDay.setValue(0);
      this.shiftForm.controls.minHrsToMarkHalfDay.markAsDirty();
    }
  }
  getShiftHrs(shiftCode) {
    this.httpGet.getMasterList('sfthour?shiftcode=' + shiftCode).subscribe(
      (res: any) => {
        this.shiftHrs = res.response;

        if (this.fromParent?.prop1) {
          const listOfShifts = res.response.filter(
            (x) => x.shiftCode == this.fromParent?.prop1.shiftCode
          );
          listOfShifts.forEach((x) => {
            this.days.find((a) => {
              if (a.dayName.toLowerCase() === x.dayName.toLowerCase() && x.sessionNo == 1) {
                (a.startTime = x.startTime), (a.endTime = x.endTime);
                (a.branchCode = x.branchCode),
                  (a.companyCode = x.companyCode),
                  (a.isactive = x.isactive),
                  (a.createdby = x.createdby),
                  a.sessionNo = x.sessionNo,
                  (a.createddate = x.createddate),
                  (a.lastmodifiedby = x.lastmodifiedby),
                  (a.lastmodifieddate = x.lastmodifieddate),
                  (a.shiftCode = x.shiftCode),
                  (a.shiftId = x.shiftId);
                a.totalTime = this.timechage(x)

              }
            });
          });
          if (this.fromParent?.prop1.shiftHasBreaks == true) {
            const index = this.shiftHrs.find((x) => x.isactive == true)
            const rows = this.shiftHrs.filter(x => x.dayName == index.dayName)
            rows.forEach(element => {
              if (element.sessionNo == 1) {
                this.breakShift.startTime = element.startTime,
                  this.breakShift.endTime = element.endTime
              }
              else if (element.sessionNo == 2) {
                this.breakShift.startTime2 = element.startTime,
                  this.breakShift.endTime2 = element.endTime
              }
            });
            this.days.forEach((x) => {
              x.startTime2 = this.breakShift.startTime2,
                x.endTime2 = this.breakShift.endTime2
              x.endTime = this.breakShift.endTime
              x.startTime = this.breakShift.startTime
              x.totalTime = this.addTimeOfBreakShift(x)

            })
          }
        }
        // }
        this.getFirstandTotalSelectDays();
      }
    );
  }
  getTimezones() {
    this.httpGet.timeZone().subscribe(
      (res: any) => {
        this.timeZones = res.response;
      }
    );
  }

  getCalenderCodes() {
    this.httpGet.getCalenderCodes().subscribe(
      (res: any) => {
        this.calenderCodes = res.response;
        if (res.response.length > 0) {
          if (this.fromParent?.prop2 == '') {
            const row = res.response.find(ele => ele.isDefault == true);
            this.shiftForm.controls.calendarCode.setValue(row.calendarCode)
          }
        } else {
          this.shiftForm.controls.calendarCode.setValue(res.response[0]?.calendarCode)
        }
      }
    );
  }

  copyToAll(day) {
    let totalTime: string;
    this.days.forEach((d) => {
      d.startTime = day.startTime;
      d.endTime = day.endTime;
      d.totalTime = this.timechage(d);
      totalTime = this.timechage(d);
    });
    const total = this.getTotalHrsInaWeek();
    if (!this.shiftForm.controls.hasFlexibleWorkhours.value) {
      this.totalworkHoursPerDay = (totalTime);
      this.totalworkhoursPerWeek = (total);
      this.shiftForm.controls.workhoursPerWeek.setValue(total)
      this.shiftForm.controls.workHoursPerDay.setValue(totalTime)
    } else {
      this.totalworkHoursPerDay = (this.shiftForm.controls.workHoursPerDay.value);
      this.totalworkhoursPerWeek = (this.shiftForm.controls.workhoursPerWeek.value);
      // this.shiftForm.controls.workhoursPerWeek.setValue(total)
      // this.shiftForm.controls.workHoursPerDay.setValue(totalTime)
    }
  }
  changedTime() {
    this.modified = true;
  }
  breakShiftYes(breakShift) {
    const step2 = breakShift.startTime2 !== null ?
      (breakShift.startTime2 > breakShift.endTime ? breakShift.previous2TimeWrng = false : breakShift.previous2TimeWrng = true)
      : ''
    if (breakShift.previous2TimeWrng == false && breakShift.startTime !== null && breakShift.endTime !== null
      && breakShift.startTime2 !== null && breakShift.endTime2 !== null) {
      this.addTimeOfBreakShift(breakShift);
    }
  }
  addTimeOfBreakShift(record) {
    if (record.startTime && record.endTime && record.startTime2 && record.endTime2) {
      const startTime1: any = new Date(`2023-10-17T${record.startTime}`);
      const endTime1: any = new Date(`2023-10-17T${record.endTime}`);
      const startTime2: any = new Date(`2023-10-17T${record.startTime2}`);
      const endTime2: any = new Date(`2023-10-17T${record.endTime2}`);

      // Calculate the time differences in milliseconds
      const difference1 = endTime1 - startTime1;
      const difference2 = endTime2 - startTime2;
      // Calculate the total time in milliseconds
      const totalMilliseconds = difference1 + difference2;
      let totalHours1 = Math.floor(totalMilliseconds / (1000 * 60 * 60));
      let totalMinutes1 = Math.floor((totalMilliseconds / (1000 * 60)) % 60);
      if (totalHours1 < 0) {
        totalHours1 = 23 + totalHours1
      }
      if (totalMinutes1 < 0) {
        totalMinutes1 = 59 + totalMinutes1
      }

      const totalTime1 = `${totalHours1 < 10 ? '0' : ''}${totalHours1}.${totalMinutes1 < 10 ? '0' : ''}${totalMinutes1}`;
      record.totalTime = totalTime1
      this.days.forEach((d) => {
        d.startTime = record.startTime;
        d.endTime = record.endTime;
        d.startTime2 = record.startTime2;
        d.endTime2 = record.endTime2;
        d.totalTime = record.totalTime
      });
      const total = this.getTotalHrsInaWeek();
      if (!this.shiftForm.controls.hasFlexibleWorkhours.value) {
        this.totalworkHoursPerDay = totalTime1;
        this.shiftForm.controls.workHoursPerDay.setValue(totalTime1);
        this.totalworkhoursPerWeek = (total);
        this.shiftForm.controls.workhoursPerWeek.setValue(total)
        this.shiftForm.controls.workHoursPerDay.setValue(totalTime1)
      } else {
        this.totalworkHoursPerDay = (this.shiftForm.controls.workHoursPerDay.value);
        this.totalworkhoursPerWeek = (this.shiftForm.controls.workhoursPerWeek.value);
        // this.shiftForm.controls.workhoursPerWeek.setValue(total)
        // this.shiftForm.controls.workHoursPerDay.setValue(totalTime)
      }

    }
  }

  timechage(day) {
    if (day.startTime !== null && day.endTime !== null) {
      // Parse the start and end times
      const [startHour, startMinute] = day.startTime.split(':').map(Number);
      const [endHour, endMinute] = day.endTime.split(':').map(Number);
      // Calculate the time difference
      let hours = endHour - startHour;
      let minutes = endMinute - startMinute;

      if (hours < 0) {
        hours += 24;
      }

      if (minutes < 0) {
        hours--;
        minutes += 60;
      }
      const totalTime = `${hours}.${minutes < 10 ? '0' : ''}${minutes}`;
      day.totalTime = totalTime;
      return totalTime;

    }

  }

  getTotalHrsInaWeek() {
    let totalHours = 0;
    let totalMinutes = 0;
    this.days.forEach((item) => {
      if (item.totalTime && item.isactive) {
        const [hours, minutes] = item.totalTime.split('.').map(Number);
        totalHours += hours;
        totalMinutes += minutes;
        // totalsec += sec
      }
    });

    // Adjust for minutes exceeding 60
    totalHours += Math.floor(totalMinutes / 60);
    totalMinutes %= 60;
    // totalsec %= 60;
    return `${totalHours}.${totalMinutes < 10 ? '0' : ''}${totalMinutes}`;
  }


  changeWeekends(val) {
    for (const day of this.days) {
      day.isactive = val?.includes(day.dayName) ? false : true;
    }
    this.getFirstandTotalSelectDays();
    this.multiplyWorkdaysHrsPDayWeek();
  }

  changeWorkingDays(day) {

    day.isactive = !day.isactive;
    // this.shiftForm.controls.weekends.value.push(day);
    // this.cd.detectChanges();
    this.getFirstandTotalSelectDays();
  }
  getFirstandTotalSelectDays() {
    // if(this.update)
    this.firstSelectedDayIndex = null;
    this.totalSelectedDays = 0;

    this.days.forEach((d, i) => {
      if (d.isactive) {
        this.totalSelectedDays++;
      }
      if (d.isactive && this.firstSelectedDayIndex == null) {
        this.firstSelectedDayIndex = i;
      }
    });
    this.shiftForm.controls.noOfWorkdaysInWeek.setValue(this.totalSelectedDays)
    const total = this.getTotalHrsInaWeek();
    if (!this.shiftForm.controls.hasFlexibleWorkhours.value) {
      this.totalworkhoursPerWeek = (total);
    }
    else {
      this.totalworkhoursPerWeek = (this.shiftForm.controls.workhoursPerWeek.value);

    }
    // this.shiftForm.controls.workhoursPerWeek.setValue(total)
  }
  breaKShift() {
    this.cd.detectChanges();
    if (this.shiftForm.controls.shiftHasBreaks.value === false) {
      this.sectionTwo = false;
    }
    if (this.shiftForm.controls.shiftHasBreaks.value === true) {
      this.sectionTwo = true;
    }
  }
  weekendquestion() {
    if (this.shiftForm.controls.hasFlexibleWeekends.value && !this.view) {
      this.shiftForm.controls.noOfWorkdaysInWeek.setValue(7)
      this.shiftForm.controls.noOfWorkdaysInWeek.enable();
      this.shiftForm.controls.workhoursPerWeek.disable();
      this.shiftForm.controls.weekends.reset();
      // this.shiftForm.controls.weekends.disable();
    }
    if (!this.shiftForm.controls.hasFlexibleWeekends.value && !this.view) {
      this.shiftForm.controls.noOfWorkdaysInWeek.setValue(7)
      this.shiftForm.controls.noOfWorkdaysInWeek.disable();
      this.shiftForm.controls.workhoursPerWeek.disable();
      // this.shiftForm.controls.weekends.reset();
      // this.shiftForm.controls.weekends.enable();
    }
    this.changeWeekends(this.shiftForm.controls.weekends.value)
  }
  workhoursquestion() {
    if (this.shiftForm.controls.hasFlexibleWorkhours.value && !this.view) {
      this.shiftForm.controls.workHoursPerDay.enable();
    }
    if (!this.shiftForm.controls.hasFlexibleWorkhours.value && !this.view) {
      this.shiftForm.controls.workHoursPerDay.disable();
      this.days.forEach(x => {
        this.timechage(x);
      })
    }
  }
  putOnly7() {
    if (this.shiftForm.controls.noOfWorkdaysInWeek.value > 7) {
      this.shiftForm.controls.noOfWorkdaysInWeek.setValue(7)
    }
  }
  multiplyWorkdaysHrsPDayWeek() {
    const whrs = this.shiftForm.controls.workHoursPerDay.value;
    const wholeHours = Math.floor(whrs);
    const decimalPart = Math.floor((whrs - wholeHours) * 100);
    const minutes = Math.min(decimalPart, 59);
    const hrs = wholeHours + minutes / 100;
    if (hrs !== this.shiftForm.controls.workHoursPerDay.value) {
      this.shiftForm.controls.workHoursPerDay.setValue(hrs);
    }
    if (this.shiftForm.controls.workHoursPerDay.value <= 23.59) {
      const a = this.shiftForm.controls.workHoursPerDay.value == '' ? 0 : this.shiftForm.controls.workHoursPerDay.value
      const b = this.shiftForm.controls.noOfWorkdaysInWeek.value == null ? 0 : this.shiftForm.controls.noOfWorkdaysInWeek.value
      const c = a * b
      const totalMinutes = Math.floor(c * 60);
      let hours = Math.floor(totalMinutes / 60);
      let minutes = totalMinutes % 60;
      if (minutes > 59) {
        hours += 1;
        minutes -= 60;
      }
      this.shiftForm.controls.workhoursPerWeek.setValue(hours + '.' + minutes);
      this.totalworkhoursPerWeek = (this.shiftForm.controls.workhoursPerWeek.value);
      this.totalworkHoursPerDay = (this.shiftForm.controls.workHoursPerDay.value);
    }
    else {
      this.shiftForm.controls.workHoursPerDay.setValue(0.00)
    }
  }
  TimeConverter(time) {
    if (time == '') {
      this.shiftForm.controls.graceTimeInHrs.setValue(0);
      this.decimalTimes = 0;
    } else {
      const value = time / 60;
      this.decimalTimes = value.toFixed(2);
      // const [h, m] = time.split(':');
      // const value = +h + +m / 60;
      // this.decimalTimes = value.toFixed(2);
    }
  }

  reportLateAfterInHrs(time) {
    if (time == '') {
      this.shiftForm.controls.reportLateAfterInHrs.setValue(0);
      this.reportLate = 0;
    } else {
      const value1 = time / 60;
      this.reportLate = value1.toFixed(2);
    }
  }
  closeModal(sendData) {
    this.activeModal.close(sendData);
  }

  saveShift() {
    this.spinner.show();
    this.shiftForm.get('shiftCode').setValue(this.globalServ.checkAndRemoveSpecialCharacters(this.shiftForm.controls.shiftCode.value), { emitEvent: false });

    const shift_hours = [];
    let Weekend_string = '';
    this.shiftForm.controls.graceTimeInHrs.setValue(this.decimalTimes);
    this.shiftForm.controls.reportLateAfterInHrs.setValue(this.reportLate);
    this.shiftForm.controls.noOfWorkdaysInWeek.setValue(this.totalSelectedDays)
    const weekendsList: any = this.shiftForm.controls.weekends.value
    if (weekendsList) {
      weekendsList?.forEach((t, index) => {
        Weekend_string += t;
        if (index != weekendsList.length - 1) {
          Weekend_string += ',';
        }
      });
    }
    if (this.shiftForm.controls.shiftHasBreaks.value == true) {
      this.days.forEach((d) => {
        if (d.startTime && d.endTime) {
          shift_hours.push({
            dayName: d.dayName,
            sessionNo: '1',
            startTime: moment(d.startTime, 'HH:mm').format('HH:mm:ss'),
            endTime: moment(d.endTime, 'HH:mm').format('HH:mm:ss'),
            isactive: d.isactive,
          });
        }
        if (d.startTime2 && d.endTime2) {
          shift_hours.push({
            dayName: d.dayName,
            sessionNo: '2',
            startTime: moment(d.startTime2, 'HH:mm').format('HH:mm:ss'),
            endTime: moment(d.endTime2, 'HH:mm').format('HH:mm:ss'),
            isactive: d.isactive,
          });
        }
      });
    }
    else {
      this.days.forEach((d) => {
        if (d.startTime && d.endTime) {
          shift_hours.push({
            dayName: d.dayName,
            sessionNo: '1',
            startTime: moment(d.startTime, 'HH:mm').format('HH:mm:ss'),
            endTime: moment(d.endTime, 'HH:mm').format('HH:mm:ss'),
            isactive: d.isactive,
          });
        }
      });
    }
    const req = this.shiftForm.value;
    req.shortName = this.shiftForm.controls.shortName.value.toUpperCase(),

      req.minHrsToMarkHalfDay =
      this.shiftForm.value.allowHalfDays == true
        ? this.shiftForm.value.minHrsToMarkHalfDay
        : null;

    req.isStrict =
      this.shiftForm.controls.isStrict.value == null
        ? false
        : this.shiftForm.controls.isStrict.value,
      req.isactive =
      this.shiftForm.controls.isactive.value == null
        ? false
        : this.shiftForm.controls.isactive.value,
      req.weekends = Weekend_string
    req.workhoursPerWeek = this.shiftForm.controls.workhoursPerWeek.value,
      req.workhoursPerDay = this.shiftForm.controls.workHoursPerDay.value,
      req.noOfWorkdaysInWeek = this.totalSelectedDays;
    req.minHrsTimeframe = 'DAILY',
      req.isdefault =
      this.shiftForm.controls.isDefault.value == null
        ? false
        : this.shiftForm.controls.isDefault.value,
      req.hasFlexibleWeekends = this.shiftForm.controls.hasFlexibleWeekends.value == null ? false : this.shiftForm.controls.hasFlexibleWeekends.value,
      req.hasFlexibleWorkhours = this.shiftForm.controls.hasFlexibleWorkhours.value == null ? false : this.shiftForm.controls.hasFlexibleWorkhours.value,
      req.shiftCode = this.shiftForm.controls.shiftCode.value.trim();
    const obj = {
      shiftMaster: this.shiftForm.value,
      shiftHours: shift_hours,
    };
    if (obj.shiftHours.length !== 0) {
      this.httpPost.saveShift(JSON.stringify(obj)).subscribe((res: any) => {
        this.spinner.hide();
        if (res.status.message == 'SUCCESS') {
          if (this.modifyisDefaultRecord) {
            this.updateIsDefaultRecord();
          } else {
            this.activeModal.close();
          }
          this.sweetAlert('success', 'Shift Saved!');
        }
        else {
          Swal.fire({
            icon: 'warning',
            title: res.status.message,
            showConfirmButton: true,
          });
        }
      }, (err) => {
        this.spinner.hide();
        this.sweetAlert('error', err.error.status.message);
      });
    }
    else {
      this.spinner.hide();
      Swal.fire({
        icon: 'info',
        title: 'Please Enter Working Hours ',
        showConfirmButton: true,
        // timer: 1500,
      });
    }
  }

  sweetAlert(icon, title) {
    Swal.fire({
      icon: icon,
      title: title,
      showConfirmButton: true,
      // timer: 1500,
    });
  }

  Update() {
    this.spinner.show();
    this.shiftForm.get('shiftCode').setValue(this.globalServ.checkAndRemoveSpecialCharacters(this.shiftForm.controls.shiftCode.value), { emitEvent: false });
    this.TimeConverter(this.shiftForm.controls.graceTimeInHrs.value);
    this.reportLateAfterInHrs(this.shiftForm.controls.reportLateAfterInHrs.value);
    this.decimalTimes = parseFloat(this.decimalTimes);
    this.shiftForm.controls.graceTimeInHrs.setValue(this.decimalTimes);
    this.reportLate = parseFloat(this.reportLate);
    this.shiftForm.controls.reportLateAfterInHrs.setValue(this.reportLate);

    const shift_hours = [];
    let Weekend_string = '';
    const weekendsList: any = this.shiftForm.controls.weekends.value
    if (weekendsList) {

      weekendsList?.forEach((t, index) => {
        Weekend_string += t;
        if (index != weekendsList.length - 1) {
          Weekend_string += ',';
        }
      });
    }

    if (this.shiftForm.controls.shiftHasBreaks.value == true) {
      if (this.shiftHrs.length > 7) {
        this.shiftHrs.forEach((d) => {
          if (d.sessionNo == 1) {
            shift_hours.push({
              branchCode: d.branchCode,
              companyCode: d.companyCode,
              createdby: d.createdby,
              createddate: d.createddate,
              dayName: d.dayName,
              isOvernight: d.isOvernight,
              isactive: this.shiftForm.controls.weekends.value?.includes(d.dayName) ? false : true,
              lastmodifiedby: d.lastmodifiedby,
              lastmodifieddate: d.lastmodifieddate,
              sessionNo: d.sessionNo,
              shiftCode: d.shiftCode,
              shiftId: d.shiftId,
              weekDay: d.weekDay,
              startTime: moment(this.breakShift.startTime, 'HH:mm').format('HH:mm:ss'),
              endTime: moment(this.breakShift.endTime, 'HH:mm').format('HH:mm:ss'),
            });
          }
          if (d.sessionNo == 2) {
            shift_hours.push({
              branchCode: d.branchCode,
              companyCode: d.companyCode,
              createdby: d.createdby,
              createddate: d.createddate,
              dayName: d.dayName,
              isOvernight: d.isOvernight,
              isactive: this.shiftForm.controls.weekends.value?.includes(d.dayName) ? false : true,
              lastmodifiedby: d.lastmodifiedby,
              lastmodifieddate: d.lastmodifieddate,
              sessionNo: d.sessionNo,
              shiftCode: d.shiftCode,
              shiftId: d.shiftId,
              weekDay: d.weekDay,
              startTime: moment(this.breakShift.startTime2, 'HH:mm').format('HH:mm:ss'),
              endTime: moment(this.breakShift.endTime2, 'HH:mm').format('HH:mm:ss'),
            });
          }
        });
      }
      else {
        this.days.forEach((d) => {
          if (d.startTime && d.endTime) {
            shift_hours.push({
              dayName: d.dayName,
              sessionNo: 1,
              startTime: moment(d.startTime, 'HH:mm').format('HH:mm:ss'),
              endTime: moment(d.endTime, 'HH:mm').format('HH:mm:ss'),
              isactive: d.isactive,
              branchCode: d.branchCode,
              companyCode: d.companyCode,
              createdby: d.createdby,
              createddate: d.createddate,
              lastmodifiedby: d.lastmodifiedby,
              lastmodifieddate: d.lastmodifieddate,
              shiftCode: d.shiftCode,
              shiftId: d.shiftId,
            });
          }
          if (d.startTime2 && d.endTime2) {
            shift_hours.push({
              dayName: d.dayName,
              sessionNo: 2,
              startTime: moment(d.startTime2, 'HH:mm').format('HH:mm:ss'),
              endTime: moment(d.endTime2, 'HH:mm').format('HH:mm:ss'),
              isactive: d.isactive,
            });
          }
        });
      }
    } else {
      this.days.forEach((d) => {
        if (d.startTime && d.endTime) {
          shift_hours.push({
            dayName: d.dayName,
            startTime: moment(d.startTime, 'HH:mm').format('HH:mm:ss'),
            endTime: moment(d.endTime, 'HH:mm').format('HH:mm:ss'),
            isactive: d.isactive,
            sessionNo: 1,
            branchCode: d.branchCode,
            companyCode: d.companyCode,
            createdby: d.createdby,
            createddate: d.createddate,
            lastmodifiedby: d.lastmodifiedby,
            lastmodifieddate: d.lastmodifieddate,
            shiftCode: d.shiftCode,
            shiftId: d.shiftId,
          });
        }
      });
    }
    const obj = {
      shiftMaster: {
        shiftId: this.fromParent.prop1.shiftId,
        shiftCode: this.shiftForm.controls.shiftCode.value.trim(),
        shortName: this.shiftForm.controls.shortName.value.toUpperCase(),
        calendarCode: this.shiftForm.controls.calendarCode.value,
        timezone: this.shiftForm.controls.timezone.value,
        // workhoursPerWeek: this.shiftForm.controls.workhoursPerWeek.value,
        // noOfWorkdaysInWeek: this.shiftForm.controls.noOfWorkdaysInWeek.value,
        workhoursPerWeek: this.shiftForm.controls.workhoursPerWeek.value,
        workhoursPerDay: this.shiftForm.controls.workHoursPerDay.value,
        noOfWorkdaysInWeek: this.totalSelectedDays,
        shiftHasBreaks: this.shiftForm.controls.shiftHasBreaks.value,
        graceTimeInHrs: this.decimalTimes,
        minHrsInTimeframe:
          this.shiftForm.controls.minHrsInTimeframe.value,
        minHrsTimeframe: 'DAILY',
        reportLateAfterInHrs:
          this.shiftForm.controls.reportLateAfterInHrs.value,
        allowHalfDays:
          this.shiftForm.controls.allowHalfDays.value == null
            ? false
            : this.shiftForm.controls.allowHalfDays.value,
        minHrsToMarkFullDay: this.shiftForm.controls.minHrsToMarkFullDay.value,
        minHrsToMarkHalfDay: this.shiftForm.controls.minHrsToMarkHalfDay.value,
        hasFlexibleWeekends: this.shiftForm.controls.hasFlexibleWeekends.value == null ? false : this.shiftForm.controls.hasFlexibleWeekends.value,
        hasFlexibleWorkhours: this.shiftForm.controls.hasFlexibleWorkhours.value == null ? false : this.shiftForm.controls.hasFlexibleWorkhours.value,
        weekends: Weekend_string,
        branchCode: this.fromParent.prop1.branchCode,
        companyCode: this.fromParent.prop1.companyCode,
        isStrict:
          this.shiftForm.controls.isStrict.value == null
            ? false
            : this.shiftForm.controls.isStrict.value,
        isactive:
          this.shiftForm.controls.isactive.value == null
            ? false
            : this.shiftForm.controls.isactive.value,
        isdefault:
          this.shiftForm.controls.isDefault.value == null
            ? false
            : this.shiftForm.controls.isDefault.value,
      },
      shiftHours: shift_hours,
    };
    this.httpPut.doPut('shiftReq', JSON.stringify(obj)).subscribe((res) => {
      this.spinner.hide();
      if (res.status.message == 'SUCCESS') {
        if (this.modifyisDefaultRecord) {
          this.updateIsDefaultRecord();
        } else {
          this.activeModal.close();
        }
        this.sweetAlert('success', 'Shift Updated!');
      }
      else {
        Swal.fire({
          icon: 'warning',
          title: res.status.message,
          showConfirmButton: true,
        });
      }
    }, (err) => {
      this.spinner.hide();
      this.sweetAlert('error', err.error.status.message);
    });
  }


  checkDefault() {
    const row = this.fromParent.prop3.find(x => x.isdefault == true);
    if (row) {
      if (row.shiftCode !== this.shiftForm.controls.shiftCode.value) {
        if (this.shiftForm.controls.isDefault.value) {
          if (this.shiftForm.controls.shiftCode.value !== null) {
            if (row) {
              Swal.fire({
                title: 'Are you sure?',
                html:
                  'Do you want to change the default shift code from ' + '<br><b>' + row?.shiftCode + '</b>' +
                  ' to <b>' + this.shiftForm.controls.shiftCode.value + '</b> ? ',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes',
                allowOutsideClick: false,
              }).then((result) => {
                if (result.isConfirmed) {
                  this.modifyisDefaultRecord = row
                }
                else {
                  this.shiftForm.controls.isDefault.setValue(false);
                }
              })
            }
          } else {
            Swal.fire({
              icon: 'warning',
              text: 'Enter Shift Name',
              showConfirmButton: true,
            });
            this.shiftForm.controls.isDefault.setValue(false);
          }
        }
        else {
          this.modifyisDefaultRecord = null;
        }
      } else {
        const rows = this.fromParent.prop3.filter(x => x.isdefault == true);
        if (rows.length > 1) {
          this.shiftForm.controls.isDefault.setValue(false);
        } else {
          Swal.fire({
            icon: 'warning',
            text: 'We required one shift as isDefault',
            showConfirmButton: true,
          });
          this.shiftForm.controls.isDefault.setValue(true);
        }
      }
    }
  }

  updateIsDefaultRecord() {
    const req = this.modifyisDefaultRecord;
    req.isdefault = false;
    this.httpPut.doPut('shift', req).subscribe((res: any) => {
      if (res.status.message == 'SUCCESS') {
        this.sweetAlert('success', req.shiftCode + ' Shift also Updated!');
        this.activeModal.close();
      }
      else {
        Swal.fire({
          icon: 'warning',
          title: res.status.message,
          showConfirmButton: true,
        });
      }
    }, (err) => {
      this.spinner.hide();
      this.sweetAlert('error', err.error.status.message);
    });
  }
}

import { AfterContentInit, Component, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MAT_NATIVE_DATE_FORMATS } from '@angular/material/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { canLeaveComponent } from 'src/app/authentication/guards/unsaved-changes.guard';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';
import { HttpPostService } from 'src/app/services/http-post.service';
import { HttpPutService } from 'src/app/services/http-put.service';
import Swal from 'sweetalert2';
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
export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'YYYY-MM-DD',
  },
  display: {
    dateInput: 'YYYY-MM-DD',
    monthYearLabel: 'YYYY MMM',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'YYYY MMMM',
  },
};
@Component({
  selector: 'app-apply-leave',
  templateUrl: './apply-leave.component.html',
  styleUrls: ['./apply-leave.component.scss'],
  providers: [
    { provide: MAT_DATE_FORMATS, useValue: MAT_NATIVE_DATE_FORMATS },
    // ... other providers
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS] },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'en-US' }, // Set your desired locale here
  ],
})
export class ApplyLeaveComponent implements canLeaveComponent, AfterContentInit {
  @Input() public userdata;
  selectedDate = new FormControl(new Date());
  selectedStartDate: Date | null = null;
  selectedEndDate: Date | null = null;
  display = false;
  applyLeaveForm: FormGroup;
  lTypes = [];
  holidays = [];
  errorMsg = [];
  warningMsg = [];
  checkConditions = false;
  nodays = 0;
  today: any;
  view = false;
  update = false;
  canApplyHalfDay = true;
  threeMonths: any;
  private myHolidayDates: { holidays: string[], weekends: string[] } = { holidays: [], weekends: [] };

  lduration = [
    { code: 0.5, name: 'HALF DAY' },
    { code: 1, name: 'FULL DAY' }
  ];
  allowUserToTakethisNumOfLeave = 0;
  leaveSetups = [];
  leaves = [
    { code: 'Sick', totalleaves: 6 },
    { code: 'Casual', totalleaves: 12 },
  ];
  // dateFilter: (date: any | null) => boolean;
  constructor(
    public activeModal: NgbActiveModal,
    private httpGet: HttpGetService,
    private spinner: NgxSpinnerService,
    public globalServ: GlobalvariablesService,
    private fb: FormBuilder,
    public global: GlobalvariablesService,
    // private matDatepicker: MatDatepicker<Date>,
    private httpPost: HttpPostService,
    private httpPut: HttpPutService,
    private dateAdapter: DateAdapter<any>) {
    this.dateAdapter.setLocale('en-GB'); // Set your desired locale
  }

  checkRules() {
    const selectedLeave = this.leaveSetups.find(x => x.leaveTypeCode == this.applyLeaveForm.controls.leaveTypeCode.value);
    this.canApplyHalfDay = selectedLeave ? selectedLeave.canApplyHalf : false;
    // maxTakeAtatime
    const leaveData = this.lTypes.find(x => x.leaveTypeCode == this.applyLeaveForm.controls.leaveTypeCode.value);
    if (this.checkConditions) {
    if (selectedLeave.maxTakeAtatime > leaveData.applyCount) {
      this.allowUserToTakethisNumOfLeave = leaveData.applyCount
    } else {
      this.allowUserToTakethisNumOfLeave = selectedLeave ? selectedLeave.maxTakeAtatime : 0
    }
    } else {
      this.allowUserToTakethisNumOfLeave = 30;
    }
    this.setDates();
  }
  isHoliday(date: Date, totalDays): boolean {
    if (!this.myHolidayDates || (!this.myHolidayDates.weekends && !this.myHolidayDates.holidays)) {
      return false; // or handle this case as needed
    }

    const selectedLeave = this.leaveSetups.find(x => x.leaveTypeCode == this.applyLeaveForm.controls.leaveTypeCode.value);
    let dontCountHolidays = false;
    let dontCountweekends = false;

    if (selectedLeave?.allowDeductionInLeaves4Holiday && totalDays > selectedLeave?.maxLeaveAllowedForSandwich) {
      dontCountHolidays = this.myHolidayDates.holidays ? this.myHolidayDates.holidays.some((holiday) => this.isSameDay(date, holiday)) : false;
    }
    else {
      dontCountHolidays = false;
    }

    if (selectedLeave?.allowDeductionInLeaves4Weekend && totalDays > selectedLeave?.maxLeaveAllowedForSandwich) {
      dontCountweekends = this.myHolidayDates.weekends ? this.myHolidayDates.weekends.some((holiday) => this.isSameDay(date, holiday)) : false;
    } else {
      dontCountweekends = false;
    }

    if ((dontCountHolidays || dontCountweekends) || totalDays > selectedLeave?.maxLeaveAllowedForSandwich) {
      const messages = [];
      if (dontCountHolidays) {
        const holidayMessage = {
          id: 1,
          source: 'holidays',
          msg: `if you select more than ${selectedLeave?.maxLeaveAllowedForSandwich} consecutive days of leave, including holidays, then those holidays will also be considered as leave`
        };
        if (!this.warningMsg.some(msg => msg.id === holidayMessage.id && msg.msg === holidayMessage.msg)) {
          messages.push(holidayMessage);
        }
      }
      if (dontCountweekends) {
        const weekendMessage = {
          id: 2,
          source: 'weekends',
          msg: `if you select more than ${selectedLeave?.maxLeaveAllowedForSandwich} consecutive days of leave, including weekends, then those weekends will also be considered as leave`
        };
        if (!this.warningMsg.some(msg => msg.id === weekendMessage.id && msg.msg === weekendMessage.msg)) {
          messages.push(weekendMessage);
        }
      }
      this.warningMsg.push(...messages);
    }
    else {
      this.warningMsg = [];
    }
    const isWeekend = dontCountweekends ? false : this.myHolidayDates.weekends ? this.myHolidayDates.weekends.some((holiday) => this.isSameDay(date, holiday)) : false;
    const isHoliday = dontCountHolidays ? false : this.myHolidayDates.holidays ? this.myHolidayDates.holidays.some((holiday) => this.isSameDay(date, holiday)) : false;
    return isWeekend || isHoliday;
  }

  getLeaveSetup() {
    this.httpGet.getMasterList('employeeleavesetups').subscribe((res: any) => {
      this.leaveSetups = res.response;
    },
      err => {
        console.error(err);

    })
  }


  canLeave(): boolean {
    if (this.applyLeaveForm.dirty) {
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
          this.applyLeaveForm.reset();
          this.closeModal();
        }
      })
      return false
    } else {
      return true;
    }
    // return window.confirm('Oops! you have unsaved changes on this page')
  }

  ngAfterContentInit() {   
    this.checkConditions = this.globalServ.allowPersonToApplyLeaveBeyondLeaveBal === 'Y' ? true : false;
    this.view = this.userdata.action == 'view' ? true : false;
    this.update = this.userdata.action == 'edit' ? true : false;
    this.applyLeaveForm = this.fb.group({
      leaveTypeCode: [null, [Validators.required]],
      // empId: [null],
      employeeCode: [null],
      employeeName: [null],
      leaveFromdate: [moment().format('YYYY-MM-DD'), [Validators.required]],
      leaveTodate: [moment().format('YYYY-MM-DD'), [Validators.required]],
      numLeaves: [null],
      duration: [null],
      status: [null],
    });
    this.threeMonths = moment().add(2, 'month').endOf('month').format('YYYY-MM-DD');
    this.getWeekendsAndHolidays();
    this.leaveTypes();
    this.getLeaveSetup();
    // const tmr = moment().add(1, 'day');
    const tmrformat = moment().format('YYYY-MM-DD');
    this.today = moment().format('YYYY-MM-DD');
    this.applyLeaveForm.controls.leaveFromdate.setValue(tmrformat);
    // this.applyLeaveForm.controls.empId.setValue(this.userdata.userProfile.id);
    this.applyLeaveForm.controls.employeeCode.setValue(this.userdata.userProfile.employeeCode);
    this.applyLeaveForm.controls.employeeName.setValue(this.userdata.userProfile.name);
    this.init();
    if (!this.view && !this.update) {
      this.setDates();
    }
  }

  init() {
    if (this.view) {
      this.applyLeaveForm.controls.leaveTypeCode.setValue(
        this.userdata.row.leaveTypeCode
      );
      this.applyLeaveForm.controls.leaveFromdate.setValue(
        moment(this.userdata.row.leaveFromdate).format('YYYY-MM-DD')
      );
      this.applyLeaveForm.controls.leaveTodate.setValue(
        moment(this.userdata.row.leaveTodate).format('YYYY-MM-DD')
      );
      this.applyLeaveForm.controls.numLeaves.setValue(
        this.userdata.row.numLeaves
      );
      // this.applyLeaveForm.controls.empId.setValue(this.userdata.row.empId);
      this.applyLeaveForm.controls.employeeCode.setValue(this.userdata.row.employeeCode);
      if (this.userdata.row.numLeaves == 0.5) {
        this.applyLeaveForm.controls.duration.setValue(0.5)
      } else {
        this.applyLeaveForm.controls.duration.setValue(1)
      }
      this.applyLeaveForm.disable();
    }
    else if (this.update) {
      this.applyLeaveForm.controls.leaveTypeCode.setValue(
        this.userdata.row.leaveTypeCode
      );
      this.applyLeaveForm.controls.leaveFromdate.setValue(
        moment(this.userdata.row.leaveFromdate).format('YYYY-MM-DD')
      );
      this.applyLeaveForm.controls.leaveTodate.setValue(
        moment(this.userdata.row.leaveTodate).format('YYYY-MM-DD')
      );
      this.applyLeaveForm.controls.numLeaves.setValue(
        this.userdata.row.numLeaves
      );
      // this.applyLeaveForm.controls.empId.setValue(this.userdata.row.empId);
      this.applyLeaveForm.controls.employeeCode.setValue(this.userdata.row.employeeCode);
      if (this.userdata.row.numLeaves == 0.5) {
        this.applyLeaveForm.controls.duration.setValue(0.5)
      } else {
        this.applyLeaveForm.controls.duration.setValue(1)
      }
      this.applyLeaveForm.enable();
    }
  }
  // =======================
  dateFilter = (date: any | null): boolean => {
    if (!date || !this.myHolidayDates) {
      return false;
    }
    const formattedDate = new Date(date).toLocaleDateString('en-GB'); // Format to 'dd/MM/yyyy'

    return !this.myHolidayDates.weekends.some(holidayDate => {
      return new Date(holidayDate).toLocaleDateString('en-GB') === formattedDate;
    }) && !this.myHolidayDates.holidays.some(holidayDate => {
      return new Date(holidayDate).toLocaleDateString('en-GB') === formattedDate;
    });
  };
  getWeekendsAndHolidays() {
    this.spinner.show();
    this.httpGet
      .getMasterList('empHolidays?employeeCode=' + this.userdata.userProfile.employeeCode)
      .subscribe(
        (res: any) => {
          this.spinner.hide();
          this.myHolidayDates = res.response;
          if (res.response) {
            this.dateFilter(new Date());
          }
          // this.myHolidayDates = res.response.concat(this.myHolidayDates)
        },
        (err) => {
          this.spinner.hide();
          console.error(err);
        }
      );
    // this.getHildays.call(this);
  }
  setDates() {
    let from = moment(this.applyLeaveForm.controls.leaveFromdate.value);
    const to = moment(this.applyLeaveForm.controls.leaveTodate.value);
    const today = moment()
    if (from.diff(today, 'days') < 0) {
      from = today
    }
    this.applyLeaveForm.controls.leaveFromdate.setValue(moment(from).format('YYYY-MM-DD'))
    this.applyLeaveForm.controls.leaveTodate.setValue(moment(to).format('YYYY-MM-DD'))
    if (from.diff(to, 'days') > 0) {
      this.applyLeaveForm.controls.leaveTodate.setValue(
        this.applyLeaveForm.controls.leaveFromdate.value
      );
      this.applyLeaveForm.controls.numLeaves.setValue(1);
      this.checkDuration();
    } else {
      this.getBusinessDays(this.applyLeaveForm.controls.leaveFromdate.value, this.applyLeaveForm.controls.leaveTodate.value)
    }
  }
  // Function to calculate the number of business days between two dates
  getBusinessDays(sDate, eDate): number {
    const startDate = new Date(sDate);
    const endDate = new Date(eDate);
    const oneDay = 24 * 60 * 60 * 1000; // One day in milliseconds
    const totalDays =
      Math.round(Math.abs((endDate.getTime() - startDate.getTime()) / oneDay)) +
      1;
    let businessDays = 0;
    for (let i = 0; i < totalDays; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      // get the weekends to here and get 0 - 6 and add for loop here by venu
      if (
        !this.isHoliday(currentDate, totalDays)
      ) {
        businessDays++;
      }
    }
    const foundIn = [];

    const datesBetween = this.getDates(startDate, endDate);
    datesBetween.map(date => {
      const dateString = date.toISOString().split('T')[0];

      if (this.myHolidayDates.holidays.includes(dateString)) {
        foundIn.push('holidays');
      } else if (this.myHolidayDates.weekends.includes(dateString)) {
        foundIn.push('weekends');
      }
    });
    const found = [...new Set(foundIn)]
    const val = this.warningMsg.filter(x => found.includes(x.source));
    this.warningMsg = val
    this.applyLeaveForm.controls.numLeaves.setValue(businessDays);
    if (this.applyLeaveForm.controls.leaveTypeCode.value) {
      if (this.allowUserToTakethisNumOfLeave >= businessDays) {
      this.errorMsg = [];
    } else {
      this.errorMsg = [];
      // const row = this.errorMsg.find(x => x.id == 1)
      // if (!row) {

      this.errorMsg.push({
        id: 1,
        msg: `You can only select a maximum of ${this.allowUserToTakethisNumOfLeave} 
            ${this.allowUserToTakethisNumOfLeave > 1 ? 'leaves' : 'leave'}  at a time.`
      });
      // }
    }
    }
    if (businessDays == 1) {
      this.applyLeaveForm.controls.duration.setValue(null);
    }
    return businessDays;
  }
  getDates(startDate, endDate) {
    const dates = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  }
  checkDuration() {
    if (this.applyLeaveForm.controls.duration.value == 0.5) {
      this.applyLeaveForm.controls.numLeaves.setValue(0.5)
    } else {
      this.applyLeaveForm.controls.numLeaves.setValue(1)
    }
  }


  isSameDay(onThatDate: Date, holiday: any) {
    const hol = new Date(holiday)
    return (
      onThatDate.getFullYear() === hol.getFullYear() &&
      onThatDate.getMonth() === hol.getMonth() &&
      onThatDate.getDate() === hol.getDate()
    );
  }
  // =======================

  // startDate() {
  //   const from = moment(this.applyLeaveForm.controls.leaveFromdate.value);
  //   const to = moment(this.applyLeaveForm.controls.leaveTodate.value);
  //   if (from.diff(to, 'days') > 0) {
  //     this.applyLeaveForm.controls.leaveTodate.setValue(
  //       this.applyLeaveForm.controls.leaveFromdate.value
  //     );
  //     this.applyLeaveForm.controls.numLeaves.setValue(1);

  //   } else {
  //     this.getBusinessDays(from,to)
  //   }
  // }

  closeModal() {
    this.activeModal.close();
  }
  leaveTypes() {
    this.httpGet.getMasterList('leaveTypesBasedOnSetup').subscribe(
      (res: any) => {
        const lTypes = res.response;
        lTypes.forEach(element => {
          element.disable = false
          const founded = this.userdata.balanceLeaves?.find(x => x.leaveTypeCode == element.leaveTypeCode);
          if (founded && founded.currentBalance >= 1) {
            element.disable = false;
            element.applyCount = founded.currentBalance;
          }
          else {
            if (!this.checkConditions) {
              element.disable = true;
              element.applyCount = 0;
            } else {
              element.disable = false;
              element.applyCount = 30;
            }
          }
        })
        this.lTypes = lTypes.filter(x => x.isVisible !== false);
      },
      (err) => {
        console.error(err.error);
      }
    );
  }
  submit() {
    if (this.allowUserToTakethisNumOfLeave >= this.applyLeaveForm.controls.numLeaves.value) {
    const obj = {
      "leaveTypeCode": this.applyLeaveForm.controls.leaveTypeCode.value,
      "employeeCode": this.applyLeaveForm.controls.employeeCode.value,
      employeeName: this.applyLeaveForm.controls.employeeName.value,
      "leaveFromdate": this.applyLeaveForm.controls.leaveFromdate.value,
      "leaveTodate": this.applyLeaveForm.controls.leaveTodate.value,
      "numLeaves": this.applyLeaveForm.controls.numLeaves.value,
      "duration": this.applyLeaveForm.controls.duration.value,
      "status": this.applyLeaveForm.controls.status.value,
    }
      this.spinner.show();
      this.httpPost.create('leavehistory', obj).subscribe(
        (res: any) => {
          this.spinner.hide();
          if (res.status.message == 'SUCCESS') {
            Swal.fire({
              title: 'Success!',
              text: 'Leave Applied, Please wait for Approval',
              icon: 'success',
              timer: 10000,
            }).then(() => {
              this.closeModal();
            });
          } else {
            Swal.fire({
              title: 'Error!',
              text: res.status.message,
              icon: 'warning', showConfirmButton: true,
            });
          }
        },
        (err) => {
          this.spinner.hide();
          console.error(err.error);
          Swal.fire({
            title: 'Error!',
            text: err.error.status.message,
            icon: 'error',
          });
        }
      );
    } else {
      Swal.fire({
        title: 'Error!',
        html: `You can only select a maximum of ${this.allowUserToTakethisNumOfLeave} 
          ${this.allowUserToTakethisNumOfLeave > 1 ? 'leaves' : 'leave'}  at a time.`,
        icon: 'error',
      });
    }
  }
  onKeyDown(event: KeyboardEvent): void {
    const selectedOption = (event.target as HTMLSelectElement).selectedOptions[0];
    if (selectedOption && selectedOption.disabled) {
      event.preventDefault(); // Prevent default behavior (selecting the option)
    }
  }
  // Update() {
  //   this.spinner.show();
  //   const obj = {
  //     "leaveHistoryId": this.userdata.row.leaveHistoryId,
  //     // "empId": this.userdata.row.empId,
  //     "employeeCode": this.userdata.row.employeeCode,
  //     "leaveTypeCode": this.applyLeaveForm.controls.leaveTypeCode.value,
  //     "leaveFromdate": this.applyLeaveForm.controls.employeeName.value,
  //     "leaveTodate": this.applyLeaveForm.controls.employeeName.value,
  //     employeeName: this.applyLeaveForm.controls.employeeName.value,

  //     "numLeaves": this.applyLeaveForm.value.numLeaves,
  //     "status": this.userdata.row.status,
  //     "companyCode": this.userdata.row.companyCode,
  //     "branchCode": this.userdata.row.branchCode,
  //     "createdby": this.userdata.row.createdby,
  //     "createddate": this.userdata.row.createddate,
  //   }
  //   this.httpPut.doPut('leavehistory', obj).subscribe(
  //     (res: any) => {
  //       this.spinner.hide();
  //       if (res.status.message == 'SUCCESS') {
  //         Swal.fire({
  //           title: 'Success!',
  //           text: 'Leave updated, Please wait for Approval',
  //           icon: 'success',
  //           timer: 10000,
  //         }).then(() => {
  //           this.closeModal();
  //         });
  //       } else {
  //         Swal.fire({
  //           title: 'Error!',
  //           text: res.status.message,
  //           icon: 'warning', showConfirmButton: true,
  //         });
  //       }
  //     },
  //     (err) => {
  //       this.spinner.hide();
  //       console.error(err.error);
  //       Swal.fire({
  //         title: 'Error!',
  //         text: err.error.status.message,
  //         icon: 'error',
  //       });
  //     }
  //   );
  // }
}

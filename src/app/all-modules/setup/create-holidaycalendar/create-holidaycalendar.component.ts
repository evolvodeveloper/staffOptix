/* tslint:disable:component-selector */


import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { HttpGetService } from 'src/app/services/http-get.service';
import { HttpPostService } from 'src/app/services/http-post.service';
import { HttpPutService } from 'src/app/services/http-put.service';
import { UtilService } from 'src/app/services/util.service';
import Swal from 'sweetalert2';
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[app-create-holidaycalendar]',
  templateUrl: './create-holidaycalendar.component.html',
  styleUrls: ['./create-holidaycalendar.component.scss'],
})
export class CreateHolidaycalendarComponent implements OnInit, OnChanges, OnDestroy {
  @Input('app-create-holidaycalendar') selectedHolidayCalendarData: any;
  @Output() selectedHolidayCalendarEvent = new EventEmitter<string>();

  rows = [];
  temp = [];
  holidayCalendarForm: FormGroup;
  view = false;
  update = false;
  open1 = false;
  selectedHolidaycalendar: any;
  msg: string;
  selectYear;
  holidaycalendars: any = [];
  closeResult: string;
  selectedcalendarCode = "";
  parentCalendars = [];
  holidayCal = [];
  // dateCode: string;
  // yearCode: string;
  touchUi = false;
  _max = new Date();
  _maxdate = moment(new Date).format('YYYY-MM-DD')

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private acRoute: ActivatedRoute,
    private httpPostService: HttpPostService,
    private spinner: NgxSpinnerService,
    private utilServ: UtilService,
    private httpPutService: HttpPutService,
    private httpGetService: HttpGetService,
    private modalService: NgbModal,
  ) { }


  ngOnChanges(holidaycalendar: any): void {
    if (typeof holidaycalendar !== 'undefined' && typeof holidaycalendar.selectedHolidayCalendarData !== 'undefined' && typeof holidaycalendar.selectedHolidayCalendarData.currentValue !== 'undefined'
      && (holidaycalendar.selectedHolidayCalendarData.currentValue.type === 'NEW' || holidaycalendar.selectedHolidayCalendarData.currentValue.type === 'VIEW' || holidaycalendar.selectedHolidayCalendarData.currentValue.type === 'EDIT')) {
      this.open1 = true;
      this.holidayCalendarForm.enable();
      delete this.utilServ.viewData;
      delete this.utilServ.editData;
      this.view = false;
      this.update = false;
      if (typeof holidaycalendar.selectedHolidayCalendarData.currentValue.viewData !== 'undefined') {
        this.utilServ.viewData = holidaycalendar.selectedHolidayCalendarData.currentValue.viewData;

        if (this.utilServ.allCalendars.length > 0) {
          this.parentCalendars = this.utilServ.allCalendars;
        } else {
          this.getParentcalendarCode();
        }
        this.init();
      } else if (typeof holidaycalendar.selectedHolidayCalendarData.currentValue.editData !== 'undefined') {
        this.utilServ.editData = holidaycalendar.selectedHolidayCalendarData.currentValue.editData;
        if (this.utilServ.allCalendars.length > 0) {
          this.parentCalendars = this.utilServ.allCalendars;
        } else {
          this.getParentcalendarCode();
        }
        this.init();
      } else {
        this.holidayCalendarForm.reset();
        this.holidayCalendarForm.controls.dateCode.setValue(moment().format('YYYY-MM-DD'));
        this.onHolidayCalendarCodeChange();
        this.holidayCalendarForm.controls.yearCode.disable();
        if (this.utilServ.allCalendars.length > 0) {
          this.parentCalendars = this.utilServ.allCalendars;
          if (this.utilServ.allCalendars.length == 1) {
            this.holidayCalendarForm.controls.holidayCalendarCode.setValue(this.utilServ.allCalendars[0].calendarCode);
          } else {
            this.holidayCalendarForm.controls.holidayCalendarCode.setValue(holidaycalendar.selectedHolidayCalendarData.currentValue.data);          
          }
        } else {
          this.getParentcalendarCode();
        }
        // this.holidayCalendarForm.controls.isactive.setValue(true);
      }
    }
  }

  closeModal(): void {
    this.open1 = false;
    this.selectedHolidayCalendarEvent.emit();
  }


  ngOnInit(): void {
    this.holidayCalendarForm = this.fb.group({
      holidayCalendarCode: ['', Validators.required],
      yearCode: ['', Validators.required],
      dateCode: ['', Validators.required],
      description: ['', Validators.required],
      isOptional: [false]
    });
    this.init();
  }
  init(): void {
    if (this.utilServ.viewData) {
      this.view = true;
      this.holidayCalendarForm.controls.holidayCalendarCode.setValue(this.utilServ.viewData.holidayCalendarCode);
      this.holidayCalendarForm.controls.yearCode.setValue(JSON.stringify(this.utilServ.viewData.yearCode));
      this.holidayCalendarForm.controls.dateCode.setValue(moment(this.utilServ.viewData.dateCode).format('YYYY-MM-DD'));
      this.holidayCalendarForm.controls.description.setValue(this.utilServ.viewData.description);
      this.holidayCalendarForm.controls.isOptional.setValue(this.utilServ.viewData.isOptional);
      this.holidayCalendarForm.disable();
    }
    else if (this.utilServ.editData) {
      this.update = true;
      this.holidayCalendarForm.enable();
      this.holidayCalendarForm.controls.holidayCalendarCode.setValue(this.utilServ.editData.holidayCalendarCode);
      this.holidayCalendarForm.controls.yearCode.setValue(JSON.stringify(this.utilServ.editData.yearCode));
      this.holidayCalendarForm.controls.dateCode.setValue(moment(this.utilServ.editData.dateCode).format('YYYY-MM-DD'));
      this.holidayCalendarForm.controls.description.setValue(this.utilServ.editData.description);
      this.holidayCalendarForm.controls.isOptional.setValue(this.utilServ.editData.isOptional);
    }
  }
  getParentcalendarCode() {
    this.utilServ.allCalendars = [];
    this.httpGetService.getMasterList('calendars').subscribe((res: any) => {
      this.parentCalendars = res.response;
      this.utilServ.allCalendars = res.response;
      if (res.response.length == 1) {
        this.holidayCalendarForm.controls.holidayCalendarCode.setValue(res.response[0].calendarCode);
      } else {
        const row = this.parentCalendars.find(x => x.isDefault == true)
        if (row) {
          this.holidayCalendarForm.controls.holidayCalendarCode.setValue(row.calendarCode);
        }
        else {
          this.holidayCalendarForm.controls.holidayCalendarCode.setValue(row?.calendarCode);
        }

      }
    }, err => {
      Swal.fire({
        title: 'Error!',
        text: err.error.status.message,
        icon: 'error',
        timer: 3000,
      });
    })
  }


  onHolidayCalendarCodeChange(): void {
    // this.yearCode = this.dateCode;
    this.holidayCalendarForm.controls.yearCode.setValue(moment(this.holidayCalendarForm.controls.dateCode.value).format("yyyy"));
  }

  create() {
    this.spinner.show();
    const obj = {
      holidayCalendarCode: this.holidayCalendarForm.controls.holidayCalendarCode.value,
      dateCode: this.holidayCalendarForm.controls.dateCode.value,
      description: this.holidayCalendarForm.controls.description.value,
      yearCode: this.holidayCalendarForm.controls.yearCode.value,
      isOptional: this.holidayCalendarForm.controls.isOptional.value == null ? false : this.holidayCalendarForm.controls.isOptional.value,
    };
    this.httpPostService.create('holidaycalendar', JSON.stringify([obj]))
      .subscribe(
        (res: any) => {
          if (res.status.message == 'SUCCESS') {
            this.spinner.hide();
            Swal.fire({
              title: 'Success!',
              text: 'Created',
              icon: 'success',
              timer: 10000,
            }).then(() => {
              this.holidayCalendarForm.reset();
              this.closeModal();
              // this.utilServ.allCalendars = [];
              // this.router.navigateByUrl('holidayCalendar');
              this.holidayCalendarForm.controls.dateCode.setValue(moment().format('YYYY-MM-DD'));
            })
          } else {
            Swal.fire({
              title: 'Error!',
              text: res.status.message,
              icon: 'warning', showConfirmButton: true,
            });
          }
        }, (err) => {
            this.spinner.hide();
            Swal.fire({
              title: 'Error!',
              text: err.error.status.message,
              icon: 'error',
            })
      })
  }


  Update() {
    this.spinner.show();
      const obj = {
        id: this.utilServ.editData.id,
        holidayCalendarCode: this.holidayCalendarForm.controls.holidayCalendarCode.value,
        yearCode: this.holidayCalendarForm.controls.yearCode.value,
        dateCode: this.holidayCalendarForm.controls.dateCode.value,
        description: this.holidayCalendarForm.controls.description.value,
        isOptional: this.holidayCalendarForm.controls.isOptional.value == null ? false : this.holidayCalendarForm.controls.isOptional.value,
        createdby: this.utilServ.editData.createdby,
        companyCode: this.utilServ.editData.companyCode,
        createddate: this.utilServ.editData.createddate,
      };
      this.httpPutService.doPut('holidaycalendar', JSON.stringify(obj)).subscribe(
        (res: any) => {
          this.spinner.hide();
            if (res.status.message == 'SUCCESS') {
              Swal.fire({
                title: 'Success!',
                text: this.holidayCalendarForm.controls.holidayCalendarCode.value + ' Updated',
                icon: 'success',
                timer: 10000,
              }).then(() => {
                this.holidayCalendarForm.reset();
                this.closeModal();
                this.holidayCalendarForm.controls.dateCode.setValue(moment().format('YYYY-MM-DD'));
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
              Swal.fire({
                title: 'Error!',
                text: err.error.status.message,
                icon: 'error',
              });
            }
    )  
  }

  ngOnDestroy() {
    this.utilServ.editData = null;
    this.utilServ.viewData = null;
  }
}

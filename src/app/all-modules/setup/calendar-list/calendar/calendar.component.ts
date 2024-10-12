import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';
import { HttpPostService } from 'src/app/services/http-post.service';
import { HttpPutService } from 'src/app/services/http-put.service';
import { UtilService } from 'src/app/services/util.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent implements OnInit, OnDestroy {
  @Input() public fromParent;

  calendarForm: FormGroup;
  view = false;
  update = false;
  active = false;
  charLimit: number;
  msg: string;
  timezones = [];
  calList = [];
  modifyisDefaultRecord: any;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private httpPostService: HttpPostService,
    private spinner: NgxSpinnerService,
    private utilServ: UtilService,
    private httpGetService: HttpGetService,
    private modalService: NgbModal,
    public globalServ: GlobalvariablesService,
    public activeModal: NgbActiveModal,
    public httpPutService: HttpPutService
  ) { }


  getTimezone() {
    this.httpGetService.timeZone().subscribe(
      (res: any) => {
        this.timezones = res.response;
      },
      (err) => {
        console.error(err.error.status.message);
      }
    );
  }
  getCalenders() {
    this.httpGetService.getMasterList('calendars').subscribe(
      (res: any) => {
        this.calList = res.response;
        this.utilServ.allCalendars = res.response;
      },
      (err) => {
        Swal.fire({
          title: 'Error!',
          text: err.error.status.message,
          icon: 'error',
          timer: 3000,
        });
      }
    );
  }



  async ngOnInit(): Promise<void> {
    if (this.utilServ.allCalendars.length > 0) {
      this.calList = this.utilServ.allCalendars;
    } else {
      this.getCalenders();
    }
    this.getTimezone();

    this.calendarForm = this.fb.group({
      calendarCode: ['', [Validators.required, this.httpPostService.customValidator()]],
      description: [''],
      timezone: ['', Validators.required],
      isDefault: [false],
      module: ['', Validators.required],
    });
    this.charLimit = this.globalServ.charLimitValue;
    if (this.fromParent?.prop2 == '' || this.fromParent?.prop2 == undefined) {
      this.calendarForm.controls.module.setValue('Attendance');
    } else if (this.fromParent?.prop2 == 'view') {
      this.view = true;
      this.update = false;
      this.calendarForm.controls.calendarCode.setValue(
        this.fromParent.prop1.calendarCode
      );
      this.calendarForm.controls.description.setValue(
        this.fromParent.prop1.description
      );
      this.calendarForm.controls.timezone.setValue(
        this.fromParent.prop1.timezone
      );
      this.calendarForm.controls.module.setValue(this.fromParent.prop1.module);
      this.calendarForm.controls.isDefault.setValue(
        this.fromParent.prop1.isDefault
      );
      this.calendarForm.disable();
    } else if (this.fromParent?.prop2 == 'edit') {
      this.update = true;
      this.view = false;
      this.calendarForm.enable();
      this.calendarForm.controls.calendarCode.setValue(
        this.fromParent.prop1.calendarCode
      );
      this.calendarForm.controls.timezone.setValue(
        this.fromParent.prop1.timezone
      );
      this.calendarForm.controls.description.setValue(
        this.fromParent.prop1.description
      ); this.calendarForm.controls.module.setValue(this.fromParent.prop1.module);

      this.calendarForm.controls.isDefault.setValue(
        this.fromParent.prop1.isDefault
      );
      this.calendarForm.controls.calendarCode.disable();

    }
  }

  closeModal1() {
    this.activeModal.close(this.fromParent);
    // if (this.fromParent?.prop4 === "CalendarListComponent") {
    //   this.router.navigateByUrl('setup/calendarlist');
    // } else {
    //   this.router.navigateByUrl('setup/holidayCalendar');
    // }
  }
  checkDefault() {
    const row = this.fromParent?.prop3.find(x => x.isDefault == true);
    if (row) {
      if (row.calendarCode !== this.calendarForm.controls.calendarCode.value) {
        if (this.calendarForm.controls.isDefault.value) {
          if (this.calendarForm.controls.calendarCode.value != null) {
            if (row) {
              Swal.fire({
                title: 'Are you sure?',
                html:
                  'Do you want to change the default calendar code from ' + '<br><b>' + row?.calendarCode + '</b>' +
                  ' to <b>' + this.calendarForm.controls.calendarCode.value + '</b> ? ',
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
                  this.calendarForm.controls.isDefault.setValue(false);
                }
              })
            }
          } else {
            Swal.fire({
              icon: 'warning',
              text: 'Enter calendar',
              showConfirmButton: true,
            });
            this.calendarForm.controls.isDefault.setValue(false);
          }
        }
        else {
          this.modifyisDefaultRecord = null;
        }
      } else {
        const rows = this.fromParent?.prop3.filter(x => x.isDefault == true);
        if (rows.length > 1) {
          this.calendarForm.controls.isDefault.setValue(false);
        } else {
          Swal.fire({
            icon: 'warning',
            text: 'We required one calendar as isDefault',
            showConfirmButton: true,
          });
          this.calendarForm.controls.isDefault.setValue(true);
        }
      }
    }
  }



  create() {
    this.calendarForm.get('calendarCode').setValue(this.globalServ.checkAndRemoveSpecialCharacters(this.calendarForm.controls.calendarCode.value), { emitEvent: false });
    const req = this.calendarForm.value;
    req.calendarCode = this.calendarForm.controls.calendarCode.value.trim();
    req.isDefault =
      this.calendarForm.controls.isDefault.value == null
        ? false
        : this.calendarForm.controls.isDefault.value;
    this.spinner.show();
    this.httpPostService
      .create('calendar', JSON.stringify([this.calendarForm.value]))
      .subscribe(
        (res: any) => {
          this.spinner.hide();

          if (res.status.message == 'SUCCESS') {
            if (this.modifyisDefaultRecord) {
              this.updateIsDefaultRecord();
            }
            Swal.fire({
              title: 'Success!',
              text: 'Created',
              icon: 'success',
              timer: 10000,
            }).then(() => {
              this.utilServ.allCalendars = [];
              this.calendarForm.reset();
              this.calendarForm.controls.isDefault.setValue(false);
              this.activeModal.close();
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
          console.error(err.error.status.message);
          Swal.fire({
            title: 'Error!',
            text: err.error.status.message,
            icon: 'error',
          });
          this.spinner.hide();
        }
      );
  }
  Update() {
    this.calendarForm.get('calendarCode').setValue(this.globalServ.checkAndRemoveSpecialCharacters(this.calendarForm.controls.calendarCode.value), { emitEvent: false });
    this.spinner.show();
    const obj = {
      id: this.fromParent.prop1.id,
      calendarCode: this.calendarForm.controls.calendarCode.value.trim(),
      description: this.calendarForm.controls.description.value,
      companyCode: this.fromParent.prop1.companyCode,
      timezone: this.calendarForm.controls.timezone.value,
      module: this.calendarForm.controls.module.value,
      isDefault:
        this.calendarForm.controls.isDefault.value == null
          ? false
          : this.calendarForm.controls.isDefault.value,
    };
    this.httpPutService.doPut('calendar', JSON.stringify(obj)).subscribe(
      (res: any) => {
        this.spinner.hide();
        if (res.status.message == 'SUCCESS') {
          if (this.modifyisDefaultRecord) {
            this.updateIsDefaultRecord();
          }
          Swal.fire({
            title: 'Success!',
            text: this.calendarForm.controls.description.value + ' Updated',
            icon: 'success',
            timer: 10000,
          }).then(() => {
            this.utilServ.allCalendars = [];
            this.calendarForm.reset();
            this.calendarForm.controls.isDefault.setValue(false);
            this.update = false;

            // this.router.navigateByUrl('calender-list');
            this.activeModal.close();
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
        console.error(err.error.status.message);
        this.spinner.hide();
        Swal.fire({
          title: 'Error!',
          text: err.error.status.message,
          icon: 'error',
        });
      }
    );
  }
  updateIsDefaultRecord() {
    const req = this.modifyisDefaultRecord;
    req.isDefault = false;
    this.httpPutService.doPut('calendar', req).subscribe((res: any) => {
      if (res.status.message == 'SUCCESS') {
        this.sweetAlert('success', req.calendarCode + '  also Updated!');
        this.modifyisDefaultRecord = null;
        this.calendarForm.reset();
        this.utilServ.allCalendars = [];
        this.update = false;
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
  sweetAlert(icon, text) {
    Swal.fire({
      icon: icon,
      text: text,
      showConfirmButton: true,
      // timer: 1500,
    });
  }
  ngOnDestroy() {
    this.fromParent.prop1 = null;
    this.fromParent.prop2 = null;
  }
}

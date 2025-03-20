import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';
import { UtilService } from 'src/app/services/util.service';
import Swal from 'sweetalert2';
import { CalendarComponent } from '../../calendar-list/calendar/calendar.component';
@Component({
  selector: 'app-holiday-calender',
  templateUrl: './holiday-calender.component.html',
  styleUrls: ['./holiday-calender.component.scss'],
})
export class HolidayCalenderComponent implements OnInit {
  className = 'HolidayCalenderComponent';
  rows = [];
  temp = [];
  yearsArray = [];
  dateFormat: string;
  config: any;
  hasPermissionToUpdate = false;
  hasPermissionToApprove = false;
  selectedcalendarCode: string;
  // selectedyearCode:string = "";
  selectedParentcalendarCode = '';
  parentCalender: any = [];
  holidayCalendarForm: any = [];
  calendar: any;
  calCode: string;
  selectedYear = new Date().getFullYear();
  selectedHolidaycalendar: any;
  constructor(
    private router: Router,
    private spinner: NgxSpinnerService,
    private httpGetService: HttpGetService,
    public globalServ: GlobalvariablesService,
    private acRoute: ActivatedRoute,
    private utilServ: UtilService,
    private cdr: ChangeDetectorRef,
    private modalService: NgbModal
  ) {
    this.config = {
      itemsPerPage: 25,
      currentPage: 1,
      totalItems: this.rows.length,
    };

  }
  resultsPerPage(event) {
    this.config.itemsPerPage =
      event.target.value == 'all' ? this.temp.length : event.target.value;
    this.config.currentPage = 1;
  }

  ngOnInit(): void {
    this.globalServ.getMyCompLabels('holidayCalendar');
    this.globalServ.getMyCompPlaceHolders('holidayCalendar');
    this.globalServ.getMyCompErrors('holidayCalendar');
    this.globalServ.getMyCompLabels('calendarSetup');
    this.globalServ.getMyCompPlaceHolders('calendarSetup');
    this.acRoute.data.subscribe(data => {
      const permission = data.condition
      this.hasPermissionToUpdate = permission.hasPermissionToUpdate
      this.hasPermissionToApprove = permission.hasPermissionToApprove
    });
    if (this.utilServ.allCalendars.length > 0) {
      this.parentCalender = this.utilServ.allCalendars;
      const row = this.parentCalender.find(x => x.isDefault == true);
      this.parentCalender.forEach((element) => {
        if (element.isDefault == true) {
          this.calCode = row.calendarCode;
          this.getcalendarCode(this.calCode);
        }
      });
    } else {
      this.getCalenders();
    }
    this.cdr.detectChanges();

    const currentYear = new Date().getFullYear();
    const yearsBefore = currentYear - 2;
    const yearsAfter = currentYear + 2;
    const yearsArray = [];
    for (let year = yearsBefore; year <= yearsAfter; year++) {
      yearsArray.push(year);
    }
    this.yearsArray = yearsArray;
    // const row = this.yearsArray.find(x => x.yearCode == this.selectedYear);
    this.selectedYear = new Date().getFullYear();
  }

  getCalenders() {
    this.spinner.show();
    this.calCode = '';
    this.httpGetService.getMasterList('calendars').subscribe(
      (res: any) => {
        this.parentCalender = res.response;
        this.utilServ.allCalendars = res.response;
        this.parentCalender.forEach((element) => {
          if (element.isDefault == true) {
            this.calCode = element.calendarCode;
            this.getcalendarCode(this.calCode);
          }
        });
        this.spinner.hide();
      },
      (err) => {
        this.spinner.hide();
        Swal.fire({
          title: 'Error!',
          text: err.error.status.message,
          icon: 'error',
          timer: 3000,
        });
      }
    );
  }

  getcalendarCode(calendarCode: string) {
    this.spinner.show();
    this.httpGetService
      .getMasterList('calendar/holidays?calendar=' + calendarCode)
      .subscribe(
        (res: any) => {
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
          this.dateFormat = this.globalServ.dateFormat;
          this.temp = res.response;
          this.spinner.hide();
          this.updateFilter(res.response);
        },
        (err) => {
          this.spinner.hide();
          Swal.fire({
            title: 'Error!',
            text: err.error.status.message,
            icon: 'error',
            timer: 3000,
          });
        }
      );

  }
  onChangecalendarCode(calendarCode: string): void {
    this.getcalendarCode(calendarCode);

  }

  selectedHolidayCalendarEvent(): void {
    this.ngOnInit();
    this.selectedYear = new Date().getFullYear();
  }

  pageChanged(event) {
    this.config.currentPage = event;
  }
  open() {
    const data = {
      prop1: this.calCode,
      prop4: this.className,
    };
    const modalRef = this.modalService.open(CalendarComponent, {
      backdrop: 'static',
    });
    modalRef.componentInstance.fromParent = data;
    modalRef.result.then(
      (x) => {
        this.getCalenders();
        this.calCode = x.prop1
      },
    );
  }

  updateFilter(data) {
    const val = this.selectedYear;
    const temp = data.filter((d) => d.yearCode == (val));
    this.rows = temp;
    this.config.totalItems = this.rows.length;
  }
  create() {
    this.selectedHolidaycalendar = { type: 'NEW', data: this.calCode };
  }
  viewData(row) {
    this.selectedHolidaycalendar = row;
    this.selectedHolidaycalendar = { type: 'VIEW', viewData: row };
  }
  editData(row) {
    this.selectedHolidaycalendar = row;
    this.selectedHolidaycalendar = { type: 'EDIT', editData: row };
  }


  back() {
    this.router.navigateByUrl('/dashboard');
  }

}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';
import { UtilService } from 'src/app/services/util.service';
import Swal from 'sweetalert2';
import { CalendarComponent } from './calendar/calendar.component';

@Component({
  selector: 'app-calendar-list',
  templateUrl: './calendar-list.component.html',
  styleUrls: ['./calendar-list.component.scss']
})
export class CalendarListComponent implements OnInit {
  className = 'CalendarListComponent';
  rows = [];
  config: any;
  selectedDepartment: any;
  hasPermissionToUpdate = false;
  hasPermissionToApprove = false;
  searchedFor: string;

  constructor(
    private router: Router,
    private acRoute: ActivatedRoute,
    private httpGetService: HttpGetService,
    private utilServ: UtilService,
    private spinner: NgxSpinnerService,
    private modalService: NgbModal,
    public globalServ: GlobalvariablesService

  ) {
    this.config = {
      itemsPerPage: 25,
      currentPage: 1,
      totalItems: this.rows.length
    };
  }
  ngOnInit(): void {
    this.globalServ.getMyCompLabels('calendarSetup');
    this.globalServ.getMyCompPlaceHolders('calendarSetup');
    this.acRoute.data.subscribe(data => {
      const permission = data.condition
      this.hasPermissionToUpdate = permission.hasPermissionToUpdate
      this.hasPermissionToApprove = permission.hasPermissionToApprove
    });
    if (this.className == this.utilServ.universalSerchedData?.componentName) {
      this.searchedFor = this.utilServ.universalSerchedData?.searchedText
    }
    if (this.utilServ.allCalendars.length > 0) {
      if (this.searchedFor !== '' && this.searchedFor !== undefined) {
        const val = this.searchedFor.toLowerCase();
        this.rows = this.utilServ.allCalendars.filter(function (d) {
          return d.calendarCode.toLowerCase().indexOf(val) !== -1 || !val;
        });
      }
      else {
        this.rows = this.utilServ.allCalendars
      }
    } else {
      this.getCalenders();
    }
    this.globalServ.getMyCompLabels('calendarSetup');
    this.globalServ.getMyCompPlaceHolders('calendarSetup');
  }
  getCalenders() {
    this.spinner.show();
    this.httpGetService.getMasterList('calendars').subscribe(
      (res: any) => {
        this.utilServ.allCalendars = res.response;

        if (this.className == this.utilServ.universalSerchedData?.componentName) {
          this.searchedFor = this.utilServ.universalSerchedData?.searchedText
        }
        if (this.utilServ.allCalendars.length > 0) {
          if (this.searchedFor !== '' && this.searchedFor !== undefined) {
            const val = this.searchedFor.toLowerCase();
            this.rows = this.utilServ.allCalendars.filter(function (d) {
              return d.calendarCode.toLowerCase().indexOf(val) !== -1 || !val;
            });
          }
          else {
            this.rows = this.utilServ.allCalendars
          }
        }
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
  pageChanged(event) {
    this.config.currentPage = event;
  }

  resultsPerPage(event) {
    this.config.itemsPerPage = event.target.value == 'all' ? this.utilServ.allCalendars.length : event.target.value;
    this.config.currentPage = 1;
  }

  back() {
    this.router.navigateByUrl('/setup');
  }

  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    if (val == '') {
      this.rows = [...this.utilServ.allCalendars];
    } else {
      const temp = this.utilServ.allCalendars.filter(function (d) {
        return d.calendarCode.toLowerCase().indexOf(val) !== -1 || !val;
      });
      this.rows = temp;
    }
    this.config.totalItems = this.rows.length;
    this.config.currentPage = 1;
    this.utilServ.universalSerchedData = {
      componentName: this.className,
      searchedText: this.searchedFor
    }
  }

  openModal(row, action) {
    const data = {
      prop1: row,
      prop2: action,
      prop3: this.utilServ.allCalendars,
      prop4: this.className,
    };
    const modalRef = this.modalService.open(CalendarComponent, {
      scrollable: true,
      windowClass: 'myCustomModalClass',
      backdrop: 'static',
    });
    modalRef.componentInstance.fromParent = data;
    modalRef.result.then(
      () => {
        this.getCalenders();

      },
      // (reason) => {

      // }
    );
  }
  open() {
    this.modalService.open(CalendarComponent, {
      backdrop: 'static',
    });
  }


}

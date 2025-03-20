import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';
import { UtilService } from 'src/app/services/util.service';
import Swal from 'sweetalert2';
import { AddShiftsComponent } from '../setup/shifts-list/add-shifts/add-shifts.component';

@Component({
  selector: 'app-shifts',
  templateUrl: './shifts.component.html',
  styleUrls: ['./shifts.component.scss'],
})
export class ShiftsComponent implements OnInit {
  shiftassignmentsList = [];
  temp = [];
  config: any;
  unassigntemp = [];
  firstTab = true;
  secondTab = false;
  dateFormat: string;
  searhedFor1stTab: string;
  // startdate = new Date();
  startdate = new Date().toISOString().substr(0, 10);
  // moment().startOf('week').format('DD-MM-YYYY');
  hasPermissionToUpdate = false;
  hasPermissionToApprove = false;
  enddate: any;
  shiftCode: string;
  shifts = [];
  unassignedshifts = [];
  dateForUnassigned = new Date().toISOString().substr(0, 10);
  constructor(
    private httpGetService: HttpGetService,
    private router: Router,
    private acRoute: ActivatedRoute,
    private utilServ: UtilService,
    public global: GlobalvariablesService,
    private modalService: NgbModal,
    private spinner: NgxSpinnerService,

  ) {
    this.config = {
      itemsPerPage: 25,
      currentPage: 1,
      totalItems: this.shiftassignmentsList.length,
    };
    // this.config1 = {
    //   itemsPerPage: 25,
    //   currentPage: 1,
    //   totalItems: this.unassignedshifts.length,
    // };
  }

  tab1() {
    this.firstTab = true;
    this.secondTab = false;
    this.temp = [...this.shiftassignmentsList];
    this.config.totalItems = this.shiftassignmentsList.length;
    this.config.currentPage = 1;
    this.config.itemsPerPage = 25;
    this.unassignedshifts = [...this.unassigntemp];

  }
  tab2() {
    this.firstTab = false;
    this.secondTab = true;
    this.unassigntemp = [...this.unassignedshifts];
    this.config.totalItems = this.unassignedshifts.length;
    this.config.currentPage = 1;
    this.config.itemsPerPage = 25;
    this.shiftassignmentsList = [...this.temp];

  }

  ngOnInit() {
    this.dateFormat = this.global.dateFormat;
    this.getShifts();
    this.dateForUnassignedFunction();
    this.acRoute.data.subscribe(data => {
      const permission = data.condition
      this.hasPermissionToUpdate = permission.hasPermissionToUpdate
      this.hasPermissionToApprove = permission.hasPermissionToApprove
    });
    this.global.getMyCompLabels('shiftAssignmentComp');
    this.global.getMyCompPlaceHolders('shiftAssignmentComp'); 
  }
  checkEmpByShifts(startdate, enddate, shiftCode) {
    this.dateForUnassigned = startdate;
    this.startdate = startdate
    this.searhedFor1stTab = null;
    this.shiftassignmentsList = [];
    if (startdate !== undefined && shiftCode !== undefined) {
      this.getshiftassignments(this.startdate, this.enddate, this.shiftCode);
    }
    if (startdate !== undefined) {
      this.unassignedshifts = [], this.unassigntemp = [];
      this.dateForUnassignedFunction()
    }
  }
  dateForUnassignedFunction() {
    this.spinner.show();
    this.httpGetService.getMasterList('unassignedShifts?date=' + this.dateForUnassigned).subscribe(
      (res: any) => {
        this.unassignedshifts = res.response;
        this.unassigntemp = [...this.unassignedshifts];
        this.config.totalItems = this.unassignedshifts.length;
        this.config.currentPage = 1;
        this.spinner.hide();
      },
      (err) => {
        this.spinner.hide();
        Swal.fire({
          title: 'Error!',
          text: err.error.status.message + ' in Unassigned Shifts',
          icon: 'error',
          timer: 3000,
        });
      }
    );
  }

  getshiftassignments(startdate, enddate, shiftCode) {
    this.spinner.show();
    const newRow = [];
    this.httpGetService
      .getMasterList(
        'shiftAssignment?shiftCode=' +
        shiftCode +
        '&startdate=' +
        startdate +
        '&enddate=' +
        enddate
      )
      .subscribe(
        (res: any) => {
          const todaysDate: any = new Date();
          // endDate
          res.response.forEach(element => {
            if (element.isactive == true) {
              const endDate: any = new Date(element.endDate)
              const timeDifference = endDate - todaysDate;
              // Convert the time difference to days
              const daysDifference = timeDifference / (1000 * 3600 * 24);
              if (daysDifference > 0) {
                element.modify = true;
              }
              else {
                element.modify = false;
              }
              newRow.push(element);
            }
          });
          this.shiftassignmentsList = newRow;
          // this.temp = this.shiftassignmentsList;
          this.temp = [...this.shiftassignmentsList];
          this.config.totalItems = this.shiftassignmentsList.length;
          this.config.currentPage = 1;
          this.spinner.hide();
        },
        (err) => {
          this.spinner.hide();
          console.error(err);
          Swal.fire({
            title: 'Error!',
            text: err.error.status.message,
            icon: 'error',
            timer: 3000,
          });
        }
      );
  }
  getShifts() {
    this.spinner.show();
    this.httpGetService.getMasterList('shifts/active').subscribe(
      (res: any) => {
        if (res.response.length > 0) {
          res.response.unshift({ shiftCode: 'ALL' })
        }
        if (res.response.length === 1) {
          this.shiftCode = res.response[0].shiftCode;
          this.checkEmpByShifts(this.startdate, '', this.shiftCode);
        }
        else if (res.response.length > 1) {
          const row = res.response.find((x) => x.isdefault == true);
          if (row) {
            this.shiftCode = row.shiftCode;
            this.checkEmpByShifts(this.startdate, '', this.shiftCode);
          }
          else {
            this.shiftCode = res.response[0].shiftCode;
            this.checkEmpByShifts(this.startdate, '', this.shiftCode);
          }
        }
        this.shifts = res.response.sort((a, b) => {
          return a.shiftId - b.shiftId
        });
        this.spinner.hide();
      },
      (err) => {
        this.spinner.hide();
        console.error(err);
        Swal.fire({
          title: 'Error!',
          text: err.error.status.message,
          icon: 'error',
          timer: 3000,
        });
      }
    );
  }
  openShiftAssignment() {
    this.router.navigateByUrl('assignshifts/assign-shift');
  }
  view(row) {
    this.utilServ.viewData = row;
    this.router.navigateByUrl('assignshifts/assign-shift');

  }
  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    if (val == '') {
      this.shiftassignmentsList = [...this.temp];
      this.unassignedshifts = [...this.unassigntemp];

    } else {
      const temp = this.temp.filter(function (d) {
        return (d.employeeName && d.employeeName.toLowerCase().indexOf(val) !== -1) || (d.employeeCode && d.employeeCode.toLowerCase().indexOf(val) !== -1) || !val;
      });
      this.shiftassignmentsList = temp;

      const unAssigntemp = this.unassigntemp.filter(function (d) {
        return (d.employeeName && d.employeeName.toLowerCase().indexOf(val) !== -1) || (d.employeeCode && d.employeeCode.toLowerCase().indexOf(val) !== -1) || !val;
      });
      this.unassignedshifts = unAssigntemp;
    }
  }
  // searchFilter(event) {
  //   const val = event.target.value.toLowerCase();
  //   if (val == '') {
  //     this.unassignedshifts = [...this.unassigntemp];
  //   } else {
  //     const temp = this.unassigntemp.filter(function (d) {
  //       return (d.employeeName && d.employeeName.toLowerCase().indexOf(val) !== -1) || (d.employeeCode && d.employeeCode.toLowerCase().indexOf(val) !== -1) || !val;
  //     });
  //     this.unassignedshifts = temp;
  //   }
  // }
  resultsPerPage(event) {
    this.config.itemsPerPage =
      event.target.value == 'all' ? this.temp.length : event.target.value;
    this.config.currentPage = 1;
  }
  resultsPerPage1(event) {
    this.config.itemsPerPage =
      event.target.value == 'all' ? this.unassigntemp.length : event.target.value;
    this.config.currentPage = 1;
  }
  pageChanged(event) {
    this.config.currentPage = event;
  }

  openModal() {
    this.modalService.open(AddShiftsComponent, {
      scrollable: true,
      windowClass: 'myCustomModalClass',
      size: 'lg',
    });
  }

  back() {
    this.router.navigateByUrl('/dashboard');
  }
}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { HttpGetService } from 'src/app/services/http-get.service';
import Swal from 'sweetalert2';
import { AddShiftsComponent } from './add-shifts/add-shifts.component';

@Component({
  selector: 'app-shifts-list',
  templateUrl: './shifts-list.component.html',
  styleUrls: ['./shifts-list.component.scss'],
})
export class ShiftsListComponent implements OnInit {
  shifts = [];
  temp = [];
  config: any;
  hasPermissionToUpdate = false;
  hasPermissionToApprove = false;
  constructor(
    private httpGet: HttpGetService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private acRoute: ActivatedRoute,
    private modalService: NgbModal
  ) {
    this.config = {
      itemsPerPage: 25,
      currentPage: 1,
      totalItems: this.shifts.length,
    };
  }
  searchedFor: string;
  ngOnInit() {
    this.acRoute.data.subscribe(data => {
      const permission = data.condition
      this.hasPermissionToUpdate = permission.hasPermissionToUpdate
      this.hasPermissionToApprove = permission.hasPermissionToApprove
    });
    this.getShifts();
  }
  formattedWeekends(val): any {
    const d = [];
    if (val) {
      const weekends = val.split(',');
      weekends.forEach((element, index) => {
        // d.push('<br>'.concat(element));
        d.push(element);


        if ((index + 1) % 3 === 0 && index !== weekends.length - 1) {
          d[index] = d[index].concat('<br>')
        }
      });
      return d;
    }
  }
  getShifts() {
    this.spinner.show();
    this.httpGet.getMasterList('shifts').subscribe(
      (res: any) => {
        res.response.forEach(element => {
          if (element.graceTimeInHrs) {
            element.graceTimeInDecimal = this.convertDecimaltoTime(element.graceTimeInHrs);
            element.reportLateAfterInHrsDecimal = this.convertDecimaltoTime(element.reportLateAfterInHrs);
          }
        });

        const shifts = res.response;
        this.temp = [...res.response];
        this.spinner.hide();
        if (this.searchedFor !== '' && this.searchedFor !== undefined) {
          const val = this.searchedFor.toLowerCase();
          this.shifts = shifts.filter(function (d) {
            return d.shiftCode.toLowerCase().indexOf(val) !== -1 || !val;
          });
        }
        else {
          this.shifts = shifts
        }
        this.config.totalItems = this.shifts.length;
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
  convertDecimaltoTime(num) {
    if (num) {
      const decimalTime = parseFloat(num);
      const time = Math.floor(decimalTime * 60);
      return time;
    } else {
      return 0
    }
  }
  back() {
    this.router.navigateByUrl('/timesetup');
  }
  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    if (val == '') {
      this.shifts = [...this.temp];
    } else {
      const temp = this.temp.filter(function (d) {
        return d.shiftCode.toLowerCase().indexOf(val) !== -1 || !val;
      });
      this.shifts = temp;
    }
  }
  resultsPerPage(event) {
    this.config.itemsPerPage =
      event.target.value == 'all' ? this.temp.length : event.target.value;
    this.config.currentPage = 1;
  }
  pageChanged(event) {
    this.config.currentPage = event;
  }

  expandRow(row: any): void {
    row.expand = true;
    row.highlight = true;
  }
  collapseRow(row: any): void {
    row.expand = false;
    row.highlight = false;
  }
  openModal(row, action) {
    const data = {
      prop1: row,
      prop2: action,
      prop3: this.temp
    };
    const modalRef = this.modalService.open(AddShiftsComponent, {
      scrollable: true,
      windowClass: 'myCustomModalClass',
      size: 'xl',
      backdrop: 'static',
    });
    modalRef.componentInstance.fromParent = data;
    modalRef.result.then(
      () => {
        this.getShifts();

      },
      // (reason) => {

      // }
    );
  }
}

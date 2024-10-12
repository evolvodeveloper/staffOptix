import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { HttpGetService } from 'src/app/services/http-get.service';
import { UtilService } from 'src/app/services/util.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-designation',
  templateUrl: './designation.component.html',
  styleUrls: ['./designation.component.scss']
})
export class DesignationComponent implements OnInit {
  rows = [];
  temp = [];
  config: any;
  selectedDesignation: any;
  hasPermissionToUpdate = false;
  hasPermissionToApprove = false;
  searchedFor: string;

  constructor(
    private router: Router,
    private httpGetService: HttpGetService,
    private acRoute: ActivatedRoute,
    private utilServ: UtilService,

    private spinner: NgxSpinnerService,

  ) {

    this.config = {
      itemsPerPage: 25,
      currentPage: 1,
      totalItems: this.rows.length
    };

  }

  ngOnInit(): void {
    this.acRoute.data.subscribe(data => {
      const permission = data.condition
      this.hasPermissionToUpdate = permission.hasPermissionToUpdate
      this.hasPermissionToApprove = permission.hasPermissionToApprove
    });
    if (this.utilServ.allDesignations.length > 0) {
      if (this.searchedFor !== '' && this.searchedFor !== undefined) {
        const val = this.searchedFor.toLowerCase();
        this.rows = this.utilServ.allDesignations.filter(function (d) {
          return d.designation.toLowerCase().indexOf(val) !== -1 || !val;
        });
      }
      else {
        this.rows = this.utilServ.allDesignations
      }
    } else {
      this.getDesignations();
    }
  }

  getDesignations() {
    this.spinner.show();
    this.httpGetService.getMasterList('designations').subscribe((res: any) => {
      const rows = res.response;
      this.utilServ.allDesignations = res.response;
      this.temp = [...rows];
      if (this.searchedFor !== '' && this.searchedFor !== undefined) {
        const val = this.searchedFor.toLowerCase();
        this.rows = rows.filter(function (d) {
          return d.designation.toLowerCase().indexOf(val) !== -1 || !val;
        });
      }
      else {
        this.rows = rows
      }
      this.config.totalItems = this.rows.length;
      this.spinner.hide();
    },
      err => {
        this.spinner.hide();
        Swal.fire({
          title: 'Error!',
          text: err.error.status.message,
          icon: 'error',
          timer: 3000,
        });
      })
  }
  selectedDesignationEvent(): void {
    this.ngOnInit();
  }
  pageChanged(event) {
    this.config.currentPage = event;
  }

  resultsPerPage(event) {
    this.config.itemsPerPage = event.target.value == 'all' ? this.temp.length : event.target.value;
    this.config.currentPage = 1;
  }
  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    if (val == '') {
      this.rows = [...this.temp];
    } else {
      const temp = this.temp.filter(function (d) {
        return d.designation.toLowerCase().indexOf(val) !== -1 || !val;
      });
      this.rows = temp;
    }
    this.config.totalItems = this.rows.length;
    this.config.currentPage = 1;
  }
  create() {
    this.selectedDesignation = { type: 'NEW' };
  }

  back() {
    this.router.navigateByUrl('/setup');
  }

  viewData(row) {
    this.selectedDesignation = row;
    this.selectedDesignation = { type: 'VIEW', viewData: row };
  }
  editData(row) {
    this.selectedDesignation = row;
    this.selectedDesignation = { type: 'EDIT', editData: row };
  }
}
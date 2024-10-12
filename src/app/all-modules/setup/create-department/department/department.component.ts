import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';
import { UtilService } from 'src/app/services/util.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-department',
  templateUrl: './department.component.html',
  styleUrls: ['./department.component.scss']
})
export class DepartmentComponent implements OnInit {
  rows = [];
  temp = [];
  labels = [];
  placeholder = [];
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
    public globalServ: GlobalvariablesService

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
    if (this.utilServ.allDepartments.length > 0) {
      if (this.searchedFor !== '' && this.searchedFor !== undefined) {
        const val = this.searchedFor.toLowerCase();
        this.rows = this.utilServ.allDepartments.filter(function (d) {
          return d.deptName.toLowerCase().indexOf(val) !== -1 || !val;
        });
      }
      else {
        this.rows = this.utilServ.allDepartments
      }
    } else {
      this.getDepartments();
    }
    this.globalServ.getMyCompLabels('departmentMaster');
    this.globalServ.getMyCompPlaceHolders('departmentMaster');
    this.globalServ.getMyCompErrors('departmentMaster');
  }

  getDepartments() {
    this.spinner.show();
    this.httpGetService.getMasterList('getdeptwithaccess').subscribe((res: any) => {
      const rows = res.response;
      this.temp = [...rows];
      this.utilServ.allDepartments = res.response
      if (this.searchedFor !== '' && this.searchedFor !== undefined) {
        const val = this.searchedFor.toLowerCase();
        this.rows = rows.filter(function (d) {
          return d.deptName.toLowerCase().indexOf(val) !== -1 || !val;
        });
      }
      else {
        this.rows = rows
      }
      this.spinner.hide();
    }, err => {
      this.spinner.hide();
      Swal.fire({
        title: 'Error!',
        text: err.error.status.message,
        icon: 'error',
        timer: 3000,
      });
    }
    )
  }
  pageChanged(event) {
    this.config.currentPage = event;
  }

  resultsPerPage(event) {
    this.config.itemsPerPage = event.target.value == 'all' ? this.temp.length : event.target.value;
    this.config.currentPage = 1;
  }
  selectedDepartmentEvent(): void {
    this.ngOnInit();
  }

  back() {
    this.router.navigateByUrl('/setup');
  }

  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    if (val == '') {
      this.rows = [...this.temp];
    } else {
      const temp = this.temp.filter(function (d) {
        return d.deptName.toLowerCase().indexOf(val) !== -1 || !val;
      });
      this.rows = temp;
    }
    this.config.totalItems = this.rows.length;
    this.config.currentPage = 1;
  }

  expandRow(row: any): void {
    row.expand = true;
    row.highlight = true;
  }
  collapseRow(row: any): void {
    row.expand = false;
    row.highlight = false;
  }

  create() {
    this.selectedDepartment = { type: 'NEW', labels: this.globalServ.labels, placeholder: this.globalServ.placeholder };
  }
  viewData(row) {
    this.selectedDepartment = row;
    this.selectedDepartment = { type: 'VIEW', viewData: row, labels: this.globalServ.labels, placeholder: this.globalServ.placeholder };

  }
  editData(row) {
    this.selectedDepartment = row;
    this.selectedDepartment = { type: 'EDIT', editData: row, labels: this.globalServ.labels, placeholder: this.globalServ.placeholder };

  }
}

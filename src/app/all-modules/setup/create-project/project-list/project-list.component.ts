import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';
import { UtilService } from 'src/app/services/util.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss'],
})
export class ProjectListComponent implements OnInit {
  rows = [];
  temp = [];
  config: any;
  selectedPayrollEmployeecategory: any;
  hasPermissionToUpdate = false;
  hasPermissionToApprove = false;
  searchedFor: string;

  constructor(
    private router: Router,
    private httpGetService: HttpGetService,
    private spinner: NgxSpinnerService,
    private utilServ: UtilService,
    public globalServ: GlobalvariablesService,
    private acRoute: ActivatedRoute
  ) {
    this.config = {
      itemsPerPage: 25,
      currentPage: 1,
      totalItems: this.rows.length,
    };
  }


  ngOnInit(): void {
    this.acRoute.data.subscribe(async data => {
      const permission = data.condition
      this.hasPermissionToUpdate = permission.hasPermissionToUpdate
      this.hasPermissionToApprove = permission.hasPermissionToApprove
    });
    if (this.utilServ.allProjects.length > 0) {
      if (this.searchedFor !== '' && this.searchedFor !== undefined) {
        const val = this.searchedFor.toLowerCase();
        this.rows = this.utilServ.allProjects.filter(function (d) {
          return d.categoryCode?.toLowerCase().indexOf(val) !== -1 || !val;
        });
      }
      else {
        this.rows = this.utilServ.allProjects;
      }
    } else {
      this.getEmpCategories();
    }
    this.globalServ.getMyCompLabels('projectMaster');
    this.globalServ.getMyCompPlaceHolders('projectMaster');
  }
  getEmpCategories() {
    this.spinner.show();
    this.utilServ.allProjects = [];
    this.httpGetService.getMasterList('getprojwithaccess').subscribe(
      (res: any) => {
        this.utilServ.allProjects = res.response;

        if (this.searchedFor !== '' && this.searchedFor !== undefined) {
          const val = this.searchedFor.toLowerCase();
          this.rows = res.response.filter(function (d) {
            return d.categoryCode?.toLowerCase().indexOf(val) !== -1 || !val;
          });
        }
        else {
          this.rows = this.utilServ.allProjects;
        }
        this.temp = res.response;
        this.config.totalItems = this.rows.length;
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
  selectedPayrollEmployeeCategoryEvent(): void {
    this.ngOnInit();
  }

  expandRow(row: any): void {
    row.expand = true;
    row.highlight = true;
  }
  collapseRow(row: any): void {
    row.expand = false;
    row.highlight = false;
  }

  resultsPerPage(event) {
    this.config.itemsPerPage =
      event.target.value == 'all' ? this.temp.length : event.target.value;
    this.config.currentPage = 1;
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
        return d.categoryCode.toLowerCase().indexOf(val) !== -1 || !val;
      });
      this.rows = temp;
    }
    this.config.totalItems = this.rows.length;
    this.config.currentPage = 1;
  }

  updatePageSize(pageSize: number) {
    this.config.itemsPerPage = pageSize;
    this.pageChanged;
  }

  create() {
    this.selectedPayrollEmployeecategory = { type: 'NEW' };
  }
  viewData(row) {
    this.selectedPayrollEmployeecategory = row;
    this.selectedPayrollEmployeecategory = { type: 'VIEW', viewData: row };
  }
  editData(row) {
    this.selectedPayrollEmployeecategory = row;
    this.selectedPayrollEmployeecategory = { type: 'EDIT', editData: row };
  }
}

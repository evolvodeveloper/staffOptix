import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';
import { UtilService } from 'src/app/services/util.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  hasPermissionToUpdate = false;
  hasPermissionToApprove = false;
  rows = [];
  selectedUser: any;

  temp = [];
  dateFormat: string;
  config: any;
  usertypeList: any = [
    {
      "id": 5,
      "userType": "CONTRACTOR"
    },

    {
      "id": 1,
      "userType": "EMPLOYEE"
    },

  ]
  selected_userType = 'EMPLOYEE';
  searchedFor: string;
  constructor(
    private router: Router,
    private httpGetService: HttpGetService,
    public globalServ: GlobalvariablesService,
    private utilServ: UtilService,
    private acRoute: ActivatedRoute,
    private spinner: NgxSpinnerService,

  ) {
    this.config = {
      itemsPerPage: 25,
      currentPage: 1,
      totalItems: this.rows.length
    };

  }
  selectedUserEvent(): void {
    this.ngOnInit();
  }
  ngOnInit(): void {
    this.globalServ.getMyCompLabels('users');
    this.globalServ.getMyCompPlaceHolders('users');
    this.acRoute.data.subscribe(data => {
      const permission = data.condition
      this.hasPermissionToUpdate = permission.hasPermissionToUpdate
      this.hasPermissionToApprove = permission.hasPermissionToApprove
    });
    if (this.utilServ.secusersApiData.length > 0) {
      if (this.searchedFor !== '' && this.searchedFor !== undefined) {
        const val = this.searchedFor.toLowerCase();
        this.rows = this.utilServ.secusersApiData.filter(function (d) {
          return d.userName.toLowerCase().indexOf(val) !== -1 || !val;
        });
      }
      else {
        this.temp = this.utilServ.secusersApiData;
        this.changeData(this.selected_userType)
      }
    }
    else {
      this.getSecUsers();
    }
  }

  getSecUsers() {
    this.spinner.show();
    this.httpGetService.getMasterList('secUsers').subscribe((res: any) => {
      const rows = res.response;
      this.dateFormat = this.globalServ.dateFormat;
      this.temp = [...rows];
      this.utilServ.secusersApiData = rows;
      this.spinner.hide();
      if (this.searchedFor !== '' && this.searchedFor !== undefined) {
        const val = this.searchedFor.toLowerCase();
        this.rows = rows.filter(function (d) {
          return d.userName.toLowerCase().indexOf(val) !== -1 || !val;
        });
      }
      else {
        this.rows = rows;
        this.changeData(this.selected_userType);
      }
      this.config.totalItems = this.rows.length;
    }, (err) => {
      this.spinner.hide();
      Swal.fire({
        title: 'Error!',
        text: err.error.status.message,
        icon: 'error',
        timer: 3000,
      });
    });
  }
  changeData(type) {
    this.searchedFor = '';
    this.rows = this.temp.filter(row => row.userType == type)
    this.config.totalItems = this.rows.length;
  }

  pageChanged(event) {
    this.config.currentPage = event;
  }

  updatePageSize(pageSize: number) {
    this.config.itemsPerPage = pageSize;
    this.pageChanged;
  }

  resultsPerPage(event) {
    this.config.itemsPerPage = event.target.value == 'all' ? this.temp.length : event.target.value;
    this.config.currentPage = 1;
    this.changeData(this.selected_userType);
  }

  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    if (val == '') {
      this.changeData(this.selected_userType)
    } else {
      const temp = this.temp.filter(function (d) {
        return d.userName.toLowerCase().indexOf(val) !== -1 || !val;
      });
      this.rows = temp;
    }
    this.config.totalItems = this.rows.length;
    this.config.currentPage = 1;
  }

  create() {
    //this.router.navigateByUrl('settings/create-designation');
    this.selectedUser = { type: 'NEW', labels: this.globalServ.labels, placeholder: this.globalServ.placeholder };
  }

  back() {
    this.router.navigateByUrl('/dashboard');
  }

  viewData(row) {
    //this.UtilServ.viewData = row;
    this.selectedUser = row;
    //this.router.navigateByUrl('settings/create-designation');
    this.selectedUser = { type: 'VIEW', viewData: row, labels: this.globalServ.labels, placeholder: this.globalServ.placeholder };
  }
  editData(row) {
    //this.UtilServ.editData = row;
    this.selectedUser = row;
    //this.router.navigateByUrl('settings/create-designation');
    this.selectedUser = { type: 'EDIT', editData: row, labels: this.globalServ.labels, placeholder: this.globalServ.placeholder };
  }
}

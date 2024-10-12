import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { HttpGetService } from 'src/app/services/http-get.service';
import { HttpPutService } from 'src/app/services/http-put.service';
import { UtilService } from 'src/app/services/util.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-role-mapping',
  templateUrl: './user-role-mapping.component.html',
  styleUrls: ['./user-role-mapping.component.scss'],
})
export class UserRoleMappingComponent implements OnInit {
  className = 'UserRoleMappingComponent';
  rows = [];
  userList = [];
  temp = [];
  usersAre = [];
  selectedRoles = [];
  searchedFor: string;

  update = false;
  view = false;
  config: any;
  selectedUsers: any;
  roleCodeList: any = [];
  selected_userName: any;
  current_user: any;
  hasPermissionToUpdate = false;
  hasPermissionToApprove = false;
  constructor(
    private httpGetService: HttpGetService,
    private spinner: NgxSpinnerService,
    private acRoute: ActivatedRoute,
    private router: Router,
    private utilServ: UtilService,
    private httpPut: HttpPutService
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
    this.getroleCodeList();
    this.UserList();
    this.getAllUsernames();
  }

  getAllUsernames() {
    this.httpGetService.getMasterList('secUser/userName').subscribe(
      (res: any) => {
        this.usersAre = res.response;
        this.utilServ.secUserNames = res.response
      });
  }

  getSelectedUserRoles() {
    const roles = [];
    this.temp.forEach((t) => {
      if (t.userName == this.selected_userName) {
        roles.push(t.roleCode);
      }
    });
    this.selectedRoles = roles;
  }

  saveChanges() {
    this.spinner.show();
    const user_data = [];
    this.rows.forEach((r) => {
      const index = this.selectedRoles.findIndex((s) => s == r.roleCode);
      if (r.userName == this.selected_userName && index >= 0) {
        user_data.push(r);
      } else if (r.userName == this.selected_userName) {
        r.isdelete = true;
        user_data.push(r);
      }
    });

    this.selectedRoles.forEach((r) => {
      const index = user_data.findIndex((u) => u.roleCode == r);
      if (index < 0) {
        user_data.push({
          userName: this.selected_userName,
          roleCode: r,
          companyCode: 'this.current_user.companyCode',
          branchCode: 'this.current_user.branchCode',
          isactive: true,
        });
      }
    });
    this.httpPut.userRole(JSON.stringify(user_data)).subscribe(() => {
      this.spinner.hide();
      this.sweetalert('success', 'User Roles Updated!');
      this.selectedRoles = [];
      this.selected_userName = null;
      this.UserList();
    },
      (err) => {
        this.spinner.hide();
        this.sweetalert('error', JSON.stringify(err.error.status.message));
      }
    );
  }
  back() {
    this.router.navigateByUrl('/setup');
  }
  sweetalert(icon, title) {
    Swal.fire({
      title: title,
      icon: icon,
      timer: 1500,
    });
  }

  getroleCodeList() {
    this.httpGetService.getMasterList('secroles?app=atlas').subscribe(
      (res: any) => {
        this.roleCodeList = res.response;
      },
      err => {
        Swal.fire({
          icon: 'error',
          title: 'sorry we are unable to reach roles',
          showConfirmButton: true
        });
      }
    );
  }
  getRowClass = (row) => {
    return {
      'row-color': row.isactive == true,
      'row-color1': row.isactive === 'false',
    };
  };

  UserList() {
    this.spinner.show();
    this.httpGetService.getMasterList('userRoles').subscribe(
      (res: any) => {
        this.temp = res.response;
        if (this.className == this.utilServ.universalSerchedData?.componentName) {
          this.searchedFor = this.utilServ.universalSerchedData?.searchedText;
        }
        if (this.searchedFor !== '' && this.searchedFor !== undefined) {
          const val = this.searchedFor.toLowerCase();
          this.rows = this.temp.filter(function (d) {
            return d.userName?.toLowerCase().indexOf(val) !== -1 || !val;
          });
          this.config.totalItems = this.rows.length;
          this.config.currentPage = 1;
        } else {
          this.rows = res.response;
          this.config.totalItems = this.rows.length;
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

  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    if (val == '') {
      this.rows = [...this.temp];
    } else {
      const temp = this.temp.filter(function (d) {
        return d.userName.toLowerCase().indexOf(val) !== -1 || !val;
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
  patchRow(row) {
    this.selected_userName = row.userName;
    this.getSelectedUserRoles();
  }

  resultsPerPage(event) {
    this.config.itemsPerPage =
      event.target.value == 'all' ? this.temp.length : event.target.value;
    this.config.currentPage = 1;
  }

  create() {
    this.update = false;
    this.view = false;
    this.selectedRoles = [];
    this.selected_userName = null;
    this.selectedUsers = { type: 'NEW' };
  }
  viewData(row) {
    this.update = false;
    this.view = true;
    this.selectedUsers = { type: 'VIEW', viewData: row };
    this.patchRow(row);
  }
  editData(row) {
    this.current_user = row;
    this.update = true;
    this.view = false;
    this.selectedUsers = { type: 'EDIT', editData: row };
    this.patchRow(row);
  }
  pageChanged(event) {
    this.config.currentPage = event;
  }
  updatePageSize(pageSize: number) {
    this.config.itemsPerPage = pageSize;
    this.pageChanged;
  }

  closeModel() {
    const closeButton = document.querySelector('.closeModel') as HTMLElement;
    if (closeButton) {
      closeButton.click();
    }
  }
}

import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';
import { HttpPostService } from 'src/app/services/http-post.service';
import { HttpPutService } from 'src/app/services/http-put.service';
import { UtilService } from 'src/app/services/util.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-payroll-master',
  templateUrl: './payroll-master.component.html',
  styleUrls: ['./payroll-master.component.scss']
})
export class PayrollMasterComponent implements OnInit {
  className = 'PayrollMasterComponent';
  searchedFor: string;
  config: any;
  payrollMasterData = [];
  hasPermissionToUpdate = true;
  hasPermissionToApprove = false;
  message: string;
  temp = [];

  constructor(
    private httpGetService: HttpGetService,
    private httpPostService: HttpPostService,
    private spinner: NgxSpinnerService,
    private httpPutServ: HttpPutService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private acRoute: ActivatedRoute,
    private utilServ: UtilService,
    private formBuilder: FormBuilder,
    public globalServ: GlobalvariablesService
  ) {
    this.config = {
      itemsPerPage: 25,
      currentPage: 1,
      totalItems: this.payrollMasterData.length
    };
  }
  create() {
    this.router.navigateByUrl('payroll-master/create-payrollMaster');
  }
  editData(row) {
    this.utilServ.editData = row;
    this.router.navigateByUrl('payroll-master/create-payrollMaster');
  }
  viewData(row) {
    this.utilServ.viewData = row;
    this.router.navigateByUrl('payroll-master/create-payrollMaster');
  }

  expandRow(row: any): void {
    row.expand = true;
    row.highlight = true;
  }
  collapseRow(row: any): void {
    row.expand = false;
    row.highlight = false;
  }

  ngOnInit() {
    this.globalServ.getMyCompLabels('payrollMaster');
    this.globalServ.getMyCompPlaceHolders('payrollMaster');
    this.globalServ.getMyCompErrors('payrollMaster');
    this.acRoute.data.subscribe(data => {
      const permission = data.condition
      this.hasPermissionToUpdate = permission.hasPermissionToUpdate
      this.hasPermissionToApprove = permission.hasPermissionToApprove
    });
    this.getPayrollMaster();

  }
  back() {
    this.router.navigateByUrl('/dashboard');
  }
  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    if (val == '') {
      this.payrollMasterData = [...this.temp];
    } else {
      const temp = this.temp.filter(function (d) {
        return d.employeeCode.toLowerCase().indexOf(val) !== -1 || d.employeeName.toLowerCase().indexOf(val) !== -1 || (d.aliasName ? d.aliasName?.toLowerCase().indexOf(val) !== -1 : '') || !val;
      });
      this.payrollMasterData = temp;
    }
    this.config.totalItems = this.payrollMasterData.length;
    this.config.currentPage = 1;
    this.utilServ.universalSerchedData = {
      componentName: this.className,
      searchedText: this.searchedFor
    }
  }

  pageChanged(event) {
    this.config.currentPage = event;
  }

  resultsPerPage(event) {
    this.config.itemsPerPage =
      event.target.value == 'all' ? this.temp.length : event.target.value;
    this.config.currentPage = 1;
  }


  getPayrollMaster() {
    const sortOrder = 'asc'
    this.spinner.show();
    this.httpGetService.getMasterList('payroll/all').subscribe(
      (res: any) => {
        const data = res.response.sort((a, b) => {
          if (a.employeeCode < b.employeeCode) {
            return sortOrder === 'asc' ? -1 : 1;
          }
          return 0;
        });
        data.forEach(element => {
          element.fullName = `${element.employeeName}${element.lastName == null ? '' : ', ' + element.lastName}`
        });
        this.temp = data;
        if (this.className == this.utilServ.universalSerchedData?.componentName) {
          this.searchedFor = this.utilServ.universalSerchedData?.searchedText;
        }
        if (this.searchedFor !== '' && this.searchedFor !== undefined) {
          const val = this.searchedFor.toLowerCase();
          this.payrollMasterData = this.temp.filter(function (d) {
            return d.employeeCode.toLowerCase().indexOf(val) !== -1 || d.employeeName.toLowerCase().indexOf(val) !== -1 || (d.aliasName ? d.aliasName?.toLowerCase().indexOf(val) !== -1 : '') || !val;
          });
        } else {
          this.payrollMasterData = this.temp;
        }
        this.spinner.hide();
      }, (err) => {
        this.spinner.hide();
        console.error(err.error.status.message);
      });
  }
  approveEmployee(obj) {
    this.spinner.show();
    const req = obj;
    req.approved = true;
    this.httpPutServ.doPut('payroll/approve', req).subscribe((res: any) => {
      this.spinner.hide();
      if (res?.status?.message == 'SUCCESS') {
        req.approved = true;
        Swal.fire({
          title: 'Success!',
          text: 'Employee Approved',
          icon: 'success',
          timer: 10000,
        })
      } else {
        req.approved = false;
        obj.approved = false;
        Swal.fire({
          title: 'Error!',
          text: res.status.message,
          icon: 'warning', showConfirmButton: true,
        });
      }
    },
      (err) => {
        this.spinner.hide();
        req.approved = false;
        obj.approved = false;
        console.error(err.error);
        Swal.fire({
          title: 'Error!',
          text: err.error.status.message,
          icon: 'error',
        });
      });
  }
}
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';
import { UtilService } from 'src/app/services/util.service';
@Component({
  selector: 'app-payroll-types',
  templateUrl: './payroll-setup.component.html',
  styleUrls: ['./payroll-setup.component.scss'],
})
export class PayrollTypesComponent implements OnInit {
  className = 'PayrollTypesComponent';
  rows = [];
  temp = [];
  searchedFor: string;
  config: any;
  hasPermissionToUpdate = false;
  hasPermissionToApprove = false;
  constructor(
    private router: Router,
    private httpGetService: HttpGetService,
    private utilServ: UtilService,
    private spinner: NgxSpinnerService,
    public globalServ: GlobalvariablesService,
    private acRoute: ActivatedRoute
  ) {
    this.config = {
      itemsPerPage: 25,
      currentPage: 1,
      totalItems: this.rows.length,
    };
  }
  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    if (val == '') {
      this.rows = [...this.temp];
    } else {
      const temp = this.temp.filter(function (d) {
        return d.payrollSetup.payrollCode.toLowerCase().indexOf(val) !== -1 || !val;
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
  ngOnInit(): void {
    this.globalServ.getMyCompLabels('payrollSetup');
    this.globalServ.getMyCompPlaceHolders('payrollSetup');
    if (this.className == this.utilServ.universalSerchedData?.componentName) {
      this.searchedFor = this.utilServ.universalSerchedData?.searchedText
    }
    this.acRoute.data.subscribe(data => {
      const permission = data.condition
      this.hasPermissionToUpdate = permission.hasPermissionToUpdate
      this.hasPermissionToApprove = permission.hasPermissionToApprove
    });
    if (this.utilServ.payrollSetupResBackup.length > 0) {
      if (this.searchedFor !== '' && this.searchedFor !== undefined) {
        const val = this.searchedFor.toLowerCase();
        this.temp = this.utilServ.payrollSetupResBackup;
        this.rows = this.utilServ.payrollSetupResBackup.filter(function (d) {
          return d.payrollSetup.payrollCode?.toLowerCase().indexOf(val) !== -1 || !val;
        });
        this.config.totalItems = this.rows.length;
        this.config.currentPage = 1;
      } else {
        this.rows = this.utilServ.payrollSetupResBackup;
        this.temp = this.utilServ.payrollSetupResBackup
      }
    }
    else {
      this.getpayrollSetups();
    }
  }

  getpayrollSetups() {
    this.rows = []; this.temp = []; this.utilServ.payrollSetupResBackup = [];
    this.spinner.show();
    this.httpGetService.getMasterList('payrollsetupRes?salaryComponent=true').subscribe(
      (res: any) => {
        this.utilServ.payrollSetupResBackup = res.response;
        this.temp = res.response;
        if (this.className == this.utilServ.universalSerchedData?.componentName) {
          this.searchedFor = this.utilServ.universalSerchedData?.searchedText
        }
        if (this.searchedFor !== '' && this.searchedFor !== undefined) {
          const val = this.searchedFor.toLowerCase();
          this.rows = this.utilServ.payrollSetupResBackup.filter(function (d) {
            return d.payrollSetup.payrollCode?.toLowerCase().indexOf(val) !== -1 || !val;
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
        console.error(err.error.status.message);
      }
    );
  }

  resultsPerPage(event) {
    this.config.itemsPerPage =
      event.target.value == 'all' ? this.temp.length : event.target.value;
    this.config.currentPage = 1;
  }

  pageChanged(event) {
    this.config.currentPage = event;
  }
  updatePageSize(pageSize: number) {
    this.config.itemsPerPage = pageSize;
    this.pageChanged;
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
    this.utilServ.approveData = null;
    this.router.navigateByUrl('payrollsetup/payroll-setup/create-payroll-setup');
  }
  viewData(row) {
    this.utilServ.viewData = row;
    this.router.navigateByUrl('payrollsetup/payroll-setup/create-payroll-setup');
  }
  editData(row) {
    this.utilServ.editData = row;
    this.router.navigateByUrl('payrollsetup/payroll-setup/create-payroll-setup');
  }
  approveData(row): void {
    this.utilServ.approveData = row;
    this.router.navigateByUrl('payrollsetup/payroll-setup/create-payroll-setup');
  }

  back() {
    this.router.navigateByUrl('payrollsetup');
  }

}

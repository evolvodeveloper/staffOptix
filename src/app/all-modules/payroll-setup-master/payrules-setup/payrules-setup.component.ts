import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { HttpGetService } from 'src/app/services/http-get.service';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-payrules-setup',
  templateUrl: './payrules-setup.component.html',
  styleUrls: ['./payrules-setup.component.scss']
})
export class PayrulesSetupComponent implements OnInit {
  className = 'PayrulesSetupComponent';
  message: string;
  rows = [];
  config: any;
  hasPermissionToUpdate = false;
  hasPermissionToApprove = false;
  searchedFor: string;
  constructor(
    private router: Router,
    private httpGet: HttpGetService,
    private acRoute: ActivatedRoute,
    private utilServ: UtilService,
    private spinner: NgxSpinnerService

  ) {
    this.config = {
      itemsPerPage: 25,
      currentPage: 1,
      totalItems: this.rows.length
    };
  }

  ngOnInit() {
    this.acRoute.data.subscribe(data => {
      const permission = data.condition
      this.hasPermissionToUpdate = permission.hasPermissionToUpdate
      this.hasPermissionToApprove = permission.hasPermissionToApprove
    });
    if (this.className == this.utilServ.universalSerchedData?.componentName) {
      this.searchedFor = this.utilServ.universalSerchedData?.searchedText
    }
    if (this.utilServ.payrulesBackup.length > 0) {
      if (this.searchedFor !== '' && this.searchedFor !== undefined) {
        const val = this.searchedFor.toLowerCase();
        this.rows = this.utilServ.payrulesBackup.filter(function (d) {
          return d.ruleCode?.toLowerCase().indexOf(val) !== -1 || d.payrollCode.toLowerCase().indexOf(val) !== -1 || !val;
        });
        this.config.totalItems = this.rows.length;
        this.config.currentPage = 1;
      } else {
        this.rows = this.utilServ.payrulesBackup;
      }
    }
    else {
      this.getRulesMaster();
    }
  }
  getRulesMaster() {
    this.spinner.show();
    this.httpGet.getMasterList('payrulesetups').subscribe((res: any) => {
      this.utilServ.payrulesBackup = res.response;
      if (this.searchedFor !== '' && this.searchedFor !== undefined) {
        const val = this.searchedFor.toLowerCase();
        this.rows = this.utilServ.payrulesBackup.filter(function (d) {
          return d.ruleCode?.toLowerCase().indexOf(val) !== -1 || !val;
        });
        this.config.totalItems = this.rows.length;
        this.config.currentPage = 1;
      } else {
        this.rows = this.utilServ.payrulesBackup;
      }
      this.spinner.hide();
    }, err => {
      this.spinner.hide();
      this.message = 'error'
      console.error(err.error.status.message);
    })
  }


  back() {
    this.router.navigateByUrl('/payrollsetup');
  }
  pageChanged(event) {
    this.config.currentPage = event;
  }

  resultsPerPage(event) {
    this.config.itemsPerPage = event.target.value == 'all' ? this.utilServ.payrulesBackup.length : event.target.value;
    this.config.currentPage = 1;
  }
  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    if (val == '') {
      this.rows = [...this.utilServ.payrulesBackup];
    } else {
      const temp = this.utilServ.payrulesBackup.filter(function (d) {
        return d.ruleCode.toLowerCase().indexOf(val) !== -1 || d.payrollCode.toLowerCase().indexOf(val) !== -1 || !val;
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
  create() {
    this.router.navigateByUrl('payrollsetup/rule_setup/create_rule_setup');
  }


  viewData(row) {
    this.utilServ.viewData = row;
    this.router.navigateByUrl('payrollsetup/rule_setup/create_rule_setup');

  }
  editData(row) {
    this.utilServ.editData = row;
    this.router.navigateByUrl('payrollsetup/rule_setup/create_rule_setup');

  }
}

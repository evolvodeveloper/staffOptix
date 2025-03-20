import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';
import { UtilService } from 'src/app/services/util.service';


@Component({
  selector: 'app-salarycmp',
  templateUrl: './salarycmp.component.html',
  styleUrls: ['./salarycmp.component.scss']
})
export class SalarycmpComponent implements OnInit {
  className = 'SalarycmpComponent';
  rows = [];
  config: any;
  hasPermissionToUpdate = false;
  hasPermissionToApprove = false;
  searchedFor: string;
  constructor(
    private router: Router,
    private httpGet: HttpGetService,
    private utilServ: UtilService,
    private acRoute: ActivatedRoute,
    public globalServ: GlobalvariablesService,
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
    if (this.utilServ.salaryComponents.length > 0) {
      if (this.searchedFor !== '' && this.searchedFor !== undefined) {
        const val = this.searchedFor.toLowerCase();
        this.rows = this.utilServ.salaryComponents.filter(function (d) {
          return d.payrollComponent.componentCode?.toLowerCase().indexOf(val) !== -1 || !val;
        });
        this.config.totalItems = this.rows.length;
        this.config.currentPage = 1;
      } else {
        this.rows = this.utilServ.salaryComponents;
      }
    } else {
      this.getsalaryCmpMaster();

    }
    this.globalServ.getMyCompLabels('salaryComponent');
    this.globalServ.getMyCompPlaceHolders('salaryComponent');
  }
  getsalaryCmpMaster() {
    this.spinner.show();
    this.httpGet.getMasterList('payrollcomponentsetups/payrules').subscribe((res: any) => {
      const rows = res.response.filter(x => x.payrollComponent.isInternal === false)
      this.utilServ.salaryComponents = rows;

      if (this.searchedFor !== '' && this.searchedFor !== undefined) {
        const val = this.searchedFor.toLowerCase();
        this.rows = this.utilServ.salaryComponents.filter(function (d) {
          return d.payrollComponent.componentCode?.toLowerCase().indexOf(val) !== -1 || !val;
        });
        this.config.totalItems = this.rows.length;
        this.config.currentPage = 1;
      } else {
        this.rows = this.utilServ.salaryComponents;
      }
      this.spinner.hide();

    }, err => {
      this.spinner.hide();
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
    this.config.itemsPerPage = event.target.value == 'all' ? this.utilServ.salaryComponents.length : event.target.value;
    this.config.currentPage = 1;
  }
  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    if (val == '') {
      this.rows = [...this.utilServ.salaryComponents];
    } else {
      const temp = this.utilServ.salaryComponents.filter(function (d) {
        return d.payrollComponent.componentCode.toLowerCase().indexOf(val) !== -1 || !val;
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
    this.router.navigateByUrl('payrollsetup/salaryStructure/create_salarycmp');
  }


  viewData(row) {
    this.utilServ.viewData = row;
    this.router.navigateByUrl('payrollsetup/salaryStructure/create_salarycmp');

  }
  editData(row) {
    this.utilServ.editData = row;
    this.router.navigateByUrl('payrollsetup/salaryStructure/create_salarycmp');

  }
}

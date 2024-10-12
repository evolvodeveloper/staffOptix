import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { HttpGetService } from 'src/app/services/http-get.service';
import { UtilService } from '../../../services/util.service';

@Component({
  selector: 'app-ot-setup-list',
  templateUrl: './ot-setup-list.component.html',
  styleUrls: ['./ot-setup-list.component.scss']
})
export class OtSetupListComponent implements OnInit {
  className = 'OtSetupListComponent';
  otSetupList = [];
  config: any;
  searchedFor: string;
  hasPermissionToUpdate = false;
  hasPermissionToApprove = false;
  constructor(private httpGet: HttpGetService,
    private acRoute: ActivatedRoute,
    public globalServ: GlobalvariablesService,
    private spinner: NgxSpinnerService,
    private router: Router,
    private utilServ: UtilService) {
    this.config = {
      itemsPerPage: 25,
      currentPage: 1,
      totalItems: this.otSetupList.length,
    };
  }

  ngOnInit() {
    this.globalServ.getMyCompLabels('overtimesetup');
    this.globalServ.getMyCompPlaceHolders('overtimesetup');
    this.globalServ.getMyCompErrors('overtimesetup');

    this.acRoute.data.subscribe(async data => {
      const permission = data.condition
      this.hasPermissionToUpdate = permission.hasPermissionToUpdate
      this.hasPermissionToApprove = permission.hasPermissionToApprove
    });
    if (this.className == this.utilServ.universalSerchedData?.componentName) {
      this.searchedFor = this.utilServ.universalSerchedData?.searchedText;
    }

    if (this.utilServ.getAllOtSetups.length > 0) {
      if (this.searchedFor !== '' && this.searchedFor !== undefined) {
        const val = this.searchedFor.toLowerCase();
        this.otSetupList = this.utilServ.getAllOtSetups.filter(function (d) {
          return d.overtimeCode.toLowerCase().indexOf(val) !== -1 || !val;
        });
      } else {
        this.otSetupList = this.utilServ.getAllOtSetups;
      }
    } else {
      this.getoTSetup();
    }
  }
  getoTSetup() {
    this.spinner.show();
    this.httpGet.getMasterList('overtimesetups').subscribe((res: any) => {
      this.utilServ.getAllOtSetups = res.response;
      if (this.searchedFor !== '' && this.searchedFor !== undefined) {
        const val = this.searchedFor.toLowerCase();
        this.otSetupList = this.utilServ.getAllOtSetups.filter(function (d) {
          return d.overtimeCode.toLowerCase().indexOf(val) !== -1 || !val;
        });
      } else {
        this.otSetupList = this.utilServ.getAllOtSetups;
      }
      this.spinner.hide();
    },
      err => {
        this.spinner.hide();
        console.error(err);
    })
  }

  pageChanged(event) {
    this.config.currentPage = event;
  }

  resultsPerPage(event) {
    this.config.itemsPerPage =
      event.target.value == 'all' ? this.utilServ.getAllOtSetups.length : event.target.value;
    this.config.currentPage = 1;
  }

  back() {
    this.router.navigateByUrl('/timesetup');
  }
  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    if (val == '') {
      this.otSetupList = [...this.utilServ.getAllOtSetups];
    } else {
      const temp = this.utilServ.getAllOtSetups.filter(function (d) {
        return d.overtimeCode.toLowerCase().indexOf(val) !== -1 || !val;
      });
      this.otSetupList = temp;
    }
    this.config.totalItems = this.otSetupList.length;
    this.config.currentPage = 1;
    this.utilServ.universalSerchedData = {
      componentName: this.className,
      searchedText: this.searchedFor
    }
  }

  updatePageSize(pageSize: number) {
    this.config.itemsPerPage = pageSize;
    this.pageChanged;
  }


  create() {
    this.router.navigateByUrl('timesetup/otSetup/create-ot');
  }
  viewData(row) {
    this.utilServ.viewData = row;
    this.router.navigateByUrl('timesetup/otSetup/create-ot');
  }
  editData(row) {
    this.utilServ.editData = row;
    this.router.navigateByUrl('timesetup/otSetup/create-ot');
  }
}
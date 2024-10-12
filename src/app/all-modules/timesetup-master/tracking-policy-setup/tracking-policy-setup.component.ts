import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { HttpGetService } from 'src/app/services/http-get.service';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-tracking-policy-setup',
  templateUrl: './tracking-policy-setup.component.html',
  styleUrls: ['./tracking-policy-setup.component.scss']
})
export class TrackingPolicySetupComponent implements OnInit {
  rows = [];
  temp = [];
  hasPermissionToUpdate = false;
  hasPermissionToApprove = false;
  config: any;
  constructor(
    private httpGet: HttpGetService,
    private router: Router,
    private utilServ: UtilService,
    private acRoute: ActivatedRoute,
    private spinner: NgxSpinnerService
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
    this.getTrakingPolicyList();
  }
  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    if (val == '') {
      this.rows = [...this.temp];
    } else {
      const temp = this.temp.filter(function (d) {
        return d.trackingPolicy.policyCode?.toLowerCase().indexOf(val) !== -1 || !val;
      });
      this.rows = temp;
    }
    this.config.totalItems = this.rows.length;
    this.config.currentPage = 1;
  }
  create() {
    this.router.navigateByUrl('/timesetup/trackingPolicy/tpc')
  }
  resultsPerPage(event) {
    this.config.itemsPerPage =
      event.target.value == 'all' ? this.temp.length : event.target.value;
    this.config.currentPage = 1;
  }
  getTrakingPolicyList() {
    this.spinner.show()
    this.httpGet.getMasterList('trackingpolicies').subscribe((res: any) => {
      this.rows = res.response
      this.temp = res.response;
      this.spinner.hide()
    },
      err => {
        this.spinner.hide()
        console.error(err);
      })
  }

  back() {
    this.router.navigateByUrl('/timesetup');
  }
  pageChanged(event) {
    this.config.currentPage = event;
  }

  viewData(row) {
    this.utilServ.viewData = row;
    this.router.navigateByUrl('/timesetup/trackingPolicy/tpc')
  }

  editData(row) {
    this.utilServ.editData = row;
    this.router.navigateByUrl('/timesetup/trackingPolicy/tpc')
  }


}
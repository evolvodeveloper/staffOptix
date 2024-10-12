import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';
import { HttpPostService } from 'src/app/services/http-post.service';
import { HttpPutService } from 'src/app/services/http-put.service';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-device-location',
  templateUrl: './device-location.component.html',
  styleUrls: ['./device-location.component.scss']
})
export class DeviceLocationComponent implements OnInit {
  className = 'DeviceLocationComponent';
  searchedFor: string;
  config: any;
  devicelocationList = [];
  hasPermissionToUpdate = false;
  hasPermissionToApprove = false;
  message: string;
  constructor(private fb: FormBuilder,
    private httpPost: HttpPostService,
    private httpPut: HttpPutService,
    private acRoute: ActivatedRoute,
    private httpGet: HttpGetService,
    private router: Router,
    private utilServ: UtilService,
    private globalServ: GlobalvariablesService,
    private spinner: NgxSpinnerService,
  ) {
    this.config = {
      itemsPerPage: 25,
      currentPage: 1,
      totalItems: this.devicelocationList.length
    };
  }
  ngOnInit() {
    if (this.className == this.utilServ.universalSerchedData?.componentName) {
      this.searchedFor = this.utilServ.universalSerchedData?.searchedText
    }
    this.acRoute.data.subscribe(data => {
      const permission = data.condition
      this.hasPermissionToUpdate = permission.hasPermissionToUpdate
      this.hasPermissionToApprove = permission.hasPermissionToApprove
    });
    if (this.utilServ.devicelocationListBackup.length > 0) {
      if (this.searchedFor !== '' && this.searchedFor !== undefined) {
        const val = this.searchedFor.toLowerCase();
        const temp = this.utilServ.devicelocationListBackup.filter(function (d) {
          return d.deviceLocCode.toLowerCase().indexOf(val) !== -1 || !val;
        });
        this.devicelocationList = temp;
      } else {
        this.devicelocationList = this.utilServ.devicelocationListBackup;
      }
    } else {
      this.getDeviceLocations();
    }
  }
  back() {
    this.router.navigateByUrl('/timesetup');
  }
  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    if (val == '') {
      this.devicelocationList = [...this.utilServ.devicelocationListBackup];
    } else {
      const temp = this.utilServ.devicelocationListBackup.filter(function (d) {
        return d.deviceLocCode.toLowerCase().indexOf(val) !== -1 || !val;
      });
      this.devicelocationList = temp;
    }
    this.config.totalItems = this.devicelocationList.length;
    this.config.currentPage = 1;
    this.utilServ.universalSerchedData = {
      componentName: this.className,
      searchedText: this.searchedFor
    }
  }

  getDeviceLocations() {
    this.spinner.show();
    this.httpGet.getMasterList('devicelocations?access=true').subscribe(
      (res: any) => {
        this.devicelocationList = res.response;
        this.utilServ.devicelocationListBackup = res.response;
        this.spinner.hide();
      },
      (err) => {
        this.message = 'error'
        console.error(err.error.status.message);
        this.spinner.hide();
      });
  }

  resultsPerPage(event) {
    this.config.itemsPerPage = event.target.value == 'all' ? this.utilServ.devicelocationListBackup.length : event.target.value;
    this.config.currentPage = 1;
  }
  create() {
    this.router.navigateByUrl('timesetup/deviceLocation/add_deviceLoc');
  }
  viewData(row) {
    this.utilServ.viewData = row;
    this.router.navigateByUrl('timesetup/deviceLocation/add_deviceLoc');

  }
  editData(row) {
    this.utilServ.editData = row;
    this.router.navigateByUrl('timesetup/deviceLocation/add_deviceLoc');

  }
}

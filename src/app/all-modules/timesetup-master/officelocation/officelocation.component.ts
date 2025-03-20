import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-officelocation',
  templateUrl: './officelocation.component.html',
  styleUrls: ['./officelocation.component.scss']
})
export class OfficelocationComponent implements OnInit {
  className = 'OfficelocationComponent';
  allOfficeLocations = [];
  hasPermissionToUpdate = false;
  hasPermissionToApprove = false;
  config: any;
  searchedFor: string;
  constructor(
    private router: Router,
    private httpGet: HttpGetService,
    private spinner: NgxSpinnerService,
    private utilServ: UtilService,
    private acRoute: ActivatedRoute,
    public globalServ: GlobalvariablesService

  ) {
    this.config = {
      itemsPerPage: 25,
      currentPage: 1,
      totalItems: this.allOfficeLocations.length,
    };
  }



  ngOnInit() {
      this.globalServ.getMyCompLabels('officeLocation');
    this.globalServ.getMyCompPlaceHolders('officeLocation');
    this.globalServ.getMyCompErrors('officeLocation');
    this.acRoute.data.subscribe(data => {
      const permission = data.condition
      this.hasPermissionToUpdate = permission.hasPermissionToUpdate
      this.hasPermissionToApprove = permission.hasPermissionToApprove
    });
    if (this.className == this.utilServ.universalSerchedData?.componentName) {
      this.searchedFor = this.utilServ.universalSerchedData?.searchedText
    }
    if (this.utilServ.allOfficeLocationsList.length > 0) {
      if (this.searchedFor !== '' && this.searchedFor !== undefined) {
        const val = this.searchedFor.toLowerCase();
        this.allOfficeLocations = this.utilServ.allOfficeLocationsList.filter(function (d) {
          return d.locationCode.toLowerCase().indexOf(val) !== -1 || !val;
        });
      }
      else {
        this.allOfficeLocations = this.utilServ.allOfficeLocationsList;
      }
    }
    else {
      this.getOfficeLocations();
      
    }
    // this.acRoute.data.subscribe(data => {
    //   const permission = data.condition
    //   this.hasPermissionToUpdate = permission.hasPermissionToUpdate
    //   this.hasPermissionToApprove = permission.hasPermissionToApprove
    // });

     
      

  }
  getOfficeLocations() {
    this.spinner.show();
    this.httpGet.getMasterList('officeLocations').subscribe((res: any) => {
      this.utilServ.allOfficeLocationsList = res.response;
      if (this.className == this.utilServ.universalSerchedData?.componentName) {
        this.searchedFor = this.utilServ.universalSerchedData?.searchedText
      } if (this.searchedFor !== '' && this.searchedFor !== undefined) {
        const val = this.searchedFor.toLowerCase();
        this.allOfficeLocations = res.response.filter(function (d) {
          return d.locationCode.toLowerCase().indexOf(val) !== -1 || !val;
        });
      }
      else {
        this.allOfficeLocations = this.utilServ.allOfficeLocationsList;
      }

      this.spinner.hide();
    },
      err => {
        this.spinner.hide();
        console.error(err.error.status.message);
      }
    )
   
  }

  viewData(row) {
    this.utilServ.viewData = row; this.router.navigateByUrl('timesetup/locationMaster/addOfficeLoc');
  }
  editData(row) {
    this.utilServ.editData = row;
    this.router.navigateByUrl('timesetup/locationMaster/addOfficeLoc');
  }
  create() {
    this.router.navigateByUrl('timesetup/locationMaster/addOfficeLoc');
  }
  back() {
    this.router.navigateByUrl('/timesetup');
  }

  pageChanged(event) {
    this.config.currentPage = event;
  }
  selectedPayrollEmployeeCategoryEvent(): void {
    this.ngOnInit();
  }

  resultsPerPage(event) {
    this.config.itemsPerPage =
      event.target.value == 'all' ? this.utilServ.allOfficeLocationsList.length : event.target.value;
    this.config.currentPage = 1;
  }

  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    if (val == '') {
      this.allOfficeLocations = [...this.utilServ.allOfficeLocationsList];
    } else {
      const temp = this.utilServ.allOfficeLocationsList.filter(function (d) {
        return d.locationCode.toLowerCase().indexOf(val) !== -1 || !val;
      });
      this.allOfficeLocations = temp;
    }
    this.config.totalItems = this.allOfficeLocations.length;
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
}

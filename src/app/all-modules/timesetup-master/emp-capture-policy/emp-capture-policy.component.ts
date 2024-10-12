import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { HttpGetService } from 'src/app/services/http-get.service';
import { UtilService } from 'src/app/services/util.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-emp-capture-policy',
  templateUrl: './emp-capture-policy.component.html',
  styleUrls: ['./emp-capture-policy.component.scss']
})
export class EmpCapturePolicyComponent implements OnInit {
  className = 'EmpCapturePolicyComponent';
  rows = [];
  temp = [];
  capturePolicies = [];
  config: any;
  searchedFor: string;
  hasPermissionToUpdate = false;
  hasPermissionToApprove = false;
  isShown = false;
  isShownForIp = false;
  isShownForMem = false;


  constructor(
    private router: Router,
    private httpGetService: HttpGetService,
    private spinner: NgxSpinnerService,
    private utilServ: UtilService,
    private acRoute: ActivatedRoute
  ) {
    this.config = {
      itemsPerPage: 25,
      currentPage: 1,
      totalItems: this.capturePolicies.length,
    };
  }
  ngOnInit() {
    this.acRoute.data.subscribe(data => {
      const permission = data.condition
      this.hasPermissionToUpdate = permission.hasPermissionToUpdate
      this.hasPermissionToApprove = permission.hasPermissionToApprove
    });
    if (this.className == this.utilServ.universalSerchedData?.componentName) {
      this.searchedFor = this.utilServ.universalSerchedData?.searchedText;
    }
    this.getCapturePolicy();
  }

  getCapturePolicy() {
    this.spinner.show();
    this.httpGetService.getMasterList('capturepolicys').subscribe(
      (res: any) => {
        const capturePolicies = res.response;
        this.temp = [...res.response];
        this.spinner.hide();

        if (this.searchedFor !== '' && this.searchedFor !== undefined) {
          const val = this.searchedFor.toLowerCase();
          this.capturePolicies = this.temp.filter(function (d) {
            return d.captureCode.toLowerCase().indexOf(val) !== -1 || !val;
          });
        }
        else {
          this.capturePolicies = capturePolicies
        }
        this.config.totalItems = this.capturePolicies.length;
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

  addPolicy() {
    this.router.navigateByUrl('timesetup/capturepolicy/create-capture-policy');
  }

  viewData(row) {

    this.utilServ.viewData = row;
    this.router.navigateByUrl('timesetup/capturepolicy/create-capture-policy');
  }

  editData(row) {
    this.utilServ.editData = row;
    this.router.navigateByUrl('timesetup/capturepolicy/create-capture-policy');
  }

  oncontatbl() {
    this.isShown = !this.isShown;
  }

  oncontatblForIp() {
    this.isShownForIp = !this.isShownForIp;
  }

  onPolicyMembers() {
    this.isShownForMem = !this.isShownForMem;
  }

  back() {
    this.router.navigateByUrl('/timesetup');
  }

  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    if (val == '') {
      this.capturePolicies = [...this.temp];
    } else {
      const temp = this.temp.filter(function (d) {
        return d.captureCode.toLowerCase().indexOf(val) !== -1 || !val;
      });
      this.capturePolicies = temp;
    }
    this.utilServ.universalSerchedData = {
      componentName: this.className,
      searchedText: this.searchedFor
    }
  }
  resultsPerPage(event) {
    this.config.itemsPerPage =
      event.target.value == 'all' ? this.temp.length : event.target.value;
    this.config.currentPage = 1;
  }
  pageChanged(event) {
    this.config.currentPage = event;
  }

  expandRow(row: any): void {
    row.expand = true;
    row.highlight = true;
  }
  collapseRow(row: any): void {
    row.expand = false;
    row.highlight = false;
  }

}

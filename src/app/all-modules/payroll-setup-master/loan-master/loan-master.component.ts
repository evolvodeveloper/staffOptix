import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { HttpGetService } from 'src/app/services/http-get.service';
import { HttpPostService } from 'src/app/services/http-post.service';

@Component({
  selector: 'app-loan-master',
  templateUrl: './loan-master.component.html',
  styleUrls: ['./loan-master.component.scss']
})
export class LoanMasterComponent implements OnInit {
  view = false;
  update = false;
  selectedLoan: any;
  loanMaster: FormGroup;
  rows = [];
  temp = []; config: any;
  hasPermissionToUpdate = false;
  hasPermissionToApprove = false;
  constructor(
    private httpGet: HttpGetService,
    private httpPost: HttpPostService,
    private route: Router,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private acRoute: ActivatedRoute
  ) {
    this.config = {
      itemsPerPage: 25,
      currentPage: 1,
      totalItems: this.rows.length
    };
  }
  resultsPerPage(event) {
    this.config.itemsPerPage = event.target.value == 'all' ? this.temp.length : event.target.value;
    this.config.currentPage = 1;
  }
  selectedLoanEvent(): void {
    this.ngOnInit();
  }

  back() {
    this.route.navigateByUrl('dashboard')
  }

  ngOnInit() {
    this.acRoute.data.subscribe(data => {
      const permission = data.condition
      this.hasPermissionToUpdate = permission.hasPermissionToUpdate
      this.hasPermissionToApprove = permission.hasPermissionToApprove
    });
    this.getLoans();
  }
  getLoans() {
    this.spinner.show();
    this.httpGet.getMasterList('loans').subscribe((res: any) => {
      this.rows = res.response;
      this.temp = res.response;
      this.spinner.hide();
    },
      err => {
        this.spinner.hide();
        console.error(err);

      })
  }

  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    if (val == '') {
      this.rows = this.temp
    } else {
      const temp = this.temp.filter(function (d) {
        return d.loanCode.toLowerCase().indexOf(val) !== -1 || !val;
      });
      this.rows = temp;
    }
    this.config.totalItems = this.rows.length;
    this.config.currentPage = 1;
  }
  create() {
    //this.router.navigateByUrl('settings/create-designation');
    this.selectedLoan = { type: 'NEW' };
  }


  viewData(row) {
    //this.UtilServ.viewData = row;
    this.selectedLoan = row;
    //this.router.navigateByUrl('settings/create-designation');
    this.selectedLoan = { type: 'VIEW', viewData: row };
  }
  editData(row) {
    //this.UtilServ.editData = row;
    this.selectedLoan = row;
    //this.router.navigateByUrl('settings/create-designation');
    this.selectedLoan = { type: 'EDIT', editData: row };
  }
}

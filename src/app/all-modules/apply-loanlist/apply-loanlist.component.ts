import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { HttpGetService } from 'src/app/services/http-get.service';
import { HttpPutService } from 'src/app/services/http-put.service';
import { UtilService } from 'src/app/services/util.service';
import Swal from 'sweetalert2';
import { GlobalvariablesService } from '../../services/globalvariables.service';

@Component({
  selector: 'app-apply-loanlist',
  templateUrl: './apply-loanlist.component.html',
  styleUrls: ['./apply-loanlist.component.scss']
})
export class ApplyLoanlistComponent implements OnInit {
  view = false;
  update = false;
  loanApplication: any;
  loanMaster: FormGroup;
  usersRecords = [];
  employeeCode: string;
  userProfile: any;
  applicationId: number;
  loanDetails: any;
  firstTab = true;
  secondTab = false;
  tempusersRecords = []; config: any;
  allRecords = []; allTemps = []; config1: any;
  hasPermissionToUpdate = false;
  iAmAdmin = false;
  hasPermissionToApprove = false;
  constructor(
    private httpGet: HttpGetService,
    private httpPut: HttpPutService,
    public activeModal: NgbActiveModal,
    private utilServ: UtilService,
    private spinner: NgxSpinnerService,
    private route: Router,
    public global: GlobalvariablesService,
    private fb: FormBuilder,
    private acRoute: ActivatedRoute
  ) {
    this.config = {
      itemsPerPage: 25,
      currentPage: 1,
      totalItems: this.allRecords.length
    };
    this.config1 = {
      itemsPerPage: 25,
      currentPage: 1,
      totalItems: this.usersRecords.length
    };

  }
  tab1() {
    this.firstTab = true;
    this.secondTab = false;
    this.usersRecords = this.tempusersRecords;
  }
  tab2() {
    this.firstTab = false;
    this.secondTab = true;
    this.allRecords = this.allTemps;
  }
  resultsPerPage1(event) {
    this.config1.itemsPerPage = event.target.value == 'all' ? this.tempusersRecords.length : event.target.value;
    this.config1.currentPage = 1;
  }
  resultsPerPage(event) {
    this.config.itemsPerPage = event.target.value == 'all' ? this.allTemps.length : event.target.value;
    this.config.currentPage = 1;
  }
  loanApplicationEvent(): void {
    this.ngOnInit();
  }
  pageChanged1(event) {
    this.config1.currentPage = event;
  }
  pageChanged(event) {
    this.config.currentPage = event;
  }

  back() {
    this.route.navigateByUrl('dashboard')
  }
  getUserProfile() {
    if (this.utilServ.userProfileData !== undefined) {
      this.iAmAdmin = this.utilServ.userProfileData.roles.includes('ADMIN') || this.utilServ.userProfileData.roles.includes('PROLL_MGR');
      this.userProfile = this.utilServ.userProfileData

      this.employeeCode = this.userProfile.employeeCode;
      // this.getLeavesHistoryByDateAndName(this.year, this.month, this.userProfile.employeeCode)
    }
    else {
      setTimeout(() => {
        this.getUserProfile.call(this)
      })
    }
  }

  ngOnInit() {
    this.global.getMyCompLabels('applyLoanComp');
    this.global.getMyCompPlaceHolders('applyLoanComp');
    this.getUserProfile.call(this);
    this.acRoute.data.subscribe(data => {
      const permission = data.condition
      this.hasPermissionToUpdate = permission.hasPermissionToUpdate
      this.hasPermissionToApprove = permission.hasPermissionToApprove
    });
    this.getAllLoans();
    this.getloginEmpLoans();
  }
  getloginEmpLoans() {
    this.spinner.show();
    this.httpGet.getMasterList('loanAppByEmpCode').subscribe((res: any) => {
      // const records = res.response.filter(x => x.employeeCode == this.employeeCode)
      this.usersRecords = res.response;
      this.tempusersRecords = res.response;
      this.spinner.hide();
    },
      err => {
        this.spinner.hide();
        console.error(err);

      })
  }
  getAllLoans() {
    if (this.hasPermissionToApprove) {
      this.spinner.show();
      this.httpGet.getMasterList('loanapplicationss').subscribe((res: any) => {
      this.allRecords = res.response;
      this.allTemps = res.response;
      this.spinner.hide();
    },
      err => {
        this.spinner.hide();
        console.error(err);
      })
    }
  }

  updateFilter1(event) {
    const val = event.target.value.toLowerCase();
    if (val == '') {
      this.usersRecords = this.tempusersRecords
    } else {
      const temp = this.tempusersRecords.filter(function (d) {
        return d.loanCode.toLowerCase().indexOf(val) !== -1 || d.loanApplicationId.toLowerCase().indexOf(val) !== -1 || !val;
      });
      this.usersRecords = temp;
    }
    this.config1.totalItems = this.usersRecords.length;
    this.config1.currentPage = 1;
  }
  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    if (val == '') {
      this.allRecords = this.allTemps
    } else {
      const temp = this.allTemps.filter(function (d) {
        return d.loanCode.toLowerCase().indexOf(val) !== -1 || d.loanApplicationId.toLowerCase().indexOf(val) !== -1
          || d.employeeCode.toLowerCase().indexOf(val) !== -1 || !val;
      });
      this.allRecords = temp;
    }
    this.config.totalItems = this.allRecords.length;
    this.config.currentPage = 1;
  }
  create() {
    this.loanApplication = { type: 'NEW', userData: this.userProfile };
  }


  viewData(row) {
    this.loanApplication = row;
    this.loanApplication = { type: 'VIEW', viewData: row, userData: this.userProfile };
  }
  editData(row) {
    this.loanApplication = row;
    this.loanApplication = { type: 'EDIT', editData: row, userData: this.userProfile };
  }
  approveRecord(row) {
    this.spinner.show();
    const obj = {
      "id": row.id,
      "loanApplicationId": row.loanApplicationId,
      "employeeCode": row.employeeCode,
      "loanCode": row.loanCode,
      "loanAmount": row.loanAmount,
      "approved": row.approved,
      "status": 'APPROVED',
      "buCode": row.buCode,
      "tenantCode": row.tenantCode,
      "createdby": row.createdby,
      "createddate": row.createddate,
      "lastmodifiedby": row.lastmodifiedby,
      "lastmodifieddate": row.lastmodifieddate,
      "approvedby": row.approvedby,
      "approveddate": row.approveddate,
    }
    this.httpPut.doPut('approveLoan', obj).subscribe((res: any) => {
      this.spinner.hide();
      if (res.status.message == 'SUCCESS') {
        Swal.fire({
          title: 'Success!',
          text: 'Loan Approved',
          icon: 'success',
          timer: 10000,
        }).then(() => {
          this.getAllLoans();
          this.getloginEmpLoans();
        })
      } else {
        Swal.fire({
          title: 'Error!',
          text: res.status.message,
          icon: 'warning', showConfirmButton: true,
        });
      }
    },
      (err) => {
        console.error(err.error.status.message);
        this.spinner.hide();
        Swal.fire({
          title: 'Error!',
          text: err.error.status.message,
          icon: 'error',
        });
      }
    );
  }
  rejectRecord(row) {
    this.spinner.show();
    const obj = {
      "id": row.id,
      "loanApplicationId": row.loanApplicationId,
      "employeeCode": row.employeeCode,
      "loanCode": row.loanCode,
      "loanAmount": row.loanAmount,
      "approved": row.approved,
      "status": 'REJECTED',
      "buCode": row.buCode,
      "tenantCode": row.tenantCode,
      "createdby": row.createdby,
      "createddate": row.createddate,
      "lastmodifiedby": row.lastmodifiedby,
      "lastmodifieddate": row.lastmodifieddate,
      "approvedby": row.approvedby,
      "approveddate": row.approveddate,
    }
    this.httpPut.doPut('approveLoan', obj).subscribe((res: any) => {
      this.spinner.hide();
      if (res.status.message == 'SUCCESS') {
        Swal.fire({
          title: 'Success!',
          text: 'Loan Rejected',
          icon: 'success',
          timer: 10000,
        }).then(() => {
          this.getAllLoans();
          this.getloginEmpLoans();
        })
      } else {
        Swal.fire({
          title: 'Error!',
          text: res.status.message,
          icon: 'warning', showConfirmButton: true,
        });
      }
    },
      (err) => {
        console.error(err.error.status.message);
        this.spinner.hide();
        Swal.fire({
          title: 'Error!',
          text: err.error.status.message,
          icon: 'error',
        });
      }
    );
  }
  closeModel(dismiss) {
    this.activeModal.dismiss(dismiss);

  }
  goto(row) {
    if (this.applicationId !== row.loanApplicationId) {
      this.spinner.show();
      this.httpGet.getMasterList('empLoan/' + row.loanApplicationId).subscribe((res: any) => {
        this.applicationId = row.loanApplicationId
        this.loanDetails = res.response[0];
        this.spinner.hide();
      },
        err => {
          this.spinner.hide();
          console.error(err);

        })
    }
  }
}

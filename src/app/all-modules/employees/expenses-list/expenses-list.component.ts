import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';
import { HttpPostService } from 'src/app/services/http-post.service';
import { HttpPutService } from 'src/app/services/http-put.service';
import { UtilService } from 'src/app/services/util.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-expenses-list',
  templateUrl: './expenses-list.component.html',
  styleUrls: ['./expenses-list.component.scss']
})
export class ExpensesListComponent implements OnInit {
  fulldate = moment().format('YYYY-MM');
  fulldate3 = moment().format('YYYY-MM');
  isFullTextShown = false;
  config: any;
  config1: any;
  config2: any;
  TotalQty: string;
  rows = [];
  temp = [];
  // iAmAdmin = false;
  stopSpinner = true;
  reportObj = {
    employeeCode: 'ALL',
    year: null,
    month: moment().format(("MM")),
  };
  searchedFor: string;
  searchedForunassign: string;
  searchedForAllEmp: string;
  status: string;
  dateFormat: string;
  hasPermissionToUpdate = false;
  hasPermissionToApprove = false;
  firstTab: boolean;
  secondTab: boolean;
  thirdTab: boolean;
  expensesClaimedByEmp = [];
  expensesClaimedByEmpTemp = [];
  expensetemp = [];
  allRecordstemp = [];
  allRecords = [];
  setTimeId: any;
  constructor(
    private httpPostService: HttpPostService,
    private spr: NgxSpinnerService,
    private spinner: NgxSpinnerService,
    private spinnerAllExp: NgxSpinnerService,
    private global: GlobalvariablesService,
    private httpGetService: HttpGetService,
    private router: Router,
    private httpPut: HttpPutService,
    private UtilServ: UtilService,
    private httpGet: HttpGetService,
    private utilServ: UtilService,
    private acRoute: ActivatedRoute,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef

  ) {
    this.config = {
      itemsPerPage: 25,
      currentPage: 1,
      totalItems: this.rows.length,
    };
    this.config1 = {
      itemsPerPage: 25,
      currentPage: 1,
      totalItems: this.expensesClaimedByEmp.length,
    };
    this.config2 = {
      itemsPerPage: 25,
      currentPage: 1,
      totalItems: this.allRecords.length,
    };

  }

  tab1() {
    this.firstTab = true;
    this.secondTab = false;
    this.thirdTab = false;
  }
  tab2() {
    this.firstTab = false;
    this.secondTab = true;
    this.thirdTab = false;
  }
  tab3() {
    this.firstTab = false;
    this.secondTab = false;
    this.thirdTab = true;
  }

  expandRow(row: any): void {
    row.expand = true;
    row.highlight = true;
  }
  collapseRow(row: any): void {
    row.expand = false;
    row.highlight = false;
  }


  ngOnInit(): void {
    this.acRoute.data.subscribe(data => {
      const permission = data.condition
      this.hasPermissionToUpdate = permission.hasPermissionToUpdate
      this.hasPermissionToApprove = permission.hasPermissionToApprove
    });
    if (this.utilServ.dateInExp) {
      this.reportObj.month = moment(this.utilServ.dateInExp).format(('MM'));
      this.reportObj.year = moment(this.utilServ.dateInExp).format(('YYYY'));
      this.fulldate = this.utilServ.dateInExp;
    } else {
      this.reportObj.month = moment().format(('MM'));
      this.reportObj.year = moment().format(('YYYY'));
    }
    // this.fulldate = this.utilServ.dateInExp;
    if (this.hasPermissionToApprove) {
      this.tab3();
      if (this.utilServ.AllExpenses.length > 0) {
        this.allRecords = this.utilServ.AllExpenses;
        this.allRecordstemp = this.utilServ.AllExpenses;
      } else {
        this.getAllExpensesList(this.reportObj.month, this.reportObj.year)
      }
    } else {
      this.tab1();
    }
    if (this.utilServ.expensesByEmp.length > 0) {
      this.rows = this.utilServ.expensesByEmp.filter(x => x.status == 'NEW');
      this.temp = this.utilServ.expensesByEmp.filter(x => x.status == 'NEW');
      this.expensesClaimedByEmp = this.utilServ.expensesByEmp.filter(x => x.status == 'CLAIMED');
      this.expensesClaimedByEmpTemp = this.utilServ.expensesByEmp.filter(x => x.status == 'CLAIMED');
    }
    else {
      this.getExpensesList(this.reportObj.month, this.reportObj.year);
    }
  }



  modified() {
    this.fulldate3 = this.fulldate
    const dateSplit = this.fulldate.split('-');
    this.reportObj.month = dateSplit[1];
    this.reportObj.year = dateSplit[0];
    this.getExpensesList(this.reportObj.month, this.reportObj.year);
    const month = dateSplit[1];
    const year = dateSplit[0];
    this.getAllExpensesList(month, year);
  }
  modified3() {
    const dateSplit = this.fulldate3.split('-');
    const month = dateSplit[1];
    const year = dateSplit[0];
    this.getAllExpensesList(month, year)
  }
  getExpensesList(month, year) {
    this.spinner.show();
    this.httpGetService.getMasterList('employeeexpensess?year=' + year + '&month=' + month).subscribe((res: any) => {
      const rows = res.response.filter(x => x.status == 'NEW' || x.status == 'APPROVED')
      this.rows = rows;
      this.temp = rows;
      this.expensesClaimedByEmp = res.response.filter(x => x.status == 'CLAIMED')
      this.expensesClaimedByEmpTemp = res.response.filter(x => x.status == 'CLAIMED')
      this.utilServ.expensesByEmp = res.response;
      this.utilServ.expensesByEmp.map(x => ({ ...x, status: null }));
      this.spinner.hide();
      this.dateFormat = this.global.dateFormat;
      this.cdr.detectChanges();
    }, (err) => {
      this.spinner.hide();
      console.error(err.error.status.message);
    });
  }
  getAllExpensesList(month, year) {
    if (this.hasPermissionToApprove) {
      this.allRecords = [];
      this.allRecordstemp = [];
      this.status = 'loading';
      this.spinnerAllExp.show();
      this.config.currentPage = 1;
      this.httpGetService.getMasterList('employeeexpensess/all?year=' + year + '&month=' + month).subscribe((res: any) => {
        const allRecords = res.response.filter(x => x.status !== 'REJECTED' && x.status !== 'CLAIMED' && x.status !== 'CANCELLED');
        this.allRecords = allRecords;
        this.allRecordstemp = allRecords;
        this.status = 'loaded';
        this.spinnerAllExp.hide();
        this.utilServ.AllExpenses = allRecords;
        this.config2.totalItems = this.allRecordstemp.length;
      }, (err) => {
        this.status = 'loaded';
        this.spinnerAllExp.hide();
        console.error(err.error.status.message);
      });
    }
  }



  addExpense() {
    // route to add expense
    this.router.navigateByUrl('expenses/add-expense');
  }



  // addExpense(row, action) {
  //   const modalRef = this.modalService.open(AddExpenseComponent, {
  //     scrollable: true,
  //     backdrop: 'static',
  //     windowClass: 'myCustomModalClass',
  //     size: 'lg',
  //   });
  //   modalRef.componentInstance.userdata = {
  //     userProfile: this.userProfile,
  //     action: action,
  //     row: row,
  //   };
  //   modalRef.result.then(
  //     () => {
  //       this.getExpensesList();
  //     },
  //     // (reason) => {   }
  //   );
  // }

  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    if (val == '') {
      this.rows = [...this.temp];
    } else {
      const temp = this.temp.filter(function (d) {
        return (d.subcategoryCode && d.subcategoryCode.toLowerCase().indexOf(val) !== -1)
          || (d.title && d.title.toLowerCase().indexOf(val) !== -1) || !val;

      });
      this.rows = temp;
    }
    this.config.totalItems = this.rows.length;
    this.config.currentPage = 1;
  }
  updateFilter1(event) {
    const val = event.target.value.toLowerCase();
    if (val == '') {
      this.expensesClaimedByEmp = [...this.expensesClaimedByEmpTemp];
    } else {
      const temp = this.expensesClaimedByEmpTemp.filter(function (d) {
        return (d.subcategoryCode && d.subcategoryCode.toLowerCase().indexOf(val) !== -1)
          || (d.title && d.title.toLowerCase().indexOf(val) !== -1) || !val;

      });
      this.expensesClaimedByEmp = temp;
    }
    this.config1.totalItems = this.expensesClaimedByEmp.length;
    this.config1.currentPage = 1;
  }

  updateFilter2(event) {
    const val = event.target.value.toLowerCase();
    if (val == '') {
      this.allRecords = [...this.allRecordstemp];
    } else {
      const temp = this.allRecordstemp.filter(function (d) {
        return (d.createdby && d.createdby.toLowerCase().indexOf(val) !== -1)
          || (d.title && d.title.toLowerCase().indexOf(val) !== -1) || (d.employeeCode && d.employeeCode.toLowerCase().indexOf(val) !== -1) || !val;

      });
      this.allRecords = temp;
    }
    this.config2.totalItems = this.allRecords.length;
    this.config2.currentPage = 1;
  }
  changeData(type) {
    this.searchedFor = '';
    this.rows = this.temp.filter(row => row.userType == type)
    this.config.totalItems = this.rows.length;
  }

  pageChanged(event) {
    this.config.currentPage = event;
  }
  pageChanged1(event) {
    this.config1.currentPage = event;
  }
  pageChanged2(event) {
    this.cdr.detectChanges();
    this.config2.currentPage = event;
  }
  resultsPerPage(event) {
    this.config.itemsPerPage = event.target.value == 'all' ? this.temp.length : event.target.value;
    this.config.currentPage = 1;
  }
  resultsPerPage1(event) {
    this.config1.itemsPerPage = event.target.value == 'all' ? this.expensesClaimedByEmpTemp.length : event.target.value;
    this.config1.currentPage = 1;
  }

  resultsPerPage2(event) {
    this.config2.itemsPerPage = event.target.value == 'all' ? this.allRecordstemp.length : event.target.value;
    this.config2.currentPage = 1;
  }

  back() {
    this.router.navigateByUrl('/dashboard');
  }

  viewData(row, soure) {
    const data = {
      row,
    }
    this.utilServ.dateInExp = this.fulldate;
    this.UtilServ.viewData = data;
    this.router.navigateByUrl('expenses/add-expense');
  }
  editData(row) {
    const data = {
      row,
      date: this.fulldate
    }
    this.utilServ.dateInExp = this.fulldate;

    this.UtilServ.editData = data;
    this.router.navigateByUrl('expenses/add-expense');
  }
  cancel(row) {
    Swal.fire({
      title: "Are you sure?",
      html: `Do you want to Cancel your Expense`,
      showDenyButton: true,
      confirmButtonText: "Yes",
      denyButtonText: `No`
    }).then((result) => {
      if (result.isConfirmed) {
        this.cancelexp(row)
      }
    });
  }
  Approve(row) {
    Swal.fire({
      title: "Are you sure?",
      html: `Do you want to Approve this expense`,
      showDenyButton: true,
      confirmButtonText: "Yes",
      denyButtonText: `No`
    }).then((result) => {
      if (result.isConfirmed) {
        this.approveExp(row)
      }
    });
  }

  Reject(row) {
    Swal.fire({
      title: "Are you sure?",
      html: `Do you want to Reject this expense`,
      showDenyButton: true,
      confirmButtonText: "Yes",
      denyButtonText: `No`
    }).then((result) => {
      if (result.isConfirmed) {
        this.rejectExp(row)
      }
    });
  }






  cancelexp(row) {
    this.spinner.show();
    row.modifiedStatus = 'CANCELLED';
    this.httpPut.doPut('emp/expenses/approved', row).subscribe((res: any) => {
      this.spinner.hide();
      if (res.status.message == 'SUCCESS') {
        Swal.fire({
          title: 'Success',
          text: row.title + ' Cancelled',
          icon: 'success',
          confirmButtonText: 'OK',
        })
        row.status = 'CANCELLED';
        const allSer = this.utilServ.AllExpenses.find(x => x.billId == row.billId);
        allSer.status = 'CANCELLED'
        this.allRecords = this.utilServ.AllExpenses.filter(x => x.status == 'APPROVED' || x.status == 'NEW');
        const serEmp = this.utilServ.expensesByEmp.find(x => x.billId == row.billId);
        serEmp.status = 'CANCELLED'
        this.rows = this.utilServ.expensesByEmp.filter(x => x.status == 'NEW');
        this.temp = this.utilServ.expensesByEmp.filter(x => x.status == 'NEW');

      }
    },
      err => {
        this.spinner.hide();
        Swal.fire({
          title: 'Error!',
          text: err.error.status.message,
          icon: 'error',
        });
      });
  }
  approveExp(row) {
    this.spinner.show();
    row.modifiedStatus = 'APPROVED';
    this.httpPut.doPut('emp/expenses/approved', row).subscribe((res: any) => {
      this.spinner.hide();
      if (res.status.message == 'SUCCESS') {
        Swal.fire({
          title: 'Success',
          text: row.title + ' Approved',
          icon: 'success',
          confirmButtonText: 'OK',
        })
        row.status = 'APPROVED';

        const allSer = this.utilServ.AllExpenses.find(x => x.billId == row.billId);
        allSer.status = 'APPROVED'
        this.allRecords = this.utilServ.AllExpenses.filter(x => x.status == 'APPROVED' || x.status == 'NEW');

        const serEmp = this.utilServ.expensesByEmp.find(x => x.billId == row.billId);
        serEmp.status = 'APPROVED'
        this.rows = this.utilServ.expensesByEmp.filter(x => x.status == 'NEW');
        this.temp = this.utilServ.expensesByEmp.filter(x => x.status == 'NEW');


      }
    },
      err => {
        this.spinner.hide();
        Swal.fire({
          title: 'Error!',
          text: err.error.status.message,
          icon: 'error',
        });
      });
  }

  ClaimAmount(row) {
    this.spinner.show();
    row.modifiedStatus = 'CLAIMED';
    this.httpPut.doPut('emp/expenses/approved', row).subscribe((res: any) => {
      this.spinner.hide();
      if (res.status.message == 'SUCCESS') {
        Swal.fire({
          title: 'Success',
          text: row.title + ' Claimed',
          icon: 'success',
          confirmButtonText: 'OK',
        })
        row.status = 'CLAIMED';
        const allSer = this.utilServ.AllExpenses.find(x => x.billId == row.billId);
        allSer.status = 'CLAIMED'
        this.allRecords = this.utilServ.AllExpenses.filter(x => x.status == 'APPROVED' || x.status == 'NEW');

        const serEmp = this.utilServ.expensesByEmp.find(x => x.billId == row.billId);
        serEmp.status = 'CLAIMED'
        this.expensesClaimedByEmp = this.utilServ.expensesByEmp.filter(x => x.status == 'CLAIMED');
        this.rows = this.utilServ.expensesByEmp.filter(x => x.status == 'NEW');
        this.temp = this.utilServ.expensesByEmp.filter(x => x.status == 'NEW');


      }
    },
      err => {
        this.spinner.hide();
        Swal.fire({
          title: 'Error!',
          text: err.error.status.message,
          icon: 'error',
        });
      });
  }

  rejectExp(row) {
    this.spinner.show();
    row.modifiedStatus = 'REJECTED';
    this.httpPut.doPut('emp/expenses/approved', row).subscribe((res: any) => {
      this.spinner.hide();
      if (res.status.message == 'SUCCESS') {
        Swal.fire({
          title: 'Success',
          text: row.title + ' Rejected',
          icon: 'success',
          confirmButtonText: 'OK',
        })
        row.status = 'REJECTED';
        const allSer = this.utilServ.AllExpenses.find(x => x.billId == row.billId);
        allSer.status = 'REJECTED'
        this.allRecords = this.utilServ.AllExpenses.filter(x => x.status == 'APPROVED' || x.status == 'NEW');

        const serEmp = this.utilServ.expensesByEmp.find(x => x.billId == row.billId);
        serEmp.status = 'REJECTED'
        this.rows = this.utilServ.expensesByEmp.filter(x => x.status == 'NEW');
        this.temp = this.utilServ.expensesByEmp.filter(x => x.status == 'NEW');


      }
    },
      err => {
        this.spinner.hide();
        Swal.fire({
          title: 'Error!',
          text: err.error.status.message,
          icon: 'error',
        });
      });
  }
}

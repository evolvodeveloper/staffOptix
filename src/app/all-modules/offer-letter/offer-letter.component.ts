import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';
import { HttpPostService } from 'src/app/services/http-post.service';
import { HttpPutService } from 'src/app/services/http-put.service';
import { UtilService } from 'src/app/services/util.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-offer-letter',
  templateUrl: './offer-letter.component.html',
  styleUrls: ['./offer-letter.component.scss']
})
export class OfferLetterComponent implements OnInit {
  searchedFor = '';
  offerLettersList = [];
  approvedOfferLetters = [];
  approvedTemp = [];
  dateFormat: string;
  hasPermissionToUpdate = false;
  hasPermissionToApprove = false;
  secondTab = false;
  firstTab = true; thirdTab = false;
  temp = [];
  config: any;
  emailSendedRecords = [];
  emailTemp = [];
  approvedConfig: any;
  emailOfferLetterConfig: any;
  constructor(
    private router: Router,
    private httpGet: HttpGetService,
    private spinner: NgxSpinnerService,
    private globalServ: GlobalvariablesService,
    private utilServ: UtilService,
    private httpPost: HttpPostService,
    private httpPut: HttpPutService,
    private acRoute: ActivatedRoute,
  ) {
    this.config = {
      itemsPerPage: 25,
      currentPage: 1,
      totalItems: this.offerLettersList.length,
    };
    this.approvedConfig = {
      itemsPerPage: 25,
      currentPage: 1,
      totalItems: this.approvedOfferLetters.length,
    };
    this.emailOfferLetterConfig = {
      itemsPerPage: 25,
      currentPage: 1,
      totalItems: this.emailSendedRecords.length,
    };

  }
  tabOne() {
    this.firstTab = true;
    this.secondTab = false;
    this.thirdTab = false;

  }
  tabTwo() {
    this.firstTab = false;
    this.secondTab = true;
    this.thirdTab = false;

  }
  tabThree() {
    this.firstTab = false;
    this.secondTab = false;
    this.thirdTab = true;
  }

  ngOnInit() {
    this.acRoute.data.subscribe(data => {
      const permission = data.condition
      this.hasPermissionToUpdate = permission.hasPermissionToUpdate
      this.hasPermissionToApprove = permission.hasPermissionToApprove
    });
    this.getOfferLetters();
    this.dateFormat = this.globalServ.dateFormat;
  }
  getOfferLetters() {
    this.spinner.show();
    this.offerLettersList = [], this.temp = [], this.approvedOfferLetters = [], this.approvedTemp = [], this.emailSendedRecords = [], this.emailTemp = [];
    this.httpGet.getMasterList('empOfferLetter/all').subscribe((res: any) => {
      const offerLettersList = res.response;
      this.offerLettersList = offerLettersList.filter(x => x.approved == false && x.status !== 'REJECTED')
      this.temp = this.offerLettersList;
      this.approvedOfferLetters = offerLettersList.filter(x => x.approved === true && x.emailSent === false && x.status !== 'REJECTED')
      this.approvedTemp = this.approvedOfferLetters
      this.emailSendedRecords = offerLettersList.filter(x => x.emailSent === true)
      this.emailTemp = this.emailSendedRecords
      this.spinner.hide();
    },
      err => {
        console.error(err);
        this.spinner.hide();
      })
  }
  editData(row) {
    this.utilServ.editData = row;
    this.router.navigateByUrl('/offerletter/cOfferL');
  }
  create() {
    this.router.navigateByUrl('/offerletter/cOfferL');
  }
  pageChanged(event) {
    this.config.currentPage = event;
  }

  pageChanged1(event) {
    this.approvedConfig.currentPage = event;
  }

  pageChanged2(event) {
    this.emailOfferLetterConfig.currentPage = event;
  }
  resultsPerPage(event) {
    this.config.itemsPerPage =
      event.target.value == 'all' ? this.offerLettersList.length : event.target.value;
    this.config.currentPage = 1;
  }
  resultsPerPage1(event) {
    this.approvedConfig.itemsPerPage =
      event.target.value == 'all' ? this.approvedOfferLetters.length : event.target.value;
    this.approvedConfig.currentPage = 1;
  }
  resultsPerPage2(event) {
    this.emailOfferLetterConfig.itemsPerPage =
      event.target.value == 'all' ? this.emailSendedRecords.length : event.target.value;
    this.emailOfferLetterConfig.currentPage = 1;
  }
  viewData(row) {
    let img = null, header = null;
    header = 'data:application/pdf;base64,';
    img = header.concat(row.image);
    const link = document.createElement('a');

    // Set the href attribute with the Base64 data and MIME type
    link.href = `data:application/octet-stream;base64,${row.image}`;

    // Set the download attribute with the filename
    link.download = row.employeeName + ' Offer Letter.pdf';

    // Append the link to the body (necessary for Firefox)
    document.body.appendChild(link);

    // Programmatically click the link to trigger the download
    link.click();

    // Remove the link from the document
    document.body.removeChild(link);
    // const newWindow = window.open(img);
    // if (newWindow) {
    //   newWindow.document.write(`<html><body style="text-align: center;width: 100%; height: 100%; object-fit: contain; "><img style=" display: block;width: 100vw;
    //     height: auto;max-height: 100vh;object-fit: contain;" src="${img}" ></body></html>`);
    // } else {
    //   console.error('Failed to open new window or popup blocker prevented it.');
    // }
  }

  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    if (val == '') {
      this.offerLettersList = [...this.temp];
      this.approvedOfferLetters = [...this.approvedTemp];
      this.emailSendedRecords = [...this.emailTemp];


    } else {
      const temp = this.temp.filter(function (d) {
        return d.employeeName.toLowerCase().indexOf(val) !== -1 || !val;
      });
      this.offerLettersList = temp;

      const appTemp = this.approvedTemp.filter(function (d) {
        return d.employeeName.toLowerCase().indexOf(val) !== -1 || !val;
      });
      this.approvedOfferLetters = appTemp;

      const emailTemp = this.emailTemp.filter(function (d) {
        return d.employeeName.toLowerCase().indexOf(val) !== -1 || !val;
      });
      this.emailSendedRecords = emailTemp;
    }
    this.config.totalItems = this.offerLettersList.length;
    this.config.currentPage = 1;

    this.approvedConfig.totalItems = this.approvedOfferLetters.length;
    this.approvedConfig.currentPage = 1;

    this.emailOfferLetterConfig.totalItems = this.emailSendedRecords.length;
    this.emailOfferLetterConfig.currentPage = 1;


  }

  updateFilter1(event) {
    const val = event.target.value.toLowerCase();
    if (val == '') {
      this.approvedOfferLetters = [...this.approvedTemp];
    } else {
      const temp = this.approvedTemp.filter(function (d) {
        return d.employeeName.toLowerCase().indexOf(val) !== -1 || !val;
      });
      this.approvedOfferLetters = temp;
    }
    this.approvedConfig.totalItems = this.approvedOfferLetters.length;
    this.approvedConfig.currentPage = 1;
  }
  updateFilter2(event) {
    const val = event.target.value.toLowerCase();
    if (val == '') {
      this.emailSendedRecords = [...this.emailTemp];
    } else {
      const temp = this.emailTemp.filter(function (d) {
        return d.employeeName.toLowerCase().indexOf(val) !== -1 || !val;
      });
      this.emailSendedRecords = temp;
    }
    this.emailOfferLetterConfig.totalItems = this.emailSendedRecords.length;
    this.emailOfferLetterConfig.currentPage = 1;
  }

  back() {
    this.router.navigateByUrl('/dashboard');
  }

  approveOfferLetter(row) {
    Swal.fire({
      title: "Are you sure?",
      html: `Do you want to approve this offerletter of <b>` + row.employeeName + '</b>',
      showDenyButton: true,
      confirmButtonText: "Yes",
      denyButtonText: `No`
    }).then((result) => {
      if (result.isConfirmed) {
        this.spinner.show();
        this.httpPut.doPut('approveOfferletter?id=' + row.id, '').subscribe(
          (res: any) => {
            this.spinner.hide();
            if (res.status.message == 'SUCCESS') {
              Swal.fire({
                icon: 'success',
                title: 'Offer letter Approved',
                showConfirmButton: false,
              });
              this.getOfferLetters();
              row.approved = true;
              this.approvedOfferLetters.push(row);
              const index = this.offerLettersList.findIndex(item => item.id === row.id);
              const tempIndex = this.temp.findIndex(item => item.id === row.id);
              // if (tempIndex !== -1) {
              //   this.temp.splice(index, 1);
              // }
              // if (index !== -1) {
              //   this.offerLettersList.splice(index, 1);
              // }
            }
            else {
              Swal.fire({
                title: 'Error!',
                text: res.status.message,
                icon: 'warning',
                showConfirmButton: true,
              });
            }
          },
          (err) => {
            this.spinner.hide();
            Swal.fire({
              title: 'Error!',
              text: err.error.status.message,
              icon: 'error',
              showConfirmButton: true,
            });
          }
        );
      }
    });
  }
  sendEmail(row) {
    Swal.fire({
      title: "Are you sure?",
      html: `Do you want to email this offerletter to <b>` + row.employeeName + '</b>',
      showDenyButton: true,
      confirmButtonText: "Yes",
      denyButtonText: `No`
    }).then((result) => {
      if (result.isConfirmed) {
        this.spinner.show();
        this.httpPost.create('sendMail?id=' + row.id, '').subscribe(
          (res: any) => {
            this.spinner.hide();
            if (res.status.message == 'SUCCESS') {
              Swal.fire({
                icon: 'success',
                title: 'Offer letter sent successfully',
                showConfirmButton: false,
              });
              this.getOfferLetters();
              row.emailSent = true;
              this.emailSendedRecords.push(row);
              const index = this.approvedOfferLetters.findIndex(item => item.id === row.id);
              const tempIndex = this.approvedTemp.findIndex(item => item.id === row.id);
              if (tempIndex !== -1) {
                this.approvedTemp.splice(index, 1);
              }
              if (index !== -1) {
                this.approvedOfferLetters.splice(index, 1);
              }
            }
            else {
              Swal.fire({
                title: 'Error!',
                text: res.status.message,
                icon: 'warning',
                showConfirmButton: true,
              });
            }
          },
          (err) => {
            this.spinner.hide();
            Swal.fire({
              title: 'Error!',
              text: err.error.status.message,
              icon: 'error',
              showConfirmButton: true,
            });
          }
        );
      }
    });
  }

  acceptOffer(row) {
    Swal.fire({
      title: "Are you sure?",
      html: `Has the candidate accepted the offer?`,
      showDenyButton: true,
      confirmButtonText: "Yes",
      denyButtonText: `No`
    }).then((result) => {
      if (result.isConfirmed) {
        this.spinner.show();
        const obj = {
          id: row.id,
          status: 'ACCEPTED',
          reason: 'Accepted'
        }
        this.httpPut.doPut('offerletterstatus?id=' + obj.id + '&status=' + obj.status, '').subscribe(
          (res: any) => {
            this.spinner.hide();
            const record = this.emailSendedRecords.find(x => x.id === row.id);
            if (record) {
              record.status = res.response.status;
            }
            this.getOfferLetters();
            if (res.status.message == 'SUCCESS') {
              Swal.fire({
                icon: 'success',
                title: 'Offer letter Accepted',
                showConfirmButton: false,
              });

            }
            else {
              Swal.fire({
                title: 'Error!',
                text: res.status.message,
                icon: 'warning',
                showConfirmButton: true,
              });
            }
          },
          (err) => {
            this.spinner.hide();
            Swal.fire({
              title: 'Error!',
              text: err.error.status.message,
              icon: 'error',
              showConfirmButton: true,
            });
          }
        );
      }
    });
  }

  rejectOffer(row) {
    Swal.fire({
      title: "Are you sure?",
      html: `Has the candidate rejected the offer?`,
      showDenyButton: true,
      confirmButtonText: "Yes",
      denyButtonText: `No`
    }).then((result) => {
      if (result.isConfirmed) {
        this.showInputPrompt(row);
      }
    })
  }

  async showInputPrompt(row) {
    const { value: inputValue } = await Swal.fire({
      title: 'Reason',
      input: 'text',
      inputLabel: 'Reason for reject',
      inputPlaceholder: 'Enter the reason',
      inputAttributes: {
        autocapitalize: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Submit',
      cancelButtonText: 'Cancel',
      inputValidator: (value) => {
        if (!value) {
          return 'You need to enter the reason for rejection!';
        }
      }
    });
    if (inputValue) {
      this.spinner.show();
      const obj = {
        id: row.id,
        status: 'REJECTED',
        reason: inputValue
      }
      this.httpPut.doPut('offerletterstatus?id=' + obj.id + '&status=' + obj.status + '&reason=' + obj.reason, '').subscribe(
        (res: any) => {
          this.spinner.hide();
          const record = this.emailSendedRecords.find(x => x.id === row.id);
          if (record) {
            record.status = res.response.status;
          }
          const fl = this.offerLettersList.find(x => x.id === row.id);
          if (fl) {
            fl.status = res.response.status;
          }
          this.getOfferLetters();
          if (res.status.message == 'SUCCESS') {
            Swal.fire({
              icon: 'success',
              title: 'Offer letter Rejected',
              showConfirmButton: false,
            });
          }
          else {
            Swal.fire({
              title: 'Error!',
              text: res.status.message,
              icon: 'warning',
              showConfirmButton: true,
            });
          }
        },
        (err) => {
          this.spinner.hide();
          Swal.fire({
            title: 'Error!',
            text: err.error.status.message,
            icon: 'error',
            showConfirmButton: true,
          });
        }
      );
    }
  }
}

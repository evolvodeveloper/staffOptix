import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { forkJoin } from 'rxjs';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';
import { HttpPostService } from 'src/app/services/http-post.service';
import { HttpPutService } from 'src/app/services/http-put.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-attendance-model',
  templateUrl: './attendance-model.component.html',
  styleUrls: ['./attendance-model.component.scss']
})
export class AttendanceModelComponent implements OnInit {
  @Input() public attendDetails;
  rows: any;
  leaveTypeCodes = [];
  attendStatus = ['Full Day', 'Half Day']
  assignStatus: string;
  shifts = [];
  shiftCode: string;
  userComments: string = '';
  leaveCode: string;
  dateFormat: string;
  source: string;
  // dataObj = {
  //   date: null,
  //   alreadyInShift: false,
  //   employeeCode: null,
  //   employeeName: null,
  //   status: null,
  //   deptCode: null,
  //   shift: null,
  // };
  constructor(public activeModal: NgbActiveModal,
    private httpPut: HttpPutService,
    private httpGet: HttpGetService,
    public global: GlobalvariablesService,
    private spinner: NgxSpinnerService,
    private httpPost: HttpPostService

  ) { }
  ngOnInit() {
    this.getShifts();
    this.getleaveType();
    this.dateFormat = this.global.dateFormat;
    // this.row = this.attendDetails.details[0];
    this.rows = this.attendDetails.details;

    this.source = this.attendDetails.source
    this.shiftCode = this.rows[0].data.shift
    // this.dataObj = {
    //   date: this.row.date,
    //   alreadyInShift: false,
    //   employeeCode: this.row.employeeCode,
    //   employeeName: this.row.employeeName,
    //   status: null,
    //   deptCode: this.row,
    //   shift: this.row.shift
    // };
  }
  closeModal(sendData) {
    this.activeModal.close(sendData);
  }

  getShifts() {
    this.httpGet.getMasterList('shifts/active').subscribe(
      (res: any) => {
        res.response.sort((a, b) => {
          return a.shiftId - b.shiftId
        });
        this.shifts = res.response;
      },
      err => {
        console.error(err.error.status.message);
      }
    );
  }
  getleaveType() {
    this.httpGet.getMasterList('leavetypes').subscribe(
      (res: any) => {
        this.leaveTypeCodes = res.response;
      },
      err => {
        console.error(err.error.status.message);

      }
    );
  }


  // submit() {
  //   // if (this.shiftCode !== null) {
  //     if (this.row.data.shift !== this.shiftCode) {
  //       this.assignShift(this.row.data)
  //     }
  //     else {
  //       this.assignAttendanceFun(this.row.data);
  //     }
  //   // } else {
  //   //   Swal.fire({
  //   //     icon: 'info',
  //   //     title: 'Please Select a Shift ',
  //   //   });
  //   // }
  // }
  async modifyData(source) {
    if (source === 'attendance') {
      await this.assignAttendanceFun();
      // this.rows.forEach(async element => {
      // });
      // this.sweetAlert_topEnd('success', 'Attendance Modified');
      // this.closeModal(this.rows[0])


    } else if (source === 'Leave') {
      await this.assignAttendanceFunForLeave();
      // this.rows.forEach(async element => {
      // });
      // this.sweetAlert_topEnd('success', 'Attendance Modified');
      // this.closeModal(this.rows[0])
    }
  }

  assignAttendanceFun() {
    this.spinner.show();
    const requests = [];
    this.rows.forEach(element => {
      const request = this.httpPut.doPut(
        'emp/timesheet?empCode=' + element.data.employeeCode + '&date=' + element.data.date + '&shift=' + this.shiftCode
        + '&status=' + this.assignStatus + '&userComments=' + this.userComments, ''
      );
      requests.push(request);

    });
    forkJoin(requests).subscribe(
      (responses: any[]) => {
        this.spinner.hide();
        let success = true;
        let errorMessage = '';

        // Check the responses for success or failure
        responses.forEach(res => {
          if (res.status.message != 'SUCCESS') {
            success = false;
            errorMessage = res.status.message;
          }
        });

        // Show appropriate alert based on the result
        if (success) {
          this.sweetAlert_topEnd('success', 'Attendance Modified');
          this.closeModal(requests[0])
          // Optionally close modals or perform additional actions
        } else {
          Swal.fire({
            title: 'Error!',
            text: errorMessage,
            icon: 'warning',
            showConfirmButton: true,
          });
        }
      },
      (err) => {
        this.spinner.hide();
        this.sweetAlert_topEnd('error', err.error.status.message);
      }
    );
  }
  assignAttendanceFunForLeave() {
    if (this.leaveCode !== null) {
      this.spinner.show();
      const requests = [];
      this.rows.forEach(element => {
        const request = this.httpPut.doPut('emp/timesheet?empCode=' + element.data.employeeCode + '&date=' + element.data.date + '&leaveTypeCode=' + this.leaveCode
          + '&status=Leave' + '&userComments=' + this.userComments, '');
        requests.push(request);
      });
      forkJoin(requests).subscribe(
        (responses: any[]) => {
          this.spinner.hide();
          let success = true;
          let errorMessage = '';

          // Check the responses for success or failure
          responses.forEach(res => {
            if (res.status.message != 'SUCCESS') {
              success = false;
              errorMessage = res.status.message;
            }
          });

          // Show appropriate alert based on the result
          if (success) {
            this.sweetAlert_topEnd('success', 'Attendance Modified');
            this.closeModal(requests[0])
            // Optionally close modals or perform additional actions
          } else {
            Swal.fire({
              title: 'Error!',
              text: errorMessage,
              icon: 'warning',
              showConfirmButton: true,
            });
          }
        },
        (err) => {
          this.spinner.hide();
          this.sweetAlert_topEnd('error', err.error.status.message);
        }
      );
    }
    else {
      Swal.fire({
        icon: 'info',
        title: 'Select Leave type',
        timer: 5000,
      });
    }
  }

  // assignShift(obj) {
  //   const sendingObj = {
  //     employeeName: obj.employeeName,
  //     employeeCode: obj.employeeCode,
  //     deptCode: obj.deptCode,
  //     shiftCode: this.shiftCode,
  //     startDate: obj.date,
  //     endDate: obj.date
  //   }
  //   this.spinner.show();
  //   this.httpPost.shiftAssignment([sendingObj]).subscribe(
  //     (res: any) => {
  //       this.spinner.hide();
  //       if (res.status.message == 'SUCCESS') {
  //         this.sweetAlert_topEnd('success', 'Shift Assigned!');
  //         this.assignAttendanceFun(this.row.data);

  //       }

  //       else {
  //         Swal.fire({
  //           title: 'Error!',
  //           text: res.status.message,
  //           icon: 'warning',
  //           showConfirmButton: true,
  //         });
  //       }

  //     },
  //     (err) => {
  //       this.spinner.hide();
  //       this.sweetAlert_topEnd('error', err.error.status.message);
  //     }
  //   );
  // }
  sweetAlert_topEnd(icon, title) {
    Swal.fire({
      icon: icon,
      title: title,
      showConfirmButton: false,
      timer: 5000,
    });
  }
}

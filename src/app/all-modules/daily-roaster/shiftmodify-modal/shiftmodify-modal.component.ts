import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { HttpGetService } from 'src/app/services/http-get.service';
import { HttpPostService } from 'src/app/services/http-post.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-shiftmodify-modal',
  templateUrl: './shiftmodify-modal.component.html',
  styleUrls: ['./shiftmodify-modal.component.scss']
})
export class ShiftmodifyModalComponent implements OnInit {
  @Input() public empShiftData;
  // data = [];
  shiftCode: string;
  modified = false;
  shifts = [];
  data = [];
  sortOrder = 'asc';
  sortColumn = 'employeeCode';
  modifiedObj = [];
  constructor(public activeModal: NgbActiveModal,
    private httpGet: HttpGetService,
    private spinner: NgxSpinnerService,
    private httpPost: HttpPostService

  ) { }
  ngOnInit(): void {
    this.modifiedObj = [];
    this.getShifts();
    this.empShiftData.userProfile.forEach(element => {
      this.data.push(element.data)
    });
    const sortedData = this.data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const groupRecords = (records) => {
      const result = [];
      let currentGroup = null;
      records.forEach((record) => {
        if (!currentGroup || currentGroup.employeeName !== record.empName) {
          // Start a new group
          const row = result.find(x => x.employeeCode == record.employeeCode)
          if (row) {
            const presentdate = new Date(record.date).getTime();
            const preTime = new Date(row.endDate).getTime() + 24 * 60 * 60 * 1000;
            if (preTime !== presentdate) {
              currentGroup = {
                employeeName: record.empName,
                employeeCode: record.employeeCode,
                deptCode: record.deptCode,
                shiftCode: record.shiftCode,
                startDate: record.date,
                endDate: record.date,
              };
              result.push(currentGroup);
            }

          } else {
            currentGroup = {
              employeeName: record.empName,
              employeeCode: record.employeeCode,
              deptCode: record.deptCode,
              shiftCode: record.shiftCode,
              startDate: record.date,
              endDate: record.date,
            };
            result.push(currentGroup);
          }
        }
      });

      return result;
    };
    const groupedObjects = groupRecords(sortedData);

    groupedObjects.forEach(x => {
      x.endDate = this.checkEndDate(x)
    })
    const filteredData = removeDuplicateRecords(groupedObjects);
    this.modifiedObj = filteredData



    groupedObjects.forEach(x => {
      let cureentIndex = null;
      if (!cureentIndex || cureentIndex.employeeName !== x.empName) {
        cureentIndex = {
          employeeName: x.empName,
          employeeCode: x.employeeCode,
          deptCode: x.deptCode,
          shiftCode: x.shiftCode,
          startDate: x.startDate,
          endDate: x.endDate
        }
      }
      // if ()
    })

    function removeDuplicateRecords(records) {
      const uniqueRecords = [];

      records.forEach((currentRecord) => {
        const isDuplicate = uniqueRecords.some((existingRecord) => {
          return (
            currentRecord.employeeCode === existingRecord.employeeCode &&
            currentRecord.endDate === existingRecord.endDate
          );
        });

        if (!isDuplicate) {
          uniqueRecords.push(currentRecord);
        }
      });

      return uniqueRecords;
    }
    // const filteredFinal = removeDuplicateRecords(groupedObjects);
  }

  checkEndDate(col) {
    const row = [];
    this.data.forEach(x => {
      if (col.employeeCode == x.employeeCode) {
        row.push(x)
      }
    })
    const consecutiveDates = this.getConsecutiveDates(col.startDate, row);
    const highDate = Math.max(...consecutiveDates.map(entry => new Date(entry.date).getTime()));
    return moment(highDate).format('YYYY-MM-DD')


  }

  getConsecutiveDates(startDate, dataArray) {
    const startDateMillis = new Date(startDate).getTime();
    let currentDateMillis = startDateMillis;
    const result = [];
    dataArray.forEach(element => {
      const entryDateMillis = new Date(element.date).getTime();
      if (entryDateMillis == currentDateMillis) {
        result.push(element);
        currentDateMillis += 24 * 60 * 60 * 1000; // Move to the next day
      }
    });
    return result;
  }


  getShifts() {
    this.spinner.show();
    this.httpGet.getMasterList('shifts/active').subscribe(
      (res: any) => {
        this.shifts = res.response;
        this.spinner.hide();
      },
      (err) => {
        this.spinner.hide();

        console.error(err);
      }
    );
  }
  shifytChanged() {
    this.modified = true;
    this.modifiedObj.forEach(x => {
      x.shiftCode = this.shiftCode;
    })
  }

  submit() {
    this.spinner.show();
    this.httpPost.shiftAssignment(this.modifiedObj).subscribe(
      (res: any) => {
        this.spinner.hide();
        if (res.status.message == 'SUCCESS') {
          this.sweetAlert_topEnd('success', 'Shift Assigned!');
          this.activeModal.close();
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
        this.sweetAlert_topEnd('error', err.error.status.message);
      }
    );
  }
  sweetAlert_topEnd(icon, title) {
    Swal.fire({
      icon: icon,
      title: title,
      showConfirmButton: false,
      timer: 5000,
    });
  }

  closeModal(sendData) {
    this.activeModal.close(sendData);
  }
  sortData(col: string): void {
    if (this.sortColumn === col) {
      if (this.sortOrder === 'asc') {
        this.sortOrder = 'desc';
      }
      else {
        this.sortOrder = 'asc';
      }
    }
    else {
      this.sortColumn = col;
      this.sortOrder = 'asc';
    }
    this.modifiedObj = this.modifiedObj.sort((a, b) => {
      if (a[col] < b[col]) {
        return this.sortOrder === 'asc' ? -1 : 1;
      }
      if (a[col] > b[col]) {
        return this.sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }
  // markWeekoffFunction() {
  //   Swal.fire({
  //     title: "Are you sure?",
  //     html: `Do you want to mark week off for <b>` + this.hoveredItem[0].data.employeeName + '</b>',
  //     showDenyButton: true,
  //     confirmButtonText: "Yes",
  //     denyButtonText: `No`
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       this.spinner.show();
  //       this.httpPut.doPut('emp/timesheet?empCode=' + this.hoveredItem[0].data.employeeCode + '&date=' + this.hoveredItem[0].data.date + '&shift='
  //         + '&status=Week Off', '').subscribe(
  //           (res: any) => {
  //             this.spinner.hide();
  //             if (res.status.message == 'SUCCESS') {
  //               this.sweetAlert_topEnd('success', 'Attendance Modified');
  //               this.rows = [];
  //               this.hideDetails();
  //               this.getDailyRoaster();
  //             }
  //             else {
  //               Swal.fire({
  //                 title: 'Error!',
  //                 text: res.status.message,
  //                 icon: 'warning',
  //                 showConfirmButton: true,
  //               });
  //             }
  //           },
  //           (err) => {
  //             this.spinner.hide();
  //             this.sweetAlert_topEnd('error', err.error.status.message);
  //           }
  //         );
  //     }
  //   });
  // }

}

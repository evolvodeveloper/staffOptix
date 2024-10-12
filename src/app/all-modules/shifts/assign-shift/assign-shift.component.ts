import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subject } from 'rxjs';

import { takeUntil } from 'rxjs/operators';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';
import { HttpPostService } from 'src/app/services/http-post.service';
import { HttpPutService } from 'src/app/services/http-put.service';
import { UtilService } from 'src/app/services/util.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-assign-shift',
  templateUrl: './assign-shift.component.html',
  styleUrls: ['./assign-shift.component.scss'],
})
export class AssignShiftComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();

  categorysList = [];
  shiftAssignmentForm: FormGroup;
  emplist = [];
  shifts = [];
  records = [];
  modifiedRecord = [];
  // temp = [];
  updatingRow: any;
  alreadyAssignedEmpRecords = [];
  departments_list = [];
  shiftassignmentsList = [];
  Designations: any;
  tomorrow: any;
  checkedAll = false;
  update = false;
  dateFormat: string;
  view = false;
  Departments: any;
  constructor(
    private httpGetService: HttpGetService,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private router: Router,
    private global: GlobalvariablesService,
    private utilServ: UtilService,
    private httpPut: HttpPutService,
    private httpPost: HttpPostService
  ) { }
  canLeave(): boolean {
    if (this.shiftAssignmentForm.dirty) {
      Swal.fire({
        text: 'Oops! you have unsaved changes on this page',
        icon: 'info',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Stay',
        cancelButtonText: 'Leave',
      }).then((result) => {
        if (result.isConfirmed) {
          return true;
        } else if (result.isDismissed) {
          this.shiftAssignmentForm.reset();
          this.cancel();
        }
      })
      return false
    } else {
      return true;
    }
    // return window.confirm('Oops! you have unsaved changes on this page')
  }
  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    if (val == '') {
      this.modifiedRecord = [...this.emplist];
    } else {
      const temp = this.emplist.filter(function (d) {
        return (d.employeeName && d.employeeName.toLowerCase().indexOf(val) !== -1) || (d.employeeCode && d.employeeCode.toLowerCase().indexOf(val) !== -1) || !val;
      });
      this.modifiedRecord = temp;
    }
  }

  ngOnInit() {
    this.getDepartments();
    this.shiftAssignmentForm = this.fb.group({
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
      employeeCode: [[]],
      employeeName: [null],
      deptCode: [null, Validators.required],
      shiftCode: [null, Validators.required],
    });
    this.getShifts();
    if (!this.utilServ.editData) {
      const tmr = moment().add(1, 'day');
      this.tomorrow = tmr.format('YYYY-MM-DD');
      this.shiftAssignmentForm.controls.startDate.setValue(this.tomorrow);
      this.shiftAssignmentForm.controls.endDate.setValue(moment().endOf('year').format('YYYY-MM-DD'));

    }
    else {
      const tmr = moment().add(1, 'day');
      this.tomorrow = tmr.format('YYYY-MM-DD');
      const todaysDate: any = new Date();
      const startDate: any = new Date(this.utilServ.editData.startDate)
      const timeDifference = startDate - todaysDate;
      const daysDifference = timeDifference / (1000 * 3600 * 24);
      if (daysDifference > 0) {
        this.shiftAssignmentForm.controls.startDate.enable()
      }
      else {
        this.shiftAssignmentForm.controls.startDate.disable()
      }
    }
    this.init();
  }
  init() {
    if (this.utilServ.viewData) {
      this.view = true;
      this.update = false;
      this.shiftAssignmentForm.controls.startDate.setValue(
        this.utilServ.viewData.startDate
      );
      this.shiftAssignmentForm.controls.endDate.setValue(
        this.utilServ.viewData.endDate
      );
      this.shiftAssignmentForm.controls.employeeCode.setValue(
        this.utilServ.viewData.employeeCode
      );
      this.shiftAssignmentForm.controls.deptCode.setValue(
        this.utilServ.viewData.deptCode
      );
      this.shiftAssignmentForm.controls.shiftCode.setValue(
        this.utilServ.viewData.shiftCode
      );
      this.shiftAssignmentForm.disable();
    } else if (this.utilServ.editData) {
      this.update = true;
      this.view = false;

      this.updatingRow = (this.utilServ.editData)
      this.shiftAssignmentForm.controls.startDate.setValue(
        this.utilServ.editData.startDate
      );
      this.shiftAssignmentForm.controls.endDate.setValue(
        this.utilServ.editData.endDate
      );
      this.shiftAssignmentForm.controls.employeeCode.setValue(
        this.utilServ.editData.employeeCode
      );
      this.shiftAssignmentForm.controls.employeeName.setValue(
        this.utilServ.editData.employeeName
      );

      this.shiftAssignmentForm.controls.projectCode.setValue(
        this.utilServ.editData.projectCode
      );
      this.shiftAssignmentForm.controls.shiftCode.setValue(
        this.utilServ.editData.shiftCode
      );
      this.shiftAssignmentForm.enable();

    }
  }
  getDepartments() {
    this.spinner.show();
    this.httpGetService.getMasterList('depts/active').pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      if (res.response.length > 0) {
        res.response.unshift({
          deptCode: 'ALL',
          deptName: 'ALL'
        })
      }
      this.spinner.hide();
      this.departments_list = res.response;
      if (!this.utilServ.viewData && !this.utilServ.editData) {
        this.shiftAssignmentForm.controls.deptCode.setValue(res.response[0].deptCode);
      }
      this.getEmps();
    },
      err => {
        this.spinner.hide();
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: err.error.status.message,
        })
      }
    );
  }
  getShifts() {
    this.spinner.show();
    this.httpGetService.getMasterList('shifts/active').pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (res: any) => {
        res.response.sort((a, b) => {
          return a.shiftId - b.shiftId
        });
        this.shifts = res.response;
        this.spinner.hide();

        if (res.response.length == 1) {
          this.shiftAssignmentForm.controls.shiftCode.setValue(res.response[0].shiftCode);
          // this.getByShiftCodeAndProjectCode();
        }
        else {
          const row = res.response.find((x) => x.isdefault == true);
          if (row) {
            this.shiftAssignmentForm.controls.shiftCode.setValue(row?.shiftCode);
            // this.getByShiftCodeAndProjectCode();

          }
          else {
            this.shiftAssignmentForm.controls.shiftCode.setValue(res.response[0].shiftCode);
            // this.getByShiftCodeAndProjectCode();
          }
        }
      },
      err => {
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

  getEmps() {
    this.emplist = [];
    this.spinner.show();
    this.httpGetService.getEmployeesByDepartment(this.shiftAssignmentForm.controls.deptCode.value).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      this.spinner.hide();
      this.emplist = res.response;
      this.getByShiftCodeAndProjectCode();

    },
      err => {
        this.spinner.hide();
        Swal.fire({
          title: 'Error!',
          text: err.error.status.message,
          icon: 'error',
        });
      })
  }

  getByShiftCodeAndProjectCode() {
    this.modifiedRecord = [];
    this.records = [];
    this.shiftAssignmentForm.controls.employeeCode.value.length = 0;
    if (this.shiftAssignmentForm.controls.shiftCode.value) {
      this.spinner.show();
      this.httpGetService.getMasterList('shiftAssignment?startdate=' + this.shiftAssignmentForm.controls.startDate.value).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
          this.spinner.hide();
        this.records = res.response;
          for (const row of this.emplist) {
            row.endDate = null, row.startDate = null, row.shiftCode = null;
            for (const record of this.records) {
              if (row.employeeCode == record.employeeCode) {
                row.shiftCode = record.shiftCode,
                  row.checked = false,
                  row.startDate = record.startDate,
                  row.endDate = record.endDate
              }
            }
          }
        this.modifiedRecord = this.emplist;
          this.dateFormat = this.global.dateFormat;
        },
          err => {
            this.spinner.hide();
            Swal.fire({
              title: 'Error!',
              text: err.error.status.message,
              icon: 'error',
            });
          })
    }
  }


  cancel() {
    this.router.navigateByUrl('/assignshifts');
  }
  selectAllEmps(event) {
    this.checkedAll = event.target.checked;
    if (this.checkedAll) {
      this.shiftAssignmentForm.controls.employeeCode.setValue([]);
      this.modifiedRecord.forEach(x => {
        x.checked = true;
        this.shiftAssignmentForm.controls.employeeCode.value.push({
          employeeCode: x.employeeCode,
          employeeName: x.employeeName,
          deptCode: x.deptCode,
        });
      })
    } else {
      this.modifiedRecord.forEach((x) => {
        x.checked = false;
      })
      this.shiftAssignmentForm.controls.employeeCode.setValue([]);
    }
    // if (this.checkedAll)
    // this.modifiedRecord.forEach(x=> x.checked == true)
  }

  selectedEmp(val, emps) {
    // if (val.target.checked == true) {
    emps.checked = true;
    const index = this.shiftAssignmentForm.controls.employeeCode.value.findIndex(
      (d) => d.employeeCode == emps.employeeCode
    );
    if (index > -1) {
      this.shiftAssignmentForm.controls.employeeCode.value.splice(index, 1);
    }
    else {
      this.shiftAssignmentForm.controls.employeeCode.value.push({
        employeeCode: emps.employeeCode,
        employeeName: emps.employeeName,
        deptCode: emps.deptCode,
      });
    }
  }
  create() {
    this.spinner.show();
    const obj = [];
    if (this.shiftAssignmentForm.value.employeeCode.length > 0) {
      this.shiftAssignmentForm.value.employeeCode.forEach((element) => {
        obj.push({
          employeeCode: element.employeeCode,
          employeeName: element.employeeName,
          endDate: this.shiftAssignmentForm.value.endDate,
          deptCode: element.deptCode,
          shiftCode: this.shiftAssignmentForm.value.shiftCode,
          startDate: this.shiftAssignmentForm.value.startDate,
        });
      });


      this.httpPost.shiftAssignment(obj).subscribe(
        (res: any) => {
          this.spinner.hide();
          if (res.status.message == 'SUCCESS') {
            this.sweetAlert_topEnd('success', 'Shift Assigned!');
            this.shiftAssignmentForm.reset();
            this.router.navigateByUrl('/assignshifts');
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
    else {
      this.spinner.hide();
      this.sweetAlert_topEnd('warning', 'Please Select Employees')
    }
  }

  Update() {
    const obj = {
      shiftId: this.utilServ.editData.shiftId,
      employeeCode: this.shiftAssignmentForm.value.employeeCode,
      employeeName: this.shiftAssignmentForm.value.employeeName,
      endDate: this.shiftAssignmentForm.value.endDate,
      projectCode: this.shiftAssignmentForm.value.projectCode,
      shiftCode: this.shiftAssignmentForm.value.shiftCode,
      startDate: this.shiftAssignmentForm.value.startDate,
      branchCode: this.utilServ.editData.branchCode,
      companyCode: this.utilServ.editData.companyCode,
      createdby: this.utilServ.editData.createdby,
      createddate: this.utilServ.editData.createddate,
      divisionCode: this.utilServ.editData.divisionCode,
    }
    this.httpPut.doPut('shiftassignment', obj).subscribe(
      (res: any) => {
        this.spinner.hide();
        if (res.status.message == 'SUCCESS') {
          this.sweetAlert_topEnd('success', 'Shift Assigned!');
          this.shiftAssignmentForm.reset();
          this.router.navigateByUrl('/assignshifts');
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
      })
  }


  sweetAlert_topEnd(icon, title) {
    Swal.fire({
      icon: icon,
      title: title,
      showConfirmButton: false,
      timer: 5000,
    });
  }
  ngOnDestroy() {
    this.utilServ.editData = null;
    this.utilServ.viewData = null;
    this.ngUnsubscribe.unsubscribe();
  }
}

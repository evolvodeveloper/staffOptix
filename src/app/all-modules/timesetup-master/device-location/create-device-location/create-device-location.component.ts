import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subject, takeUntil } from 'rxjs';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';
import { HttpPostService } from 'src/app/services/http-post.service';
import { HttpPutService } from 'src/app/services/http-put.service';
import { UtilService } from 'src/app/services/util.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create-device-location',
  templateUrl: './create-device-location.component.html',
  styleUrls: ['./create-device-location.component.scss']
})
export class CreateDeviceLocationComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  deviceLocationForm: FormGroup;
  deviceAccessForm: FormGroup;
  activeOfficeLocations = [];
  view = false;
  departments_list = [];
  payrollEmplist = [];
  update = false;
  constructor(private fb: FormBuilder,
    private httpPost: HttpPostService,
    private httpPut: HttpPutService,
    private acRoute: ActivatedRoute,
    private httpGet: HttpGetService,
    private router: Router,
    private utilServ: UtilService,
    private globalServ: GlobalvariablesService,
    private spinner: NgxSpinnerService,
  ) { }
  ngOnInit() {

    this.deviceLocationForm = this.fb.group({
      deviceLocCode: [null, [Validators.required, this.httpPost.customValidator()]],
      description: [null],
      restricted: [false],
      locationCode: [null],
      isactive: [true],
    })

    this.deviceAccessForm = this.fb.group({
      employeeCodes: this.fb.array([]),
    });
    this.getLocations();
    this.getPayrollEmps();
    this.init();
  }
  get employeeCodes(): FormArray {
    return this.deviceAccessForm.get('employeeCodes') as FormArray;
  }

  isEmployeeSelected(employee): boolean {
    return this.employeeCodes.controls.some(
      (control) => control.value.employeeCode === employee.employeeCode
    );
  }

  toggleEmployeeSelection(employee): void {
    const index = this.employeeCodes.controls.findIndex(
      (control) => control.value.employeeCode === employee.employeeCode
    );
    if (index >= 0) {
      if (employee.recordAlreadyExits == null && employee.accessDenied == false) {
        this.employeeCodes.removeAt(index);
      }
      else if (employee.accessDenied == true) {
        const found = this.employeeCodes.value.find(x => x.employeeCode == employee.employeeCode)
        if (found) {
          employee.accessDenied = false,
            found.accessDenied = false
        }
      }
      else {
        const found = this.employeeCodes.value.find(x => x.employeeCode == employee.employeeCode)
        if (found) {
          employee.accessDenied = true,
            found.accessDenied = true
        }
      }
    } else {
      this.employeeCodes.push(
        this.fb.group({
          buCode: employee.recordAlreadyExits == true ? employee.buCode : null,
          createdby: employee.recordAlreadyExits == true ? employee.createdby : null,
          createddate: employee.recordAlreadyExits == true ? employee.createddate : null,
          deviceLocCode: employee.recordAlreadyExits == true ? employee.deviceLocCode : null,
          id: employee.recordAlreadyExits == true ? employee.id : null,
          lastmodifiedby: employee.recordAlreadyExits == true ? employee.lastmodifiedby : null,
          lastmodifieddate: employee.recordAlreadyExits == true ? employee.lastmodifieddate : null,
          tenantCode: employee.recordAlreadyExits == true ? employee.tenantCode : null,
          employeeCode: employee.employeeCode,
          employeeName: employee.employeeName,
          recordAlreadyExits: employee.recordAlreadyExits,
          accessDenied: false,
        })
      );
    }
  }

  init() {
    if (this.utilServ.viewData) {
      this.view = true; this.update = false;
      this.deviceAccessForm.disable(); this.deviceLocationForm.disable();
      this.deviceLocationForm.controls.deviceLocCode.setValue(this.utilServ.viewData.deviceLocCode),
        this.deviceLocationForm.controls.description.setValue(this.utilServ.viewData.description),
        this.deviceLocationForm.controls.restricted.setValue(this.utilServ.viewData.restricted),
        this.deviceLocationForm.controls.locationCode.setValue(this.utilServ.viewData.locationCode),
        this.deviceLocationForm.controls.isactive.setValue(this.utilServ.viewData.isactive)
      // this.deviceAccessForm.controls.employeeCodes.setValue(this.utilServ.viewData.locationAccess)
      // this.modifyLocationAccessObj(this.utilServ.viewData);

      // this.checkThePreAccessedEmp(this.utilServ.viewData);
    }
    else if (this.utilServ.editData) {
      this.deviceLocationForm.controls.deviceLocCode.setValue(this.utilServ.editData.deviceLocCode),
        this.deviceLocationForm.controls.description.setValue(this.utilServ.editData.description),
        this.deviceLocationForm.controls.restricted.setValue(this.utilServ.editData.restricted),
        this.deviceLocationForm.controls.locationCode.setValue(this.utilServ.editData.locationCode),
        this.deviceLocationForm.controls.isactive.setValue(this.utilServ.editData.isactive);
      // this.deviceAccessForm.controls.employeeCodes.setValue(this.utilServ.editData.locationAccess)

      this.view = false; this.update = true;
      this.deviceAccessForm.enable(); this.deviceLocationForm.enable();
      // this.modifyLocationAccessObj(this.utilServ.editData);
    }
  }
  checkThePreAccessedEmp(data) {

    data.locationAccess.forEach((apiEmployee) => {
      const employee = this.payrollEmplist.find(
        (emp) => emp.employeeCode === apiEmployee.employeeCode
      );
      if (employee) {
        employee.recordAlreadyExits = true;
        apiEmployee.employeeName = employee.employeeName;
        apiEmployee.recordAlreadyExits = true;
        this.toggleEmployeeSelection(apiEmployee);
      }
    });
    // data.locationAccess.forEach(element => {
    //   const foundEmployee = this.payrollEmplist.find(x => (x.employeeCode == element.employeeCode))
    //   if (foundEmployee) {
    //     // If a matching employee is found, update properties
    //     element.employeeName = foundEmployee.employeeName;
    //     foundEmployee.checked = true;
    //   }
    // });
    // this.deviceAccessForm.controls.employeeCode.setValue(data.locationAccess)

  }
  checkIsRestrict() {
    if (this.deviceLocationForm.controls.restricted.value == false) {
      this.deviceAccessForm.controls.employeeCodes.value.length = 0
    }
  }
  cancel() {
    this.router.navigateByUrl('timesetup/deviceLocation');
    this.utilServ.editData = null;
    this.utilServ.viewData = null;
  }
  selectedEmp(val, emps) {
    const index = this.deviceAccessForm.controls.employeeCodes.value.findIndex(
      (d) => d.employeeCode == emps.employeeCode
    );
    if (index > -1) {
      this.deviceAccessForm.value.employeeCodes.splice(index, 1);
      this.payrollEmplist.find(x => { if (x.employeeCode == emps.employeeCode) { x.checked = false } })
    }
    else {
      this.deviceAccessForm.controls.employeeCodes.value.push({
        employeeCode: emps.employeeCode,
        employeeName: emps.employeeName,
        deptCode: emps.deptCode,
      });
      this.payrollEmplist.find(x => { if (x.employeeCode == emps.employeeCode) { x.checked = true } })

    }
  }
  getLocations() {
    this.httpGet.getMasterList('officeLocations/active').subscribe((res: any) => {
      this.activeOfficeLocations = res.response;
      const row = res.response.find(x => x.isDefault == true);
      if (row && !this.update && !this.view) {
        this.deviceLocationForm.controls.locationCode.setValue(row.locationCode)
      }
    },
      err => {
        console.error(err.error.status.message);
      })
  }
  getPayrollEmps() {
    this.payrollEmplist = [];
    this.spinner.show();
    this.httpGet.getMasterList('payroll/all').pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      res.response.map(x => x.checked = false)
      this.payrollEmplist = res.response;
      if (this.utilServ.editData) {
        this.checkThePreAccessedEmp(this.utilServ.editData);
      } else if (this.utilServ.viewData) {
        this.checkThePreAccessedEmp(this.utilServ.viewData);
      }
      this.spinner.hide();
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


  viewData(row) {
    this.utilServ.viewData = row; this.router.navigateByUrl('timesetup/deviceLocation/add_deviceLoc');
  }
  editData(row) {
    this.utilServ.editData = row;
    this.router.navigateByUrl('timesetup/deviceLocation/add_deviceLoc');
  }
  create() {
    this.router.navigateByUrl('timesetup/deviceLocation/add_deviceLoc');
  }
  checkTxt() {
    return this.deviceLocationForm.get('deviceLocCode').setValue(this.globalServ.checkAndRemoveSpecialCharacters(this.deviceLocationForm.controls.deviceLocCode.value), { emitEvent: false });
  }

  submit() {
    this.spinner.show();
    const locationAccess = [];
    if (this.deviceLocationForm.controls.restricted.value == true) {
      this.deviceAccessForm.controls.employeeCodes.value.forEach(element => {
        locationAccess.push({
          employeeCode: element.employeeCode,
          "deviceLocCode": this.deviceLocationForm.controls.deviceLocCode.value,
        })
      })
    }
    this.deviceLocationForm.get('deviceLocCode').setValue(this.globalServ.checkAndRemoveSpecialCharacters(this.deviceLocationForm.controls.deviceLocCode.value), { emitEvent: false });
    const obj = {
      "deviceLocCode": this.deviceLocationForm.controls.deviceLocCode.value,
      "description": this.deviceLocationForm.controls.description.value,
      "restricted": this.deviceLocationForm.controls.restricted.value,
      "locationCode": this.deviceLocationForm.controls.locationCode.value,
      "isactive": this.deviceLocationForm.controls.isactive.value,
      locationAccess
    }
    this.httpPost.create('deviceloc/locAccess', obj).subscribe((res: any) => {
      this.spinner.hide();
      if (res.status.message == 'SUCCESS') {
        Swal.fire({
          title: 'Success!',
          text: this.deviceLocationForm.controls.deviceLocCode.value + ' Created',
          icon: 'success',
          timer: 10000,
        }).then(() => {
          this.deviceLocationForm.reset();
          this.deviceAccessForm.reset();
          this.utilServ.devicelocationListBackup = [];
          this.deviceLocationForm.controls.isactive.setValue(true);

        });
      } else {
        Swal.fire({
          title: 'Error!',
          text: res.status.message,
          icon: 'warning', showConfirmButton: true,
        });
      }
    },
      (err) => {
        this.spinner.hide();
        Swal.fire({
          title: 'Error!',
          text: err.error.status.message,
          icon: 'error',
        });
      }
    );
  }
  Update() {
    this.spinner.show();
    const obj = {
      description: this.deviceLocationForm.controls.description.value,
      branchCode: this.utilServ.editData.branchCode,
      companyCode: this.utilServ.editData.companyCode,
      deviceLocCode: this.deviceLocationForm.controls.deviceLocCode.value,
      id: this.utilServ.editData.id,
      isactive: this.deviceLocationForm.controls.isactive.value,
      locationCode: this.deviceLocationForm.controls.locationCode.value,
      restricted: this.deviceLocationForm.controls.restricted.value,
      locationAccess: this.employeeCodes.value
    }
    this.httpPut.doPut('devicelocation', obj).subscribe((res: any) => {
      this.spinner.hide();
      if (res.status.message == 'SUCCESS') {
        Swal.fire({
          title: 'Success!',
          text: this.deviceLocationForm.controls.deviceLocCode.value + ' Updated',
          icon: 'success',
          timer: 10000,
        }).then(() => {
          this.deviceLocationForm.reset();
          this.deviceAccessForm.reset();
          this.update = false;
          this.utilServ.devicelocationListBackup = [];
          this.deviceLocationForm.controls.isactive.setValue(true);

        });
      } else {
        Swal.fire({
          title: 'Error!',
          text: res.status.message,
          icon: 'warning', showConfirmButton: true,
        });
      }
    },
      (err) => {
        this.spinner.hide();
        Swal.fire({
          title: 'Error!',
          text: err.error.status.message,
          icon: 'error',
        });
      }
    );
  }

  ngOnDestroy() {
    this.utilServ.editData = null;
    this.utilServ.viewData = null;
  }
}

import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';
import { HttpPostService } from 'src/app/services/http-post.service';
import { HttpPutService } from 'src/app/services/http-put.service';
import { UtilService } from 'src/app/services/util.service';
import Swal from 'sweetalert2';
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[app-create-department]',
  templateUrl: './create-department.component.html',
  styleUrls: ['./create-department.component.scss'],
})
export class CreateDepartmentComponent implements OnInit, OnChanges, OnDestroy {
  @Input('app-create-department') selectedDepartmentData: any;
  @Output() selectedDepartmentEvent = new EventEmitter<string>();

  departmentForm: FormGroup;
  view = false;
  update = false;
  active = false;
  labels: any;
  rolesArrLen = [];
  charLimit: number;
  // deptCode: string;
  // deptName: string;
  departments = [];
  roleAccessArray = [];
  open = false;
  selectedDepartment: any;
  userNames = [];

  roleTypes = [
    { id: '1', name: 'Owners' },
    { id: '2', name: 'Managers' },
    { id: '3', name: 'Users' },
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private httpPostService: HttpPostService,
    private spinner: NgxSpinnerService,
    private httpPutService: HttpPutService,
    private UtilServ: UtilService,
    private httpGet: HttpGetService,
    private globalServ: GlobalvariablesService
  ) { }

  ngOnChanges(department: any): void {
    if (
      typeof department !== 'undefined' &&
      typeof department.selectedDepartmentData !== 'undefined' &&
      typeof department.selectedDepartmentData.currentValue !== 'undefined' &&
      (department.selectedDepartmentData.currentValue.type === 'NEW' ||
        department.selectedDepartmentData.currentValue.type === 'VIEW' ||
        department.selectedDepartmentData.currentValue.type === 'EDIT')
    ) {
      this.open = true;
      this.departmentForm.enable();
      delete this.UtilServ.viewData;
      delete this.UtilServ.editData;
      this.view = false;
      this.roleAccessArray = [];

      this.update = false;
      if (
        typeof department.selectedDepartmentData.currentValue.viewData !==
        'undefined'
      ) {
        this.UtilServ.viewData =
          department.selectedDepartmentData.currentValue.viewData;
        this.init();
      } else if (
        typeof department.selectedDepartmentData.currentValue.editData !==
        'undefined'
      ) {
        this.UtilServ.editData =
          department.selectedDepartmentData.currentValue.editData;
        this.init();
      } else {
        this.departmentForm.reset();
        this.roleAccessArray = [];
        this.departmentForm.controls.isactive.setValue(true);
      }
    }
  }

  closeModal(): void {
    this.open = false;
    this.selectedDepartmentEvent.emit();
  }
  validateInput(event: any) {
    const input = event.target.value;
    const pattern = /^[a-zA-Z0-9]*$/;
    if (!pattern.test(input)) {
      this.departmentForm.controls.deptName.setValue(this.departmentForm.controls.deptName.value.replace(/[^a-zA-Z0-9]/g, ''))
    }
  }
  getLabelDescription(divId: string): string {
    const label = this.labels?.find(item => item.colCode === divId);
    return label ? label.labelDescription : '';
  }
  getDeptLabels() {
    this.spinner.show();
    this.globalServ.getLabels('departmentMaster').subscribe((res: any) => {
      this.labels = res.response;
      this.spinner.hide();
    }, (err) => {
      this.spinner.hide();
      console.error(err.error.status.message);
    });
  }

  ngOnInit(): void {
    this.getDeptLabels();
    this.departmentForm = this.fb.group({
      deptCode: [null, [Validators.required, this.httpPostService.customValidator()]],
      deptName: [null, [Validators.required, this.httpPostService.customValidator()]],
      isactive: [true],
    });
    this.charLimit = this.globalServ.charLimitValue;
    this.init();
    this.getUserNames();
  }

  getUserNames() {
    this.httpGet.getMasterList('secUser/userName?userType=Employee').subscribe(
      (res: any) => {
        this.userNames = res.response;
      }
    );
  }

  init(): void {
    if (this.UtilServ.viewData) {
      this.departmentForm.disable();
      this.view = true;
      this.update = false;
      this.departmentForm.controls.deptCode.setValue(
        this.UtilServ.viewData.deptCode
      );
      this.departmentForm.controls.deptName.setValue(
        this.UtilServ.viewData.deptName
      );
      this.departmentForm.controls.isactive.setValue(
        this.UtilServ.viewData.isactive
      );
      this.UtilServ.viewData.accessDTOs.forEach((x) => {
        this.roleAccessArray.push({
          id: x.id,
          deptCode: x.deptCode,
          userType: x.userType,
          deptRoleCode: x.deptRoleCode,
          userName: x.userName,
          buCode: x.buCode,
          tenantCode: x.tenantCode,
          createdby: x.createdby,
          createddate: x.createddate,
          lastmodifiedby: x.lastmodifiedby,
          lastmodifieddate: x.lastmodifieddate,
          status: x.status,
        });
      });
      this.rolesArrLen = this.roleAccessArray.filter(x => x.status !== 'delete' || !x.REJECTED);

      // this.deptCode = this.UtilServ.viewData.deptCode;
      // this.deptName = this.UtilServ.viewData.deptName;
    } else if (this.UtilServ.editData) {
      this.update = true;
      this.view = false;
      this.departmentForm.enable();

      this.UtilServ.editData.accessDTOs.forEach((x) => {
        this.roleAccessArray.push({
          id: x.id,
          deptCode: x.deptCode,
          userType: x.userType,
          deptRoleCode: x.deptRoleCode,
          userName: x.userName,
          buCode: x.buCode,
          tenantCode: x.tenantCode,
          createdby: x.createdby,
          createddate: x.createddate,
          lastmodifiedby: x.lastmodifiedby,
          lastmodifieddate: x.lastmodifieddate,
          status: x.status,
        });
      });
      this.rolesArrLen = this.roleAccessArray.filter(x => x.status !== 'delete' || !x.REJECTED);

      this.departmentForm.controls.deptCode.setValue(
        this.UtilServ.editData.deptCode
      );
      this.departmentForm.controls.deptName.setValue(
        this.UtilServ.editData.deptName
      );
      this.departmentForm.controls.isactive.setValue(
        this.UtilServ.editData.isactive
      );
      this.departmentForm.controls.deptCode.disable();

      // this.deptCode = this.UtilServ.editData.deptCode;
      // this.deptName = this.UtilServ.editData.deptName;
    }
  }

  cancel() {
    this.router.navigateByUrl('setup/department');
  }

  create() {
    if (this.departmentForm.invalid) {
      for (const control of Object.keys(this.departmentForm.controls)) {
        this.departmentForm.controls[control].markAsTouched();
      }
      return;
    } else {
      let proceed = false;
      this.roleAccessArray.forEach(x => {
        proceed = false;
        if (x.userName !== null && x.projectRoleCode !== null) {
          proceed = true
        }
      })
      if (proceed) {
      this.departmentForm.get('deptCode').setValue(this.globalServ.checkAndRemoveSpecialCharacters(this.departmentForm.controls.deptCode.value), { emitEvent: false });
      this.departmentForm.get('deptName').setValue(this.globalServ.checkAndRemoveSpecialCharacters(this.departmentForm.controls.deptName.value), { emitEvent: false });
      this.spinner.show();
      const obj = {
        deptDto: {
          deptCode: this.departmentForm.controls.deptCode.value.trim(),
          deptName: this.departmentForm.controls.deptName.value.trim(),
          isactive:
            this.departmentForm.controls.isactive.value == null
              ? false
              : this.departmentForm.controls.isactive.value,
        },
        accessDTOs: this.roleAccessArray,
      };
      this.httpPostService
        .create('deptwithaccess', JSON.stringify(obj))
        .subscribe(
          (res: any) => {
            this.spinner.hide();

            if (res.status.message == 'SUCCESS') {
              Swal.fire({
                title: 'Success!',
                text: this.departmentForm.controls.deptName.value + ' Created',
                icon: 'success',
                timer: 10000,
              }).then(() => {
                this.UtilServ.allDepartments = [];
                this.roleAccessArray = [];
                this.UtilServ.activedepartmentList = [];
                this.UtilServ.allPayrollEmpDept = {
                  forTrueList: undefined,
                  forFalseList: undefined
                }
                this.departmentForm.reset();
                this.departmentForm.controls.isactive.setValue(true);
                this.router.navigateByUrl('setup/department');
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
            console.error(err.error.status.message);
            this.spinner.hide();
            Swal.fire({
              title: 'Error!',
              text: err.error.status.message,
              icon: 'error',
            });
          }
      );
      } else {
        Swal.fire({
          title: 'Error!',
          text: 'Select Role code and Username',
          icon: 'error',
        });
      }

    }
  }


  Update() {
    let proceed = false;
    this.roleAccessArray.forEach(x => {
      proceed = false;
      if (x.userName !== null && x.projectRoleCode !== null) {
        proceed = true
      }
    })
    if (proceed) {
    this.departmentForm.get('deptCode').setValue(this.globalServ.checkAndRemoveSpecialCharacters(this.departmentForm.controls.deptCode.value), { emitEvent: false });
    this.departmentForm.get('deptName').setValue(this.globalServ.checkAndRemoveSpecialCharacters(this.departmentForm.controls.deptName.value), { emitEvent: false });
      this.spinner.show();
      const obj = {
      deptDto: {
        deptId: this.UtilServ.editData.deptId,
        deptCode: this.UtilServ.editData.deptCode.trim(),
        deptName: this.departmentForm.controls.deptName.value.trim(),
        isactive:
          this.departmentForm.controls.isactive.value == null
            ? false
            : this.departmentForm.controls.isactive.value,
        companyCode: this.UtilServ.editData.companyCode,
        branchCode: this.UtilServ.editData.branchCode,
        createdby: this.UtilServ.editData.createdby,
        createddate: this.UtilServ.editData.createddate,
      },
      accessDTOs: this.roleAccessArray,
    }
    this.httpPostService.create('deptwithaccess', JSON.stringify(obj)).subscribe(
      (res: any) => {
        this.spinner.hide();
        if (res.status.message == 'SUCCESS') {
          Swal.fire({
            title: 'Success!',
            text: this.departmentForm.controls.deptName.value + ' Updated',
            icon: 'success',
            timer: 10000,
          }).then(() => {
            this.UtilServ.allDepartments = [];
            this.UtilServ.activedepartmentList = [];
            this.UtilServ.allPayrollEmpDept = {
              forTrueList: undefined,
              forFalseList: undefined
            }
            this.departmentForm.reset();
            this.departmentForm.controls.isactive.setValue(true);
            this.closeModal();
            // this.router.navigateByUrl('department');
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
        console.error(err.error.status.message);
        this.spinner.hide();
        Swal.fire({
          title: 'Error!',
          text: err.error.status.message,
          icon: 'error',
        });
      }
    );
    } else {
      Swal.fire({
        title: 'Error!',
        text: 'Select Role code and Username',
        icon: 'error',
      });
    }
  }


  addUser() {
    if (!this.departmentForm.controls.deptCode.value) {
      Swal.fire({
        text: 'Please Enter Department Fields',
        icon: 'info',
        timer: 10000,
      });
    } else {
      const length = this.roleAccessArray.length;
      if (length > 0) {
        const isEmpty = this.roleAccessArray[length - 1].deptRoleCode.length == 0;
        if (!isEmpty) {
          this.roleAccessArray.push({
            id: null,
            deptCode: null,
            userType: 'Employee',
            deptRoleCode: null,
            userName: null,
            buCode: null,
            tenantCode: null,
            createdby: null,
            createddate: null,
            lastmodifiedby: null,
            lastmodifieddate: null,
            status: null
          });
        }
      } else {
        this.roleAccessArray.push({
          id: null,
          deptCode: null,
          userType: 'Employee',
          deptRoleCode: null,
          userName: null,
          buCode: null,
          tenantCode: null,
          createdby: null,
          createddate: null,
          lastmodifiedby: null,
          lastmodifieddate: null,
          status: null
        });
      }
    }
    this.rolesArrLen = this.roleAccessArray.filter(x => x.status !== 'delete' || !x.REJECTED);
  }
  removeItem(index) {
    if (this.roleAccessArray[index].id == null) {
      this.roleAccessArray.splice(index, 1);
    } else {
      this.roleAccessArray[index]['REJECTED'] = true;
      this.roleAccessArray.forEach((x) => {
        x.status =
          typeof x.REJECTED !== 'undefined' && x.REJECTED
          ? 'delete'
          : typeof x.status === 'undefined'
              ? 'NEW'
              : x.status;
      });
    }
    this.rolesArrLen = this.roleAccessArray.filter(x => x.status !== 'delete' || !x.REJECTED);

  }


  ngOnDestroy() {
    this.update = false;
    this.view = false;
    this.UtilServ.editData = null;
    this.UtilServ.viewData = null;
    this.roleAccessArray = [];
  }
}

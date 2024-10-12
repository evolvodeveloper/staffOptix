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
  selector: '[app-create-project]',
  templateUrl: './create-project.component.html',
  styleUrls: ['./create-project.component.scss'],
})
export class CreateProjectComponent implements OnInit, OnChanges, OnDestroy {
  @Input('app-create-project')
  selectedPayrollEmployeeCategoryData: any;
  @Output()
  selectedPayrollEmployeeCategoryEvent = new EventEmitter<string>();

  projectForm: FormGroup;
  view = false;
  update = false;
  open = false;
  paycodeList = [];
  contractorList = [];
  rolesArrLen = [];
  empcategorys = [];
  userList: [];
  active = false;
  charLimit: number;
  selectedPayrollEmployeecategory: any;
  projectTypes = [
    { code: 'Fixed Cost', name: 'Fixed Cost' },
    { code: 'TnM', name: 'TnM' },
  ];
  roleTypes = [
    { id: '1', name: 'Owners' },
    { id: '2', name: 'Managers' },
    { id: '3', name: 'Users' },
  ];

  roleAccessArray = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private httpPutService: HttpPutService,
    private httpPostService: HttpPostService,
    private spinner: NgxSpinnerService,
    private utilServ: UtilService,
    private httpGetService: HttpGetService,
    public globalServ: GlobalvariablesService,
    private httpGet: HttpGetService,
  ) { }

  ngOnChanges(payrollEmpcategory: any): void {
    if (
      typeof payrollEmpcategory !== 'undefined' &&
      typeof payrollEmpcategory.selectedPayrollEmployeeCategoryData !==
      'undefined' &&
      typeof payrollEmpcategory.selectedPayrollEmployeeCategoryData
        .currentValue !== 'undefined' &&
      (payrollEmpcategory.selectedPayrollEmployeeCategoryData.currentValue
        .type === 'NEW' ||
        payrollEmpcategory.selectedPayrollEmployeeCategoryData.currentValue
          .type === 'VIEW' ||
        payrollEmpcategory.selectedPayrollEmployeeCategoryData.currentValue
          .type === 'EDIT')
    ) {
      this.open = true;
      this.projectForm.enable();
      delete this.utilServ.viewData;
      delete this.utilServ.editData;
      this.view = false;
      this.update = false;
      this.roleAccessArray = [];
      if (
        typeof payrollEmpcategory.selectedPayrollEmployeeCategoryData
          .currentValue.viewData !== 'undefined'
      ) {
        this.utilServ.viewData =
          payrollEmpcategory.selectedPayrollEmployeeCategoryData.currentValue.viewData;
        this.init();
      } else if (
        typeof payrollEmpcategory.selectedPayrollEmployeeCategoryData
          .currentValue.editData !== 'undefined'
      ) {
        this.utilServ.editData =
          payrollEmpcategory.selectedPayrollEmployeeCategoryData.currentValue.editData;
        this.init();
      } else {
        this.projectForm.reset();
        this.projectForm.controls.projectType.setValue('Fixed Cost');
        this.projectForm.controls.isactive.setValue(true);
        this.roleAccessArray = [];
      }
    }
  }

  closeModal(): void {
    this.open = false;
    this.selectedPayrollEmployeeCategoryEvent.emit();
  }



  ngOnInit(): void {
    this.getUsers();
    this.projectForm = this.fb.group({
      categoryCode: [null, [Validators.required, this.httpPostService.customValidator()]],
      shortName: [null],
      description: [null],
      projectType: [null, Validators.required],
      projectOwner: [null],
      isGlobal: false,
      isVisible: true,
      projectUrl: [null],
      isactive: [true],
    });
    this.charLimit = this.globalServ.charLimitValue;
    this.init();
  }
  init(): void {
    // this.projectForm.controls.companyCode.setValue(
    //   JSON.parse(localStorage.getItem('user-data')).company
    // );
    if (this.utilServ.viewData) {
      this.view = true;
      this.update = false;
      this.projectForm.controls.categoryCode.setValue(
        this.utilServ.viewData.categoryCode
      );
      this.projectForm.controls.shortName.setValue(
        this.utilServ.viewData.shortName
      );
      this.projectForm.controls.description.setValue(
        this.utilServ.viewData.description
      );
      this.projectForm.controls.projectType.setValue(
        this.utilServ.viewData.projectType
      );
      this.projectForm.controls.projectOwner.setValue(
        this.utilServ.viewData.projectOwner
      );
      this.projectForm.controls.isactive.setValue(
        this.utilServ.viewData.isactive
      );

      this.utilServ.viewData.accessDTOs.forEach((x) => {
        this.roleAccessArray.push({
          id: x.id,
          projectCode: x.deptCode,
          userType: x.userType,
          projectRoleCode: x.projectRoleCode,
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

      this.projectForm.disable();
    } else if (this.utilServ.editData) {
      this.view = false;
      this.update = true;
      this.projectForm.enable();
      this.utilServ.editData.accessDTOs.forEach((x) => {
        this.roleAccessArray.push({
          id: x.id,
          projectCode: x.deptCode,
          userType: x.userType,
          projectRoleCode: x.projectRoleCode,
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

      this.projectForm.controls.categoryCode.setValue(
        this.utilServ.editData.categoryCode
      );
      this.projectForm.controls.shortName.setValue(
        this.utilServ.editData.shortName
      );
      this.projectForm.controls.description.setValue(
        this.utilServ.editData.description
      );
      this.projectForm.controls.projectType.setValue(
        this.utilServ.editData.projectType
      );
      this.projectForm.controls.projectOwner.setValue(
        this.utilServ.editData.projectOwner
      );
      this.projectForm.controls.isactive.setValue(
        this.utilServ.editData.isactive
      );
      this.projectForm.controls.categoryCode.disable();
    }
  }


  getUsers() {
    this.httpGetService
      .getMasterList('secUser/userName?userType=Employee')
      .subscribe(
        (res: any) => {
          this.userList = res.response;
        },
        (err) => {
          console.error(err);
        }
      );
  }
  cancel() {
    this.router.navigateByUrl('setup/project');
  }
  createApi() {
    let proceed = false;
    this.roleAccessArray.forEach(x => {
      proceed = false;
      if (x.userName !== null && x.projectRoleCode !== null) {
        proceed = true
      }
    })
    if (proceed) {
      this.projectForm.get('categoryCode').setValue(this.globalServ.checkAndRemoveSpecialCharacters(this.projectForm.controls.categoryCode.value), { emitEvent: false });
      this.spinner.show();
      const obj = {
        masterDTO: {
          categoryCode: this.projectForm.controls.categoryCode.value,
          shortName: this.projectForm.controls.shortName.value,
          description: this.projectForm.controls.description.value,
          projectType: this.projectForm.controls.projectType.value,
          projectOwner: this.projectForm.controls.projectOwner.value,
          isGlobal: false,
          isVisible: true,
          isactive:
            this.projectForm.controls.isactive.value == null
              ? false
              : this.projectForm.controls.isactive.value,
        },
        accessDTOs: this.roleAccessArray,
      };
      this.httpPostService
        .create('projwithaccess', JSON.stringify(obj))
        .subscribe(
          (res: any) => {
            this.spinner.hide();

            if (res.status.message == 'SUCCESS') {
              Swal.fire({
                title: 'Success!',
                text: this.projectForm.controls.categoryCode.value + ' Created',
                icon: 'success',
                timer: 10000,
              }).then(() => {
                this.projectForm.reset();
                this.utilServ.allProjects = [];
                this.roleAccessArray = [];
                this.projectForm.controls.isactive.setValue(true);
                this.router.navigateByUrl('setup/project');
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
            console.error(err);
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
  Update() {
    let proceed = false;
    this.roleAccessArray.forEach(x => {
      proceed = false;
      if (x.userName !== null && x.projectRoleCode !== null) {
        proceed = true
      }
    })
    if (proceed) {
      this.projectForm.get('categoryCode').setValue(this.globalServ.checkAndRemoveSpecialCharacters(this.projectForm.controls.categoryCode.value), { emitEvent: false });
      this.spinner.show();
      const obj = {
        masterDTO: {
          projectId: this.utilServ.editData.projectId,
          categoryCode: this.projectForm.controls.categoryCode.value,
          shortName: this.projectForm.controls.shortName.value,
          description: this.projectForm.controls.description.value,
          projectType: this.projectForm.controls.projectType.value,
          projectOwner: this.projectForm.controls.projectOwner.value,
          isGlobal: false,
          isVisible: true,
          isactive:
            this.projectForm.controls.isactive.value == null
              ? false
              : this.projectForm.controls.isactive.value,
          branchCode: this.utilServ.editData.branchCode,
          companyCode: this.utilServ.editData.companyCode,
          createdby: this.utilServ.editData.createdby,
          createddate: this.utilServ.editData.createddate,
        },
        accessDTOs: this.roleAccessArray,
      };
      this.httpPostService
        .create('projwithaccess', JSON.stringify(obj))
        .subscribe((res: any) => {
          this.spinner.hide();
          if (res.status.message == 'SUCCESS') {
            Swal.fire({
              title: 'Success!',
              text: this.projectForm.controls.categoryCode.value + ' Updated',
              icon: 'success',
              timer: 10000,
            }).then(() => {
              this.projectForm.reset();
              this.utilServ.allProjects = [];
              this.closeModal();
            });
          } else {
            Swal.fire({
              title: 'Error!',
              text: res.status.message,
              icon: 'warning',
              showConfirmButton: true,
            });
          }
        }, (err) => {
          console.error(err);
          Swal.fire({
            title: 'Error!',
            text: err.error.status.message,
            icon: 'error',
          });
          this.spinner.hide();
        });
    } else {
      Swal.fire({
        title: 'Error!',
        text: 'Select Role code and Username',
        icon: 'error',
      });
    }
  }


  addUser() {
    if (!this.projectForm.controls.categoryCode.value) {
      Swal.fire({
        text: 'Please Enter Project Fields',
        icon: 'info',
        timer: 10000,
      });
    } else {
      const length = this.roleAccessArray.length;
      if (length > 0) {
        const isEmpty = this.roleAccessArray[length - 1].projectRoleCode.length == 0;
        if (!isEmpty) {
          this.roleAccessArray.push({
            id: null,
            projectCode: null,
            userType: 'Employee',
            projectRoleCode: null,
            userName: null,
            buCode: null,
            tenantCode: null,
            createdby: null,
            createddate: null,
            status: null
          });
        }
      } else {
        this.roleAccessArray.push({
          id: null,
          projectCode: null,
          userType: 'Employee',
          projectRoleCode: null,
          userName: null,
          buCode: null,
          tenantCode: null,
          createdby: null,
          createddate: null,
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
    this.utilServ.editData = null;
    this.utilServ.viewData = null;
    this.roleAccessArray = [];
  }
}

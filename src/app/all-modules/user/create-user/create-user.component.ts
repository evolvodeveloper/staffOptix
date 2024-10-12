import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subject, debounceTime } from 'rxjs';
import { canLeaveComponent } from 'src/app/authentication/guards/unsaved-changes.guard';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';
import { HttpPostService } from 'src/app/services/http-post.service';
import { HttpPutService } from 'src/app/services/http-put.service';
import { UtilService } from 'src/app/services/util.service';
import Swal from 'sweetalert2';
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[app-create-user]',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.scss'],
})
export class CreateUserComponent implements OnInit, OnChanges, canLeaveComponent, OnDestroy {
  @Input('app-create-user') selectedUserData: any;
  private userName: Subject<string> = new Subject();

  @Output() selectedUserEvent = new EventEmitter<string>();
  userForm: FormGroup;
  view = false;
  update = false;
  usertypeList = [];
  List = [];
  showSuccessuserNameToolTip: string;
  branchs = [];
  showPassword = false;
  showConfrmPassword = false;
  payrollEmps = [];
  active = false; passwdMatched = true;
  charLimit: number;
  val;
  passwordTouched: any;
  passwordChanged = false;
  selectedUserType = '';
  open = false;
  selectedUser: any;
  roleCodeList = [];
  usersWithRoles = [];
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private httpPostService: HttpPostService,
    private spinner: NgxSpinnerService,
    private UtilServ: UtilService,
    public globalServ: GlobalvariablesService,
    private httpGetService: HttpGetService,
    private httpPutService: HttpPutService
  ) {

  }
  canLeave(): boolean {
    if (this.userForm.dirty) {
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
          this.userForm.reset();
          this.cancel();
        }
      })
      return false
    } else {
      return true;
    }
    // return window.confirm('Oops! you have unsaved changes on this page')
  }

  ngOnChanges(userrr: any): void {
    if (
      typeof userrr !== 'undefined' &&
      typeof userrr.selectedUserData !== 'undefined' &&
      typeof userrr.selectedUserData.currentValue !== 'undefined' &&
      (userrr.selectedUserData.currentValue.type === 'NEW' ||
        userrr.selectedUserData.currentValue.type === 'VIEW' ||
        userrr.selectedUserData.currentValue.type === 'EDIT')
    ) {
      this.open = true;
      delete this.UtilServ.viewData;
      delete this.UtilServ.editData;
      this.view = false;
      this.update = false;
      if (
        typeof userrr.selectedUserData.currentValue.viewData !==
        'undefined'
      ) {
        this.UtilServ.viewData =
          userrr.selectedUserData.currentValue.viewData;
        this.init();
      } else if (
        typeof userrr.selectedUserData.currentValue.editData !==
        'undefined'
      ) {
        this.UtilServ.editData =
          userrr.selectedUserData.currentValue.editData;
        this.init();
      } else {
        this.userForm.reset();
        this.userForm.controls.onboardingFlow.setValue('manual');
        this.userForm.controls.firstLogin.setValue(true);
      }
      this.branchs = JSON.parse(localStorage.getItem('branch'));
      if (this.branchs.length == 1) {
        this.userForm.controls.multiBranch.disable();
      }
    }

  }


  getAllUsersByUserType(): void {
    this.spinner.show();
    this.httpGetService
      .getMasterList('secUser/userType?userType=EMPLOYEE')
      .subscribe(
        (res: any) => {
          this.spinner.hide();
          this.List = res.response;
        },
        (err) => {
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
  getroleCodeList() {
    this.httpGetService.getMasterList('secroles?app=atlas').subscribe(
      (res: any) => {
        this.roleCodeList = res.response;
      },
      err => {
        Swal.fire({
          icon: 'error',
          title: 'sorry we are unable to reach roles',
          showConfirmButton: true
        });
      }
    );
  }
  getUserList() {
    this.spinner.show();
    this.httpGetService.getMasterList('userRoles').subscribe(
      (res: any) => {
        this.usersWithRoles = res.response;
        this.spinner.hide();
      },
      (err) => {
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
  ngOnInit(): void {
    this.selectedUserType = 'EMPLOYEE';
    this.getAllUsersByUserType();
    this.getroleCodeList();
    this.userForm = this.fb.group({
      userName: ['', Validators.required],
      phoneNo: [''],
      email: [''],
      password: ['', Validators.compose([Validators.required, Validators.minLength(8)])],
      confirm_password: ['', Validators.compose([Validators.required, Validators.minLength(8)])],
      userType: [''],
      userCode: ['', Validators.required],
      accountLocked: false,
      passwordExpired: false,
      multiBranch: false,
      multiDivision: false,
      onboardingFlow: ['manual'],
      lastWorkingDate: ['2099-12-31'],
      isactive: false,
      firstLogin: true,
      selectedRoles: []
    });
    this.charLimit = 12;
    this.userName.pipe(debounceTime(1000)).subscribe((args) => {
      if (!this.update && !this.view) { 
        this.checkUserName(args);
      }
    });
  }
  getSelectedOption(): string {
    return this.userForm.get('onboardingFlow').value;
  }

  // Function to handle card selection
  selectCard(option: string): void {
    this.userForm.patchValue({ onboardingFlow: option });
  }

  init() {
    if (this.UtilServ.viewData) {
      this.view = true;
      //   this.firstLogin = true;
      // this.listDropdown = this.UtilServ.viewData.userType;
      this.passwordTouched = this.UtilServ.viewData.password;
      this.userForm.controls.userName.setValue(this.UtilServ.viewData.userName);
      if (this.UtilServ.viewData.password) {
        this.userForm.controls.password.setValue(this.UtilServ.viewData.password);
      }
      if (this.UtilServ.viewData?.roles) {
        this.userForm.controls.selectedRoles.setValue(this.UtilServ.viewData?.roles.split(','))
      }
      this.userForm.controls.userType.setValue(this.UtilServ.viewData.userType);
      this.userForm.controls.userCode.setValue(this.UtilServ.viewData.userCode);

      this.userForm.controls.accountLocked.setValue(
        this.UtilServ.viewData.accountLocked
      );
      this.userForm.controls.passwordExpired.setValue(
        this.UtilServ.viewData.passwordExpired
      );
      this.userForm.controls.email.setValue(this.UtilServ.viewData.email);
      this.userForm.controls.multiBranch.setValue(
        this.UtilServ.viewData.multiBranch
      );
      this.userForm.controls.multiDivision.setValue(
        this.UtilServ.viewData.multiDivision
      );

      // this.getAllUsersByUserType(this.UtilServ.viewData.userType);
      this.selectedUserType = this.UtilServ.viewData.userType;
      this.userForm.controls.firstLogin.setValue(
        this.UtilServ.viewData.firstLogin
      );
      if (this.UtilServ.viewData.lastWorkingDate) {

        this.userForm.controls.lastWorkingDate.setValue(
          moment(this.UtilServ.viewData.lastWorkingDate).format('YYYY-MM-DD')
        );
      }
      this.userForm.controls.isactive.setValue(this.UtilServ.viewData.isactive);
      this.userForm.disable();
    } else if (this.UtilServ.editData) {

      this.update = true;
      this.userForm.controls.email.setValue(this.UtilServ.editData.email);
      this.userForm.controls.userName.setValue(this.UtilServ.editData.userName);
      // this.userForm.controls.userName.disable();
      if (this.UtilServ.editData.password) {
        this.userForm.controls.password.setValue(this.UtilServ.editData.password);
      }
      this.userForm.controls.userType.setValue(this.UtilServ.editData.userType);
      // this.getAllUsersByUserType(this.UtilServ.editData.userType);
      this.selectedUserType = this.UtilServ.editData.userType;
      if (this.UtilServ.editData?.roles) {
        this.userForm.controls.selectedRoles.setValue(this.UtilServ.editData?.roles.split(','))
      }
      this.userForm.controls.accountLocked.setValue(
        this.UtilServ.editData.accountLocked
      );
      this.userForm.controls.passwordExpired.setValue(
        this.UtilServ.editData.passwordExpired
      );
      this.userForm.controls.multiDivision.setValue(
        this.UtilServ.editData.multiDivision
      );
      this.userForm.controls.firstLogin.setValue(
        this.UtilServ.editData.firstLogin
      );
      this.userForm.controls.multiBranch.setValue(
        this.UtilServ.editData.multiBranch
      );
      this.userForm.controls.userCode.setValue(this.UtilServ.editData.userCode);
      if (this.UtilServ.editData.lastWorkingDate) {

        this.userForm.controls.lastWorkingDate.setValue(
          moment(this.UtilServ.editData.lastWorkingDate).format('YYYY-MM-DD')
        );
      }
      this.userForm.controls.isactive.setValue(this.UtilServ.editData.isactive);
      this.passwordTouched = this.UtilServ.editData.password;
      this.userForm.enable();
      this.userForm.controls.userName.disable();
    }
  }
  // codeChange(evt) {
  //   this.userForm.controls.userCode.setValue(evt.target.value);
  // }
  onUserNameChange(args: string) {
    this.showSuccessuserNameToolTip = 'nothing';
      this.showSuccessuserNameToolTip = 'USERNAME ALREADY EXISTS';
      if (
        this.userForm.get('userName').valid &&
        this.userForm.get('userName').value !== ''
      ) {
        this.userName.next(args.trim());
      } else {
        this.showSuccessuserNameToolTip = 'failed';
    }
  }
  checkUserName(name) {
    if (this.userForm.controls.userName.value.length > 0 && this.userForm.get('userName').valid) {
    this.httpGetService
      .nonTokenApi('checkusername?userName=' + name)
      .subscribe((res: any) => {
        // swetamayeesahoo80@gmail.com
        if (res === false) {
          this.showSuccessuserNameToolTip = 'USERNAME NOT EXISTS';
        } else if (res === true) {
          this.showSuccessuserNameToolTip = 'USERNAME ALREADY EXISTS';
        }
      });
    }
    else {
      this.showSuccessuserNameToolTip = 'failed';
    }
  }
  cancel() {
    this.router.navigateByUrl('/user-list');
    this.showSuccessuserNameToolTip = 'failed';

  }

  onPasswordChange() {
    if (!this.update && !this.view) {
      this.passwordChanged = true;
      if (this.confirm_password.value == this.password.value) {
        this.confirm_password.setErrors(null);
        this.passwdMatched = false;
      } else {
        this.confirm_password.setErrors({ mismatch: true });
        this.passwdMatched = true;
      }
    }
    else {
      this.passwordChanged = true;
      if (this.password.value.length == 0) {
        this.passwordChanged = false;
        this.password.setErrors(null);
        this.confirm_password.setErrors(null);
      } else {
        if (this.confirm_password.value == this.password.value) {
          this.confirm_password.setErrors(null);
          this.passwdMatched = false;
        } else {
          this.confirm_password.setErrors({ mismatch: true });
          this.confirm_password.markAsTouched();
          this.passwdMatched = true;
        }
      }
    }
  }

  get password(): AbstractControl {
    return this.userForm.controls['password'];
  }

  get confirm_password(): AbstractControl {
    return this.userForm.controls['confirm_password'];
  }

  create() {
    // this.userForm.get('userName').setValue(this.globalServ.checkAndRemoveSpecialCharacters(this.userForm.controls.userName.value), { emitEvent: false });
    const roles = [];
    this.userForm.controls.selectedRoles.value.forEach(element => {
      roles.push({
        "userName": this.userForm.controls.userName.value.trim(),
        "roleCode": element,
        "isactive": true
      })
    });
    const obj = {
      "user": {
        "userName": this.userForm.controls.userName.value.trim(),
        "password": this.userForm.controls.password.value,
        "userType": this.selectedUserType,
        firstLogin: this.userForm.controls.onboardingFlow.value === 'manual'
          ? false
          : this.userForm.controls.firstLogin.value,
        userCode: this.userForm.controls.userCode.value,
        "multiBranch": this.userForm.controls.multiBranch.value == null
          ? false
          : this.userForm.controls.multiBranch.value,
        "accountLocked": this.userForm.controls.accountLocked.value == null
          ? false
          : this.userForm.controls.accountLocked.value,
        multiDivision: this.userForm.controls.multiDivision.value == null
          ? false
          : this.userForm.controls.multiDivision.value,
        "isactive": this.userForm.controls.onboardingFlow.value === 'manual' ? true : false,
        passwordExpired: this.userForm.controls.passwordExpired.value == null
          ? false
          : this.userForm.controls.passwordExpired.value,
      },
      roles
    }
      this.spinner.show();
    this.httpPostService
      .create('user/create', obj)
      .subscribe(
        (res: any) => {
          this.spinner.hide();
          if (res.status.message == 'SUCCESS') {
            Swal.fire({
              title: 'Success!',
              text: this.userForm.controls.userName.value + ' Created',
              icon: 'success',
              timer: 10000,
            }).then(() => {
              this.userForm.reset();
              // this.userForm.controls.isactive.setValue(true);
              this.UtilServ.secusersApiData = [];
              this.List = [];
              this.showSuccessuserNameToolTip = 'failed';
              this.getAllUsersByUserType();
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
      user: {
      id: this.UtilServ.editData.id,
      firstLogin: this.userForm.controls.firstLogin.value == null ? false : this.userForm.controls.firstLogin.value,
      accountLocked: this.userForm.controls.accountLocked.value == null ? false : this.userForm.controls.accountLocked.value,
      lastWorkingDate: this.userForm.controls.lastWorkingDate.value,
      passwordExpired: this.userForm.controls.passwordExpired.value == null ? false : this.userForm.controls.passwordExpired.value,
      password: this.userForm.controls.password.value,
      userName: this.userForm.controls.userName.value,
      userType: this.userForm.controls.userType.value,
      email: this.userForm.controls.email.value,
      userCode: this.userForm.controls.userCode.value,
      multiBranch: this.userForm.controls.multiBranch.value == null ? false : this.userForm.controls.multiBranch.value,
      multiDivision: this.userForm.controls.multiDivision.value == null ? false : this.userForm.controls.multiDivision.value,
        roles: String(this.userForm.controls.selectedRoles.value),
      isactive:
        this.userForm.controls.isactive.value === null ? false
          : this.userForm.controls.isactive.value,
      companyCode: this.UtilServ.editData.companyCode,
      branchCode: this.UtilServ.editData.branchCode,
      createdby: this.UtilServ.editData.createdby,
        createddate: this.UtilServ.editData.createddate,
      },
      roles: null
    };

    if (this.passwordChanged) {
      obj['password'] = this.userForm.controls.password.value;
    }
    this.httpPutService
      .doPut('user/role' + (this.passwordChanged ? '?chgd=Y' : '?chgd=N'), obj)
      .subscribe(
        (res: any) => {
          this.spinner.hide();
          if (res.status.message == 'SUCCESS') {
            Swal.fire({
              title: 'Success!',
              text: this.userForm.controls.userName.value + ' updated',
              icon: 'success',
              timer: 10000,
            }).then(() => {
              this.userForm.reset();
              this.UtilServ.secusersApiData = [];
              this.List = [];
              this.passwordChanged = false;
              this.showSuccessuserNameToolTip = 'failed';
              this.getAllUsersByUserType();
              // this.userForm.controls.isactive.setValue(true);
              this.closeModal();
              // this.router.navigateByUrl('/user-list');
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
          });
        }
      );
  }

  closeModal(): void {
    this.UtilServ.editData = null;
    this.UtilServ.viewData = null;
    this.view = false;
    this.update = false
    this.open = false;
    this.userForm.enable();
    this.showSuccessuserNameToolTip = 'nothing';
    this.selectedUserEvent.emit();

  }


  ngOnDestroy() {
    this.userForm.enable();
    this.UtilServ.editData = null;
    this.UtilServ.viewData = null;
    this.view = false;
    this.update = false
    this.showSuccessuserNameToolTip = 'failed';
  }
}



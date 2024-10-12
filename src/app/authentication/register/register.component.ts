import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subject, debounceTime } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { HttpGetService } from 'src/app/services/http-get.service';
import { HttpPostService } from 'src/app/services/http-post.service';
import Swal from 'sweetalert2';
import { AddBranchItemComponent } from './add-branch-item/add-branch-item.component';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  private userName: Subject<string> = new Subject();
  private subject: Subject<string> = new Subject();
  private cmpNamee: Subject<string> = new Subject();
  private cmpCode: Subject<string> = new Subject();

  public logInForm: FormGroup;
  companyForm: FormGroup;
  // employeeForm: FormGroup;
  branchObj = [];
  countryNames = [];
  showBranchList = false;
  locationData: any;
  hasMultiBranchTrue = true;
  timeZones = [];
  dateFormats = ['dd/MM/yyyy', 'dd-MM-yyyy', 'ddMMyyyy'];
  showSuccessuserNameToolTip: string;
  showSuccessEmailToolTip: string;
  showSuccesCompanyNameToolTip: string;
  showSuccesCompanyCodeToolTip: string;
  showPassword = false;
  confirmpassword = false;
  showEmailBox = true;
  showRegisterBox = false;
  showCompanyBox = false;
  industries = [];
  branchFormGroup: FormGroup;
  constructor(
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private authenticationService: AuthenticationService,
    private http: HttpClient,
    private httpGet: HttpGetService,
    private httpPost: HttpPostService,
    private modalService: NgbModal,
    private router: Router
  ) {

  }

  ngOnInit(): void {
    this.LoginForm();
    this.getTimezones();
    this.getIndustries();
    this.createCompanyForm();
    this.getCountrys();
    this.getIPAdress();
    this.subject.pipe(debounceTime(1000)).subscribe(() => {
      this.checkEmail();
    });
    this.cmpNamee.pipe(debounceTime(1000)).subscribe(() => {
      this.checkCompanyName();
    });
    // this.addDivisionItem();
    this.userName.pipe(debounceTime(1000)).subscribe(() => {
      this.checkUserName();
    });
    this.cmpCode.pipe(debounceTime(1000)).subscribe(() => {
      this.checkCompanyCode();
    });

  }

  getIndustries() {
    this.httpGet.nonTokenApi('industryTypes').subscribe((res: any) => {
      this.industries = res.response;
    });
  }

  getIPAdress(): void {
    if (!localStorage.getItem('Ipaddress')) {
      this.authenticationService.getIPAdress().subscribe((res: any) => {
        this.getLocationByIPAddress(res.ip);
      });
    }
    else {
      this.getLocationByIPAddress(localStorage.getItem('Ipaddress'));

    }
  }
  getLocationByIPAddress(ipAddress) {
    this.http
      .get('https://ipapi.co/' + ipAddress + '/json/')
      .subscribe((res: any) => {
        this.locationData = res;
      });
  }

  LoginForm() {
    this.logInForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      // Validators.compose([Validators.requiredValidators.pattern(/^(\d{10}|\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{3,3})])$/)
      userName: ['', Validators.required],
      password: ['', Validators.compose([Validators.required, Validators.minLength(8)])],
      phoneNo: ['', Validators.required],
      confirm_password: [
        '',
        Validators.compose([Validators.required, Validators.minLength(8)]),
      ],
      lastName: [''],
      firstName: [''],
      multiBranch: [false],
      multiDivision: [false],
    });
  }

  createCompanyForm() {
    this.companyForm = this.fb.group({
      companyCode: [null, Validators.required],
      companyName: [null, Validators.required],
      shortName: [null, Validators.compose([Validators.maxLength(3)])],
      bankDetails: [''],
      theme: [''],
      address: [''],
      industry: [''],
    });
  }

  verfiyingEachObject() {
    const length = this.branchObj.length;
    this.branchObj.forEach((control, i) => {
      if (i == 0) {
        if (length == 1) {
          control.headoffice = true;
        }
      }
      const shortName = control.branchName.split(' ')
        .map((word) => word.charAt(0))
        .join('');
      if (shortName.length < 3) {
        const shortName1 = control.branchName.substring(0, 2) + i;
        control.shortName = (shortName1.toUpperCase());
      } else {
        control.shortName = (shortName.toUpperCase().substring(0, 2) + i);
      }
      control.priority = (i + 1);
    });
  }

  removeBranch(index) {
    if (this.branchObj.length == 1) {
      this.branchObj.splice(index, 1);
      Swal.fire({
        icon: 'info',
        text: 'We required atleast One branch details',
        timer: 10000,
      });
    } else {
      this.branchObj.splice(index, 1);
    }
    this.checkBranck();
    this.verfiyingEachObject();
  }


  getShortNamefromCmpName(val) {
    const shortName = val
      .split(' ')
      .map((word) => word.charAt(0))
      .join('');
    if (shortName.length < 3) {
      let shortName1 = val.substring(0, 3);
      shortName1 = shortName1.split(' ').join('');
      this.companyForm.controls.shortName.setValue(shortName1.toUpperCase());
    } else {
      this.companyForm.controls.shortName.setValue(
        shortName.toUpperCase().substring(0, 3)
      );
    }
  }
  getShortNamefromBranchName(i, x, val) {
    const shortName = val
      .split(' ')
      .map((word) => word.charAt(0))
      .join('');
    x.priority = i + 1;
    if (shortName.length < 3) {
      const shortName1 = val.substring(0, 2) + i;
      // shortName1 = shortName1.split(' ').join('');
      x.shortName = shortName1.toUpperCase();
    } else {
      x.shortName = shortName.toUpperCase().substring(0, 2) + i;
    }
  }


  onEmailChange(args: string) {
    this.showSuccessEmailToolTip = 'nothing';
      if (
        this.logInForm.get('email').valid &&
        this.logInForm.get('email').value !== ''
      ) {
        this.subject.next(args.trim());
      }
      else {
        this.showSuccessEmailToolTip = 'failed';
      }
  }
  checkEmail() {
    if (this.logInForm.controls.email.value.length > 0 && this.logInForm.get('email').valid) {
      this.httpGet
        .nonTokenApi('checkemail?email=' + this.logInForm.controls.email.value)
        .subscribe((res: any) => {
          if (res === false) {
            this.showSuccessEmailToolTip = 'EMAIL NOT EXISTS';
          } else if (res === true) {
            this.showSuccessEmailToolTip = 'EMAIL ALREADY EXIST';
          }
        });
    }
    else {
      this.showSuccessEmailToolTip = 'failed';
    }
  }
  onUserNameChange(args: string) {
    this.showSuccessuserNameToolTip = 'nothing';
    if (
      this.logInForm.get('userName').valid &&
      this.logInForm.get('userName').value !== ''
    ) {
      this.userName.next(args.trim());
    }
    else {
      this.showSuccessuserNameToolTip = 'failed';
    }
  }
  checkUserName() {
    if (this.logInForm.controls.userName.value.length > 0) {
      this.httpGet
        .nonTokenApi('checkusername?userName=' + this.logInForm.controls.userName.value)
        .subscribe((res: any) => {
          // swetamayeesahoo80@gmail.com
          if (res === false) {
            this.showSuccessuserNameToolTip = 'USERNAME NOT EXISTS';
          } else if (res === true) {
            this.showSuccessuserNameToolTip = 'USERNAME ALREADY EXISTS';
          }
        });
    } else {
      this.showSuccessuserNameToolTip = 'failed';
    }
  }
  onCmpNameChange(args: string) {
    this.showSuccesCompanyNameToolTip = 'nothing';
    if (
      this.companyForm.get('companyName').valid &&
      this.companyForm.get('companyName').value !== ''
    ) {
      this.cmpNamee.next(args.trim());
    }
    else {
      this.showSuccesCompanyNameToolTip = 'failed';

    }
  }
  onCmpCodeChange(args: string) {
    this.showSuccesCompanyCodeToolTip = 'nothing';
    if (args.length > 0) {
      this.cmpCode.next(args.trim());
    }
    else {
      this.showSuccesCompanyCodeToolTip = 'failed';
    }
  }
  checkCompanyName() {
    if (this.companyForm.controls.companyName.value.length > 0) {
      this.httpGet
        .nonTokenApi('checkcompany?companyName=' + this.companyForm.controls.companyName.value)
        .subscribe((res: any) => {
          if (res === false) {
            this.showSuccesCompanyNameToolTip = 'COMPANY NAME NOT EXISTS';
          } else if (res === true) {
            this.showSuccesCompanyNameToolTip = 'COMPANY NAME ALREADY EXISTS';
          }
        });
    }
    else {
      this.showSuccesCompanyNameToolTip = 'failed';
    }
  }
  checkCompanyCode() {
    if (this.companyForm.controls.companyCode.value.length > 0) {
      this.httpGet
        .nonTokenApi('checkcompanyCode?companyCode=' + this.companyForm.controls.companyCode.value)
        .subscribe((res: any) => {
          if (res === false) {
            this.showSuccesCompanyCodeToolTip = 'COMPANY CODE NOT EXISTS';
          } else if (res === true) {
            this.showSuccesCompanyCodeToolTip = 'COMPANY CODE ALREADY EXISTS';
          }
        });
    } else {
      this.showSuccesCompanyCodeToolTip = 'failed';
    }
  }
  getTimezones() {
    this.httpGet.timeZone().subscribe(
      (res: any) => {
        this.timeZones = res.response;
      }
    );
  }
  onPasswordChange() {
    if (this.confirm_password.value == this.password.value) {
      this.confirm_password.setErrors(null);
    } else {
      this.confirm_password.setErrors({ mismatch: true });
    }
  }

  get password(): AbstractControl {
    return this.logInForm.controls['password'];
  }

  get confirm_password(): AbstractControl {
    return this.logInForm.controls['confirm_password'];
  }

  get f() {
    return this.logInForm.controls;
  }

  checkHeadOffice() {
    const noOfHeadOffices = [];
    this.branchObj.forEach((element, i) => {
      element.branchName = element.branchName.trim();
      if (!element.shortName) { 
        this.getShortNamefromBranchName(i, element, element.branchName);
      }
      if (element.headoffice == true) {
        noOfHeadOffices.push(element);
      }
    });
    if (noOfHeadOffices.length > 1) {
      Swal.fire({
        icon: 'info',
        text: 'Choose Only One Branch as Head Office',
        timer: 10000,
      }).then(() => {
        this.branchObj.forEach((control) => {
          control.headoffice = false;
        });
      });
    } else if (noOfHeadOffices.length < 1) {
      Swal.fire({
        icon: 'info',
        text: 'Choose Atleast One Branch as Head Office',
        timer: 10000,
      })
    }
    else {
      this.registerObj(this.branchObj);
    } 
  }

  Submit(): void {
    this.checkHeadOffice();
  }

  registerObj(branch) {
    this.spinner.show();
    const obj = {
      secUser: {
        email: this.logInForm.controls.email.value,
        userName: this.logInForm.controls.userName.value.trim(),
        lastName: this.logInForm.controls.lastName.value.trim(),
        firstName: this.logInForm.controls.firstName.value.trim(),
        phoneNo: this.logInForm.controls.phoneNo.value,
        password: this.logInForm.controls.password.value,
        multiBranch: this.logInForm.controls.multiBranch.value,
      },
      company: {
        companyCode: this.companyForm.controls.companyCode.value.trim(),
        shortName: this.companyForm.controls.shortName.value,
        companyName: this.companyForm.controls.companyName.value.trim(),
      },
      industry: this.companyForm.controls.industry.value,
      // setupType: 'simple',
      branch: branch,
    };
    this.httpPost.register(JSON.stringify(obj)).subscribe(
      (res: any) => {
        this.spinner.hide();
        if (res.status.message == 'SUCCESS') {
          localStorage.setItem('company', res.response.company.companyCode);
          Swal.fire({
            title: 'Success!',
            text: this.logInForm.controls.userName.value + ' Created',
            icon: 'success',
            html:
              'Please check your email and click on verify to sign-in',

          }).then(() => {
            this.logInForm.reset();
            this.companyForm.reset();
            this.branchObj = [];
            this.router.navigate(['/pricing-plans']);
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
  showCompany() {
    this.showEmailBox = false;
    // this.showRegisterBox = false;
    this.showCompanyBox = true;
  }
  backTo1stPage() {
    this.showEmailBox = true;
    this.showCompanyBox = false;
    // this.showRegisterBox = false;
  }

  getCountrys() {
    this.httpGet.nonTokenApi('countries').subscribe((res: any) => {
      this.countryNames = res.response;
    },
      err => {
        Swal.fire({
          text: err.error.status.message,
          icon: 'error'
      })
    })
  }

  toggleB(eve) {
    this.logInForm.controls.multiBranch.setValue(eve.target.checked);
    this.checkBranck();
  }
  checkBranck() {
    const index = this.branchObj.length - 1;
    if (index == 0) {
      if (length == 1) {
        this.logInForm.controls.multiBranch.setValue(true);
      }
    }
    if (this.branchObj.length == 0) {
      this.hasMultiBranchTrue = true;
    } else if (this.branchObj.length > 0 && this.logInForm.controls.multiBranch.value == true) {
      this.hasMultiBranchTrue = true;
      // this.branchObj[index].headoffice = true;
      this.logInForm.controls.multiBranch.setValue(true);
    } else if (this.branchObj.length > 0 && this.logInForm.controls.multiBranch.value == false) {
      if (this.branchObj.length > 1) {
        this.branchObj.splice(1);
      }
      this.hasMultiBranchTrue = false;
    } else if (this.logInForm.controls.multiBranch.value == false) {
      //delete last added branch
    }
  }

  openModal(row, action) {
    const modalRef = this.modalService.open(AddBranchItemComponent, {
      scrollable: true,
      backdrop: 'static',
      // windowClass: 'myCustomModalClass',
      size: 'lg',
    });
    modalRef.componentInstance.fromParent = {
      row: row,
      action: action,
      apiData: {
        timeZone: this.timeZones,
        ipLocation: this.locationData,
        country: this.countryNames
      }
    };
    modalRef.result.then(
      (result) => {
        if (result != undefined && result != null && result != '') {
          const exist = this.branchObj.findIndex((x) => x.branchName === result.branchName)
          if (exist < 0) {
            this.branchObj.push(result);
            this.showBranchList = true;
          }
          else {
            this.branchObj.splice(exist, 1)
            this.branchObj.push(result);
          } 
        }
        this.checkBranck();
      });
  }

}

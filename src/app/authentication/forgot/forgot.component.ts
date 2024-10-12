import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpPostService } from 'src/app/services/http-post.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-forgot',
  templateUrl: './forgot.component.html',
  styleUrls: ['./forgot.component.scss'],
})
export class ForgotComponent implements OnInit {
  email: string;
  company: string;
  confirmPassword: string;
  companyCode: string;
  resetPassword = false;
  otp2: string;
  otp3: string;
  otp4: string;
  showForgotPassword = true;
  showOTP = false;
  forgotForm: FormGroup;
  restPasswordForm: FormGroup;

  constructor(
    private spinner: NgxSpinnerService,
    private httpPostService: HttpPostService,
    private fb: FormBuilder,
    private globalServ: GlobalvariablesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // this.company = localStorage.getItem('company');
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      companyCode: ['', [Validators.required]],
    });

    this.restPasswordForm = this.fb.group({
      Otp: [
        '',
        Validators.compose([Validators.required, Validators.minLength(4)]),
      ],
      password: [
        '',
        Validators.compose([Validators.required, Validators.minLength(8)]),
      ],
      confirm_password: [
        '',
        Validators.compose([Validators.required, Validators.minLength(8)]),
      ],
    });
  }

  verifyOTP() {
    this.spinner.show();

    this.showForgotPassword = false;
    this.showOTP = false;
    this.resetPassword = false;
    // this.show = false;
    this.httpPostService
      .forgot(
        'resetPassword?email=' +
          this.forgotForm.controls.email.value +
          '&company=' +
          this.forgotForm.controls.companyCode.value +
          '&Otp=' +
          this.restPasswordForm.controls.Otp.value +
          '&password=' +
          this.restPasswordForm.controls.password.value,
        ''
      )
      .subscribe(
        (res: any) => {
          this.spinner.hide();
          if (res.response === 'PASSWORD_UPDATED_SUCESSFULLY') {
            Swal.fire({
              // position: 'top-start',
              title: 'Success!',
              text: 'Password Reset Successfully',
              icon: 'success',
              timer: 10000,
            });
            this.router.navigate(['auth']);
          }
        },
        (err) => {
          this.spinner.hide();
          this.showOTP = true;
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: err.error.status.message,
          });
        }
      );
  }

  back() {
    this.showForgotPassword = true;
    this.showOTP = false;
    this.resetPassword = false;
  }

  onPasswordChange() {
    if (this.confirm_password.value == this.password.value) {
      this.confirm_password.setErrors(null);
    } else {
      this.confirm_password.setErrors({ mismatch: true });
    }
  }

  get password(): AbstractControl {
    return this.restPasswordForm.controls['password'];
  }

  get confirm_password(): AbstractControl {
    return this.restPasswordForm.controls['confirm_password'];
  }

  get f() {
    return this.restPasswordForm.controls;
  }

  checkResetPassword() {
    this.showForgotPassword = true;
    // 'forgotPassword?email=' + this.forgotForm.controls.email.value + '&companyName=' + this.forgotForm.controls.companyCode.value
    this.spinner.show();
    this.httpPostService
      .forgot(
        'forgotpassword?email=' +
          this.forgotForm.controls.email.value +
          '&company=' +
          this.forgotForm.controls.companyCode.value,
        ''
      )
      .subscribe(
        (res: any) => {
          if (res.response === 'OTP_SENT_TO_YOUR_EMAIL') {
            this.spinner.hide();
            this.showForgotPassword = false;
            this.showOTP = true;

            Swal.fire({
              // position: 'top-right',
              title: 'Success!',
              text: 'OTP sent To your email',
              icon: 'success',
              timer: 10000,
            });
          }
          // if (res === 'SUCCESS') {
          //   this.spinner.hide();
          //   this.showOTP = true;
          //   Swal.fire({
          //     // position: 'top-right',
          //     title: 'Success!',
          //     text: 'OTP sent To your email',
          //     icon: 'success',
          //     timer: 10000,
          //   });
          // }
        },
        (err) => {
          this.spinner.hide();
          if (err.error.status.message === 'USER_DOES_NOT_EXIST') {
            err.error.status.message = "User Doesn't Exist";
            Swal.fire({
              // title: 'Success!',
              text: err.error.status.message,
              icon: 'error',
              timer: 10000,
            });
          }
        }
      );
  }

  checkConfirmPassword() {
    // if (this.password === this.confirmPassword) {
    //   this.show = false;
    // } else {
    //   this.show = true;
    // }
    // this.show = false;

    this.resetPassword = true;
  }
}


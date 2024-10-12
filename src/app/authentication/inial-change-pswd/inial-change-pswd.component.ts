import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subject, debounceTime } from 'rxjs';
import { HttpGetService } from 'src/app/services/http-get.service';
import { HttpPostService } from 'src/app/services/http-post.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-inial-change-pswd',
  templateUrl: './inial-change-pswd.component.html',
  styleUrls: ['./inial-change-pswd.component.scss']
})
export class InialChangePswdComponent implements OnInit {
  private subject: Subject<string> = new Subject();

  showPassword = false;
  confirmpassword = false;

  public changePassword: FormGroup;
  showSuccessEmailToolTip: string;

  constructor(
    private formBuilder: FormBuilder,
    private post: HttpPostService,
    private httpGet: HttpGetService,
    private spinner: NgxSpinnerService,
    private router: Router

  ) { }


  ngOnInit() {

    this.subject.pipe(debounceTime(1000)).subscribe(() => {
      this.checkEmail();
    });

    this.changePassword = this.formBuilder.group({
      password: ['', Validators.compose([Validators.required, Validators.minLength(8)])],
      confirm_password: [
        '',
        Validators.compose([Validators.required, Validators.minLength(8)]),
      ],
      email: [null, [Validators.required]],
      // confirmPassword: ['', [Validators.required]],
    });
  }

  onPasswordChange() {
    if (this.confirm_password.value == this.password.value) {
      this.confirm_password.setErrors(null);
    } else {
      this.confirm_password.setErrors({ mismatch: true });
    }
  }

  get password(): AbstractControl {
    return this.changePassword.controls['password'];
  }

  get confirm_password(): AbstractControl {
    return this.changePassword.controls['confirm_password'];
  }

  get f() {
    return this.changePassword.controls;
  }

  onEmailChange(args: string) {
    this.showSuccessEmailToolTip = 'nothing';
    if (
      this.changePassword.get('email').valid &&
      this.changePassword.get('email').value !== ''
    ) {
      this.subject.next(args.trim());
    }
    else {
      this.showSuccessEmailToolTip = 'failed';
    }
  }

  checkEmail() {
    if (this.changePassword.controls.email.value.length > 0 && this.changePassword.get('email').valid) {
      this.httpGet
        .nonTokenApi('checkemail?email=' + this.changePassword.controls.email.value)
        .subscribe((res: any) => {
          if (res === true) {
            this.showSuccessEmailToolTip = 'EMAIL ALREADY EXIST';
          } else if (res === false) {
            this.showSuccessEmailToolTip = 'EMAIL NOT EXISTS';
          }
        });
    }
    else {
      this.showSuccessEmailToolTip = 'failed';
    }
  }

  submitChangePassword() {
    this.spinner.show();
    if (this.changePassword.valid) {
      this.post
        .nonTokenApi(
          'changePassword?email=' +
          this.changePassword.value.email +
          '&password=' +
          this.changePassword.value.password,
          ''
        )
        .subscribe(
          (res: any) => {
            if (res.status.message == 'SUCCESS') {
              this.spinner.hide();

              Swal.fire({
                title: 'Success',
                text: 'Password Updated Successfully',
                icon: 'success',
                timer: 10000,
              }).then(() => {
                this.changePassword.reset();
                this.router.navigate(['auth']);
              });
            }
          },
          (err) => {
            this.spinner.hide();
            Swal.fire({
              title: 'error',
              text: err.error.status.message,
              icon: 'error',
              timer: 10000,
            });
          }
        );
    }
  }

}

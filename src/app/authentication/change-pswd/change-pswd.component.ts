import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpPostService } from 'src/app/services/http-post.service';
import { UtilService } from 'src/app/services/util.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-change-pswd',
  templateUrl: './change-pswd.component.html',
  styleUrls: ['./change-pswd.component.scss'],
})
export class ChangePswdComponent implements OnInit {
  public changePassword: FormGroup;
  showPassword = false;
  showNewPassword = false;
  noSpacesPattern = '^[^\\s]*$'
  constructor(
    private formBuilder: FormBuilder,
    private post: HttpPostService,
    private utilServ: UtilService,
    private spinner: NgxSpinnerService,
    public globalServ: GlobalvariablesService,

  ) {}

  ngOnInit() {
    this.globalServ.getMyCompLabels('changePassword');
    this.globalServ.getMyCompPlaceHolders('changePassword');
    this.changePassword = this.formBuilder.group({
      oldPassword: [null, [Validators.required]],
      newPassword: [null, Validators.compose([Validators.required, Validators.minLength(8)])],
      // confirmPassword: ['', [Validators.required]],
    });
  }
  onPasswordChange() {
    this.changePassword.controls['oldPassword'].setValue(this.changePassword.controls['oldPassword'].value.trim())
    if (this.changePassword.controls['newPassword'].value) {
      this.changePassword.controls['newPassword'].setValue(this.changePassword.controls['newPassword'].value.trim())
    }

    const newPasswordControl = this.changePassword.controls['newPassword'];
    const oldPasswordControl = this.changePassword.controls['oldPassword'];

    // Clear previous errors
    newPasswordControl.setErrors(null);
    // Check if passwords match
    if (newPasswordControl.value === oldPasswordControl.value) {
      newPasswordControl.setErrors({ mismatch: true });
    }

    // Check if the password length is valid
    if (newPasswordControl.value && newPasswordControl.value.length < 8) {
      newPasswordControl.setErrors({ minLength: true });
    }

    // Mark as touched or dirty if necessary to show validation errors
    newPasswordControl.markAsDirty();
    newPasswordControl.markAsTouched();
  }
  submitChangePassword() {
    this.onPasswordChange();
    // this.spinner.show();
    if (this.changePassword.valid && this.changePassword.controls.newPassword.value) {
      this.spinner.show();
      this.post
        .create(
          'chpw?oldpwd=' +
            this.changePassword.value.oldPassword +
            '&newpwd=' +
            this.changePassword.value.newPassword,
          ''
        )
        .subscribe(
          (res: any) => {
            this.spinner.hide();
            if (res.response == true) {
              Swal.fire({
                title: 'Success',
                text: 'Password Updated',
                icon: 'success',
                timer: 10000,
              }).then(() => {
                this.changePassword.reset();
                this.utilServ.logout();
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
    } else {
      this.spinner.hide();
      Swal.fire({
        title: 'Error',
        text: 'Please enter old and new passwords',
        icon: 'error',
        timer: 10000,
      });
    }
  }
}

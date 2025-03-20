import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';
import { UtilService } from 'src/app/services/util.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  @ViewChild('tt', { static: false }) tooltip: NgbTooltip;
  public logInForm: FormGroup;
  errorMessage = '';
  // ipAddress: any;
  appvariables = new Map();
  spinnerClass: string;
  isLogging = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private httpGet: HttpGetService,
    private globalServ: GlobalvariablesService,
    private authenticationService: AuthenticationService,
    private router: Router,
    private utilServ: UtilService
  ) {}

  ngOnInit(): void {
    this.createLoginForm();
    // this.getIP();
  }


  ngAfterViewInit() {
    this.utilServ.showGif = false;
  }


  createLoginForm(): void {
    this.logInForm = this.fb.group({
      username: ['', Validators.compose([Validators.required])],
      password: ['', Validators.compose([Validators.required])],
      // company: [''],
    });
    this.logInForm.controls['username'].setValue(localStorage.getItem('userName'))
    // this.logInForm.controls['password'].setValue('welcome1@')
  }


  // getIP(): void {
  //   if (!localStorage.getItem('Ipaddress')) {
  //     this.authenticationService.getIPAdress().subscribe((res: any) => {
  //       this.ipAddress = res.ip;
  //     });
  //   }
  //   else {
  //     this.ipAddress = localStorage.getItem('Ipaddress');

  //   }
  // }

  resetSpinner(): void {
    setTimeout(() => {
      this.spinnerClass = '';
      this.tooltip.close();
    }, 3000);
  }

  login() {
    if (this.logInForm.controls.password.value.trim()) {
      this.errorMessage = '';
      this.isLogging = true;
      this.spinnerClass = 'show-spinner active';
      this.authenticationService
        .login({
          username: this.logInForm.controls.username.value.trim(),
          password: this.logInForm.controls.password.value,
          app: 'Portal',
          mac: localStorage.getItem('Ipaddress')
          // division: ''
        })
        .subscribe(
          (res: any) => {
            this.isLogging = false;
            this.spinnerClass = '';
            // roles present check
            // let role_present = false;
            // res.response.roles.forEach((role) => {
            //   if (this.userRoles.indexOf(role) >= 0 && !role_present) {
            //     role_present = true;
            //   }
            // });
            // && role_present
            if (res.status.message === 'SUCCESS') {
              localStorage.setItem('token', res.response.token);
              const jwtPayload = JSON.parse(window.atob(res.response.token.split('.')[1]));

              localStorage.setItem('userName', jwtPayload.sub);
              // localStorage.setItem('roles', res.response.roles);
              localStorage.setItem('company', res.response.company);
              localStorage.setItem('companyName', res.response.companyName);

              localStorage.setItem('branchCode', res.response.branch);
              this.spinnerClass = 'show-success active';
              this.resetSpinner();
              this.globalServ.setAppvariables(null);
              // role_present = false;
              localStorage.setItem('user-data', JSON.stringify(res.response));
              if (res.response.changepw == true) {
                this.router.navigate(['/changepswd']);
              } else {
                this.router.navigate(['']);
              }
              // home
            } else {
              this.spinnerClass = 'show-fail active';
              this.errorMessage = 'Not Authorised';
              this.tooltip.open();
              this.resetSpinner();
            }
          },
          (err) => {
            this.isLogging = false;
            this.errorMessage = err.error.status.message;
            if (
              err.error.status.message ==
              'MULTIPLE_USERS_EXISTS_WITH_THIS_USERNAME'
            ) {
              Swal.fire({
                title: 'Sorry!',
                text: 'Please Login with your registered Email',
                icon: 'info',
              }).then(() => {
                this.logInForm.controls.username.setValue('');
              });
            }
            this.spinnerClass = 'show-fail active';
            this.resetSpinner();
            this.tooltip.open();
          }
        );
    }
  }
}
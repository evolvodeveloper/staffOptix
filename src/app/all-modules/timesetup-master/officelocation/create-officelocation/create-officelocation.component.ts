import { HttpClient } from '@angular/common/http';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';
import { HttpPostService } from 'src/app/services/http-post.service';
import { HttpPutService } from 'src/app/services/http-put.service';
import { UtilService } from 'src/app/services/util.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create-officelocation',
  templateUrl: './create-officelocation.component.html',
  styleUrls: ['./create-officelocation.component.scss']
})
export class CreateOfficelocationComponent implements OnInit, OnDestroy {
  @Input() public fromParent;

  locationForm: FormGroup;
  countryNames = [];
  stateNames = [];
  locationData: any;
  update = false;
  allOfficeLocations = [];
  sendDataTOEmpDir: any;

  modifyisDefaultRecord: any;
  view = false;
  isSpecialRoute: boolean;
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private utilServ: UtilService,
    private httpGet: HttpGetService,
    private spinner: NgxSpinnerService,
    private httpPost: HttpPostService,
    public globalServ: GlobalvariablesService,
    private httpPut: HttpPutService,
    public activeModal: NgbActiveModal,
    private authenticationService: AuthenticationService
  ) {

  }




  ngOnInit() {
    this.globalServ.getMyCompLabels('officeLocation');
    this.globalServ.getMyCompPlaceHolders('officeLocation');
    this.globalServ.getMyCompErrors('officeLocation');
    this.getCountrys();
    if (this.fromParent?.prop4 === "AddPayrollEmployeeComponent") {
      this.isSpecialRoute = true;
    } else if (this.fromParent?.prop4 == undefined) {
      this.isSpecialRoute = false;
    }
    this.locationForm = this.fb.group({
      locationCode: [null, [Validators.required, this.httpPost.customValidator()]],
      description: [null],
      address1: [null],
      address2: [null],
      city: [null],
      state: [null],
      country: [null],
      isDefault: [false],
      isActive: [true],
    })
    this.getIPAdress();
    this.init();
  }
  init() {
    if (this.utilServ.viewData) {
      this.view = true;
      this.update = false;
      this.locationForm.controls.locationCode.setValue(this.utilServ.viewData.locationCode);
      this.locationForm.controls.description.setValue(this.utilServ.viewData.description);
      this.locationForm.controls.address1.setValue(this.utilServ.viewData.address1);
      this.locationForm.controls.address2.setValue(this.utilServ.viewData.address2);
      this.locationForm.controls.city.setValue(this.utilServ.viewData.city);
      this.locationForm.controls.state.setValue(this.utilServ.viewData.state);
      this.locationForm.controls.country.setValue(this.utilServ.viewData.country);
      this.locationForm.controls.isDefault.setValue(this.utilServ.viewData.isDefault);
      this.locationForm.controls.isActive.setValue(this.utilServ.viewData.isactive);
      this.locationForm.disable();

    }
    else if (this.utilServ.editData) {
      this.view = false;
      this.update = true;
      this.locationForm.controls.locationCode.setValue(this.utilServ.editData.locationCode);
      this.locationForm.controls.description.setValue(this.utilServ.editData.description);
      this.locationForm.controls.address1.setValue(this.utilServ.editData.address1);
      this.locationForm.controls.address2.setValue(this.utilServ.editData.address2);
      this.locationForm.controls.city.setValue(this.utilServ.editData.city);
      this.locationForm.controls.state.setValue(this.utilServ.editData.state);
      this.locationForm.controls.country.setValue(this.utilServ.editData.country);
      this.locationForm.controls.isDefault.setValue(this.utilServ.editData.isDefault);
      this.locationForm.controls.isActive.setValue(this.utilServ.editData.isactive);
      this.locationForm.enable();
      this.locationForm.controls.locationCode.disable();
    }
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
        this.locationForm.controls.country.setValue(this.locationData.country_name);
        this.locationForm.controls.state.setValue(this.locationData.region);
        this.locationForm.controls.city.setValue(this.locationData.city);
        this.getStatesForThatCmp(this.locationData.country_name)
      });
  }
  getCountrys() {
    this.httpGet.nonTokenApi('countries').subscribe((res: any) => {
      this.countryNames = res.response;
    },
      err => {
        console.error(err.error.status.message);
      })
  }
  getStatesForThatCmp(country) {
    this.httpGet.nonTokenApi('states?country=' + country).subscribe((res: any) => {
      this.stateNames = res.response
    }, err => {
      console.error(err.error.status.message);
    })
  }

  checkDefault() {
    const row = this.utilServ.allOfficeLocationsList.find(x => x.isDefault == true && x.isactive == true);
    if (row) {
      if (row.locationCode !== this.locationForm.controls.locationCode.value) {
        if (this.locationForm.controls.isDefault.value) {
          if (this.locationForm.controls.locationCode.value != null) {
            if (row) {
              Swal.fire({
                title: 'Are you sure?',
                html:
                  'Do you want to change the default shift code from ' + '<br><b>' + row?.locationCode + '</b>' +
                  ' to <b>' + this.locationForm.controls.locationCode.value + '</b> ? ',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes',
                allowOutsideClick: false,
              }).then((result) => {
                if (result.isConfirmed) {
                  this.modifyisDefaultRecord = row
                }
                else {
                  this.locationForm.controls.isDefault.setValue(false);
                }
              })
            }
          } else {
            Swal.fire({
              icon: 'warning',
              text: 'Enter Location',
              showConfirmButton: true,
            });
            this.locationForm.controls.isDefault.setValue(false);
          }
        }
        else {
          this.modifyisDefaultRecord = null;
        }
      } else {
        const rows = this.utilServ.allOfficeLocationsList.filter(x => x.isDefault == true);
        if (rows.length > 1) {
          this.locationForm.controls.isDefault.setValue(false);
        } else {
          Swal.fire({
            icon: 'warning',
            text: 'We required one location as Default',
            showConfirmButton: true,
          });
          this.locationForm.controls.isDefault.setValue(true);
        }
      }
    }
  }


  checkTxt() {
    return this.locationForm.get('locationCode').setValue(this.globalServ.checkAndRemoveSpecialCharacters(this.locationForm.controls.locationCode.value), { emitEvent: false });
  }
  create() {
    this.spinner.show();
    this.locationForm.get('locationCode').setValue(this.globalServ.checkAndRemoveSpecialCharacters(this.locationForm.controls.locationCode.value), { emitEvent: false });

    const obj = {
      "locationCode": this.locationForm.controls.locationCode.value,
      "description": this.locationForm.controls.description.value,
      "address1": this.locationForm.controls.address1.value,
      "address2": this.locationForm.controls.address2.value,
      "city": this.locationForm.controls.city.value,
      "state": this.locationForm.controls.state.value,
      "country": this.locationForm.controls.country.value,
      "isDefault": this.locationForm.controls.isDefault.value,
      "isactive": this.locationForm.controls.isActive.value,
    }
    this.httpPost.create('officeLoc', obj).subscribe((res: any) => {
      this.spinner.hide();

      if (res.status.message == 'SUCCESS') {
        if (this.modifyisDefaultRecord) {
          this.updateIsDefaultRecord();
        }
        this.sendDataTOEmpDir = res.response;
        Swal.fire({
          title: 'Success!',
          text: this.locationForm.controls.locationCode.value + ' Created',
          icon: 'success',
          timer: 10000,
        }).then(() => {
          // this.utilServ.salaryComponents = [];
          this.locationForm.reset();
          this.utilServ.allOfficeLocationsList = [];
          this.locationForm.controls.isActive.setValue(true);
          this.locationForm.controls.country.setValue(this.locationData.country_name);
          this.locationForm.controls.state.setValue(this.locationData.region);
          this.locationForm.controls.city.setValue(this.locationData.city);
          this.cancel();
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
        console.error(err.error);
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
      "locationCode": this.locationForm.controls.locationCode.value,
      "description": this.locationForm.controls.description.value,
      "address1": this.locationForm.controls.address1.value,
      "address2": this.locationForm.controls.address2.value,
      "city": this.locationForm.controls.city.value,
      "state": this.locationForm.controls.state.value,
      "country": this.locationForm.controls.country.value,
      "isDefault": this.locationForm.controls.isDefault.value,
      "isactive": this.locationForm.controls.isActive.value,
      buCode: this.utilServ.editData.buCode,
      createdby: this.utilServ.editData.createdby,
      createddate: this.utilServ.editData.createddate,
      id: this.utilServ.editData.id,
      tenantCode: this.utilServ.editData.tenantCode,
    }
    this.httpPut.doPut('officeLocation', obj).subscribe((res: any) => {
      this.spinner.hide();
      if (res.status.message == 'SUCCESS') {
        if (this.modifyisDefaultRecord) {
          this.updateIsDefaultRecord();
        }

        Swal.fire({
          title: 'Success!',
          text: this.locationForm.controls.locationCode.value + ' Updated',
          icon: 'success',
          timer: 10000,
        }).then(() => {
          // this.utilServ.salaryComponents = [];
          this.locationForm.reset(); this.utilServ.allOfficeLocationsList = [];
          this.locationForm.controls.isActive.setValue(true);
          this.locationForm.controls.country.setValue(this.locationData.country_name);
          this.locationForm.controls.state.setValue(this.locationData.region);
          this.locationForm.controls.city.setValue(this.locationData.city);
          this.cancel();
          this.update = false;
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
        console.error(err.error);
        Swal.fire({
          title: 'Error!',
          text: err.error.status.message,
          icon: 'error',
        });
      }
    );
  }
  updateIsDefaultRecord() {
    const req = this.modifyisDefaultRecord;
    req.isDefault = false;
    this.httpPut.doPut('officeLocation', req).subscribe((res: any) => {
      if (res.status.message == 'SUCCESS') {
        this.modifyisDefaultRecord = null;
        this.locationForm.reset();
        this.utilServ.allOfficeLocationsList = [];
        this.update = false; this.cancel();
      }
      else {
        Swal.fire({
          icon: 'warning',
          title: res.status.message,
          showConfirmButton: true,

        });
      }
    }, (err) => {
      this.spinner.hide();
      Swal.fire({
        title: 'Error!',
        text: err.error.status.message,
        icon: 'error',
      });
    });
  }

  cancel() {
    if (this.fromParent?.prop4 === "AddPayrollEmployeeComponent") {
      this.activeModal.close(this.sendDataTOEmpDir);
      this.router.navigateByUrl('all-payroll-employees/addEmployee');
    } else {
      this.router.navigateByUrl('timesetup/locationMaster');
    }
  }
  ngOnDestroy() {
    this.utilServ.viewData = null;
    this.utilServ.editData = null;

  }
}

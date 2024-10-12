import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';
import { HttpPostService } from 'src/app/services/http-post.service';
import { HttpPutService } from 'src/app/services/http-put.service';
import { UtilService } from 'src/app/services/util.service';
import Swal from 'sweetalert2';
import { ListCaptureMembersComponent } from './list-capture-members/list-capture-members.component';


@Component({
  selector: 'app-create-capture-policy',
  templateUrl: './create-capture-policy.component.html',
  styleUrls: ['./create-capture-policy.component.scss']
})
export class CreateCapturePolicyComponent implements OnInit, OnDestroy {
  view = false;
  update = false;
  empCapturePolicy: FormGroup;
  webitemsArray = [];
  mobileItemsArray = [];
  labels: any;
  placeholder: any;
  temp = [];
  ipPattern = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  membersList = [];
  ipAddressEndIsInValid = false;
  ipAddressStartIsInValid = false;

  constructor(
    private globalServ: GlobalvariablesService,
    private spinner: NgxSpinnerService,
    private httpGetService: HttpGetService,
    private httpPostService: HttpPostService,
    private httpPutServ: HttpPutService,
    private router: Router,
    private utilServ: UtilService,
    private formBuilder: FormBuilder,
    private modalService: NgbModal
  ) { }


  getLabelDescription(divId: string): string {
    const label = this.labels?.find(item => item.colCode === divId);
    this.labels?.find(item => item.labelDescription === 'Radius (in meters)');
    return label ? label.labelDescription : '';
  }

  getPlaceholderDescription(divId: string): string {
    const label = this.labels?.find(item => item.colCode === divId);
    return label ? label.labelDescription : '';
  }
  getPlaceholdersDescription(divId: string): string {
    const pc = this.placeholder?.find(item => item.placeholderColCode === divId);
    return pc ? pc.placeholderDescription : '';
  }

  capturePolicy() {
    this.spinner.show();
    this.globalServ.getLabels('capturePolicySetup').subscribe((res: any) => {
      this.labels = res.response;
      this.spinner.hide();
    }, (err) => {
      this.spinner.hide();
      console.error(err.error.status.message);
    });
  }

  getCapturePolicyLabels() {
    this.spinner.show();
    this.globalServ.getPlaceholders('capturePolicySetup').subscribe((res: any) => {
      this.placeholder = res.response;
      this.spinner.hide();
    }, (err) => {
      this.spinner.hide();
      console.error(err.error.status.message);
    });
  }


  ngOnInit() {
    // this.capturePolicy();
    // this.getCapturePolicyLabels();
    this.empCapturePolicy = this.formBuilder.group({
      captureCode: [null, [Validators.required]],
      allowBio: true,
      allowMobileCheckin: false,
      allowWebCheckIn: false,
      isDefault: false,
      isActive: true,
      description: [null],
      // allowRestrictMobileLoc: false,
      restrictWebtoLocation: false,
      restrictMobiletoLocation: false,

    });

    this.init();

  }

  init() {
    if (this.utilServ.viewData) {
      this.view = true;
      this.update = false;

      this.empCapturePolicy.controls.captureCode.setValue(
        this.utilServ.viewData.captureCode
      );
      this.empCapturePolicy.controls.allowBio.setValue(
        this.utilServ.viewData.allowBiometric
      );
      this.empCapturePolicy.controls.allowWebCheckIn.setValue(
        this.utilServ.viewData.allowWebCheckin
      );
      this.empCapturePolicy.controls.allowMobileCheckin?.setValue(
        this.utilServ.viewData.allowMobileCheckin
      );


      this.empCapturePolicy.controls.restrictWebtoLocation.setValue(
        this.utilServ.viewData.hasIpRestriction
      );

      this.empCapturePolicy.controls.restrictMobiletoLocation.setValue(
        this.utilServ.viewData.hasGeoRestriction
      );




      // this.empCapturePolicy.controls.allowRestrictMobileLoc.setValue(
      //   this.utilServ.viewData.allowRestrictMobileLoc
      // );
      // this.empCapturePolicy.controls.allowMobileCheckin.setValue(
      //   this.utilServ.viewData.allowMobileCheckin
      // );
      this.empCapturePolicy.controls.isDefault.setValue(
        this.utilServ.viewData.isDefault
      );
      this.empCapturePolicy.controls.isActive.setValue(
        this.utilServ.viewData.active
      );
      this.empCapturePolicy.controls.description.setValue(
        this.utilServ.viewData.description
      );

      this.utilServ.viewData.geofence.forEach((x) => {

        x.latLong = x.latLong.split(':');
        x.latCode = x.latLong[0];
        x.longCode = x.latLong[1];

        this.mobileItemsArray.push({
          geolocationCode: x.geolocationCode,
          captureCode: x.captureCode,
          latLong: x.latLong,
          latCode: x.latCode,
          longCode: x.longCode,
          id: x.id,
          tenantCode: x.tenantCode,
          radius: x.radius,
          buCode: x.buCode

        });
      });

      this.utilServ.viewData.ipRange.forEach((x) => {
        this.webitemsArray.push({
          ipCode: x.ipCode,
          captureCode: x.captureCode,
          ipStart: x.ipStart,
          ipEnd: x.ipEnd,
          validEndIpAddress: x.ipEnd.match(this.ipPattern) ? true : false,
          validStartIpAddress: x.ipStart.match(this.ipPattern) ? true : false,
          id: x.id,
          tenantCode: x.tenantCode,
          buCode: x.buCode
        });
      });
      this.utilServ.viewData.policyMembersDTOs.forEach(element => {
        element.status = 'NEW'
        this.membersList.push(element)
      });
      this.empCapturePolicy.disable();
    } else if (this.utilServ.editData) {
      this.update = true;
      this.view = false;
      this.empCapturePolicy.enable();

      this.empCapturePolicy.controls.captureCode.setValue(
        this.utilServ.editData.captureCode
      );
      this.empCapturePolicy.controls.allowBio.setValue(
        this.utilServ.editData.allowBiometric
      );
      this.empCapturePolicy.controls.allowWebCheckIn.setValue(
        this.utilServ.editData.allowWebCheckin
      );
      this.empCapturePolicy.controls.allowMobileCheckin.setValue(
        this.utilServ.editData.allowMobileCheckin
      );
      this.empCapturePolicy.controls.restrictWebtoLocation.setValue(
        this.utilServ.editData.hasIpRestriction
      );

      // if(this.utilServ.editData.allowWebCheckIn == true){
      //   this.empCapturePolicy.controls.restrictWebtoLocation.setValue(true);
      // }


      this.empCapturePolicy.controls.restrictMobiletoLocation.setValue(
        this.utilServ.editData.hasGeoRestriction
      );
      // if (this.utilServ.editData.allowMobileCheckin == true) {
      //   this.empCapturePolicy.controls.restrictMobiletoLocation.setValue(true);
      // }
      this.empCapturePolicy.controls.description.setValue(
        this.utilServ.editData?.description
      );
      // this.empCapturePolicy.controls.allowRestrictMobileLoc.setValue(
      //   this.utilServ.editData.allowRestrictMobileLoc
      // );
      // this.empCapturePolicy.controls.allowMobileCheckin.setValue(
      //   this.utilServ.editData.allowMobileCheckin
      // );
      this.empCapturePolicy.controls.isDefault.setValue(
        this.utilServ.editData.isDefault
      );
      this.empCapturePolicy.controls.isActive.setValue(
        this.utilServ.editData.active
      );
      this.empCapturePolicy.controls.captureCode.disable();
      this.utilServ.editData.geofence.forEach((y) => {
        y.latLong = y.latLong.split(':');
        y.latCode = y.latLong[0];
        y.longCode = y.latLong[1];
        this.mobileItemsArray.push({
          geolocationCode: y.geolocationCode,
          captureCode: y.captureCode,
          latLong: y.latLong,
          latCode: y.latCode,
          longCode: y.longCode,
          id: y.id,
          tenantCode: y.tenantCode,
          radius: y.radius,
          buCode: y.buCode

        });
      });

      this.utilServ.editData.ipRange.forEach((z) => {
        this.webitemsArray.push({
          ipCode: z.ipCode,
          captureCode: z.captureCode,
          ipStart: z.ipStart.trim(),
          ipEnd: z.ipEnd.trim(),
          validEndIpAddress: z.ipEnd.match(this.ipPattern) ? true : false,
          validStartIpAddress: z.ipStart.match(this.ipPattern) ? true : false,
          id: z.id,
          tenantCode: z.tenantCode,

          buCode: z.buCode
        });
      });
      this.utilServ.editData.policyMembersDTOs.forEach(element => {
        element.status = 'NEW'
        this.membersList.push(element)
      });
      // this.membersList = this.utilServ.editData.policyMembersDTOs
    }
  }
  checkallowWebCheckIn() {
    const checkLen = this.webitemsArray.filter(x => x.status !== 'DELETED' && x.id !== undefined)
    if (this.empCapturePolicy.controls.restrictWebtoLocation.value == true) {
      if (checkLen.length < 1) {
        this.addWebItem();
      }
    }
    else {
      if (checkLen.length >= 1) {
        Swal.fire({
          // title: 'info!',
          // text: 'There are ' + remaiming.length + ' records needing approval',
          html: `
Previously added IP addresses will be deleted.
   <br>
   Do you want to delete those records ?`,
          icon: 'info',
          allowOutsideClick: false,
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes",
          cancelButtonText: "No"
        }).then((result) => {
          if (result.isConfirmed) {
            this.webitemsArray.forEach((x, i) => {
              if (x.id !== undefined) {
                x.status = 'DELETED'
              } else {
                this.webitemsArray.splice(i, 1);
              }
            })

          }
          else {
            this.empCapturePolicy.controls.restrictWebtoLocation.setValue(true)
          }
        });
      }
      if (checkLen.length !== this.webitemsArray.length) {
        this.webitemsArray.forEach((x, i) => {
          if (x.id == undefined) {
            this.webitemsArray.splice(i, 1);
          }
        })
      }
    }
  }
  checkallowMobileCheckin() {
    const checkLen = this.mobileItemsArray.filter(x => x.status !== 'DELETED' && x.id !== undefined)
    if (this.empCapturePolicy.controls.allowMobileCheckin.value == true) {
      if (checkLen.length > 1) {
        this.addMobileItem();
      }
    }
    else {
      if (checkLen.length >= 1) {
        Swal.fire({
          // title: 'info!',
          // text: 'There are ' + remaiming.length + ' records needing approval',
          html: `
Previously added geolocations will be deleted.
   <br>
   Do you want to delete those records ?`,
          icon: 'info',
          allowOutsideClick: false,
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes",
          cancelButtonText: "No"
        }).then((result) => {
          if (result.isConfirmed) {
            this.mobileItemsArray.forEach((x, i) => {
              if (x.id !== undefined) {
                x.status = 'DELETED'
              } else {
                this.mobileItemsArray.splice(i, 1);
              }
            })
          }
          else {
            this.empCapturePolicy.controls.allowMobileCheckin.setValue(true)
          }
        });
      }
      if (checkLen.length !== this.mobileItemsArray.length) {
        this.mobileItemsArray.forEach((x, i) => {
          if (x.id == undefined) {
            this.mobileItemsArray.splice(i, 1);
          }
        })
      }
    }
  }
  checkIpAddress(c) {
    const row = c
    row.ipStart = row.ipStart.trim();
    row.ipEnd = row.ipEnd.trim();

    if (!row.ipEnd.match(this.ipPattern)) {
      row.validEndIpAddress = false;
      this.ipAddressEndIsInValid = false;

    } else {
      row.validEndIpAddress = true;
      this.ipAddressEndIsInValid = true;
    }
    if (!row.ipStart.match(this.ipPattern)) {
      row.validStartIpAddress = false;
      this.ipAddressStartIsInValid = false;

    } else {
      row.validStartIpAddress = true;
      this.ipAddressStartIsInValid = true;
    }
  }

  addWebItem() {
    const length = this.webitemsArray.length;
    if (length > 0) {
      const isEmpty =
        // this.webitemsArray[length - 1].ipCode.length == 0 &&
        this.webitemsArray[length - 1].ipStart.length == 0 &&
        this.webitemsArray[length - 1].ipEnd.length == 0;
      if (!isEmpty) {
        this.webitemsArray.push({
          ipCode: '',
          ipStart: '',
          ipEnd: '',
        });
      }
    } else {
      this.webitemsArray.push({
        ipCode: '',
        ipStart: '',
        ipEnd: '',
      });
    }
  }


  removeWebItem(index) {
    // this.webitemsArray.splice(index, 1);
    if (this.webitemsArray[index].id !== undefined) {
      this.webitemsArray[index].status = 'DELETED'
    } else {
      this.webitemsArray.splice(index, 1);
    }
  }

  addMobileItem() {
    const length = this.mobileItemsArray.length;
    if (length > 0) {
      const isEmpty =
        this.mobileItemsArray[length - 1].geolocationCode.length == 0 &&
        this.mobileItemsArray[length - 1].latCode.length == 0 &&
        this.mobileItemsArray[length - 1].longCode.length == 0 &&
        this.mobileItemsArray[length - 1].radius.length == 0;
      if (!isEmpty) {
        this.mobileItemsArray.push({
          geolocationCode: '',
          latCode: '',
          longCode: '',
          radius: '',
        });
      }
    } else {
      this.mobileItemsArray.push({
        geolocationCode: '',
        latCode: '',
        longCode: '',
        radius: '',
      });
    }
  }

  removeMobileItem(index) {
    if (this.mobileItemsArray[index].id !== undefined) {
      this.mobileItemsArray[index].status = 'DELETED'
    } else {
      this.mobileItemsArray.splice(index, 1);
    }
  }


  back() {
    this.router.navigateByUrl('timesetup/capturepolicy');
  }

  openModal(row, action) {
    const data = {
      prop1: this.membersList,
      prop2: action,
      // prop3: this.temp
    };
    const modalRef = this.modalService.open(ListCaptureMembersComponent, {
      scrollable: true,
      windowClass: 'myCustomModalClass',
      size: 'xl',
      backdrop: 'static',
    });
    modalRef.componentInstance.fromParent = data;
    modalRef.result.then(
      (result) => {
        this.membersList = result;
      },
    );
  }

  create() {
    let ipAddressResult = false;
    this.webitemsArray.forEach(x => {
      if (!x.ipEnd.match(this.ipPattern) || !x.ipStart.match(this.ipPattern)) {
        ipAddressResult = true
      }
    })
    if (ipAddressResult) {
      Swal.fire({
        title: 'Error!',
        text: 'Enter Valid IPv4 address',
        icon: 'warning',
        showConfirmButton: true,
      });
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const mobileAccess = this.mobileItemsArray.forEach(element => {
        element.latLong = element.latCode + ':' + element.longCode;
      // delete element.latCode;
        // delete element.longCode;
      });
      this.spinner.show();
      const data = {
        attCapturePolicy: {
          captureCode: this.empCapturePolicy.controls.captureCode.value,
          allowBiometric: this.empCapturePolicy.controls.allowBio.value,
          allowMobileCheckin: this.empCapturePolicy.controls.allowMobileCheckin.value,
          allowWebCheckin: this.empCapturePolicy.controls.allowWebCheckIn.value,
          hasIpRestriction: this.empCapturePolicy.controls.restrictWebtoLocation.value,
          hasGeoRestriction: this.empCapturePolicy.controls.restrictMobiletoLocation.value,
          // allowRestrictMobileLoc: this.empCapturePolicy.controls.allowRestrictMobileLoc.value,
          isDefault: this.empCapturePolicy.controls.isDefault.value,
          active: this.empCapturePolicy.controls.isActive.value,
          description: this.empCapturePolicy.controls.description.value,
        },
        ipRange: this.webitemsArray,
        geofence: this.mobileItemsArray,
        policyMembersDTOs: this.membersList
      };
      this.httpPostService.create('capturepolicy', data).subscribe((res: any) => {
        this.spinner.hide();
        if (res.status.message == 'SUCCESS') {
          Swal.fire({
            title: 'Success!',
            text: this.empCapturePolicy.controls.captureCode.value + ' Created',
            icon: 'success',
            timer: 10000,
          }).then(() => {
            this.webitemsArray = [];
            this.mobileItemsArray = [];
            this.membersList = [];
            this.empCapturePolicy.reset();
            this.back();
            this.empCapturePolicy.controls.isActive.setValue(true);
          });
        }
      },
        (err: any) => {
          console.error(err);
          this.spinner.hide();
          Swal.fire({
            title: 'Error!',
            text: err.error.status.message,
            icon: 'warning', showConfirmButton: true,
          });
        }
      );
    }
  }

  ngOnDestroy() {
    this.utilServ.editData = null;
    this.utilServ.viewData = null;
    this.webitemsArray = [];
    this.mobileItemsArray = [];
    this.update = false;
    this.view = false;
  }

  updatePolicy() {
    let ipAddressResult = false;
    this.webitemsArray.forEach(x => {
      if (!x.ipEnd.match(this.ipPattern) || !x.ipStart.match(this.ipPattern)) {
        ipAddressResult = true
      }
    })
    if (ipAddressResult) {
      Swal.fire({
        title: 'Error!',
        text: 'Enter Valid IPv4 address',
        icon: 'warning',
        showConfirmButton: true,
      });
    } else {
      this.webitemsArray.forEach(x => x.ipCode = null)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const mobileAccess = this.mobileItemsArray.forEach(element => {
        element.latLong = element.latCode + ':' + element.longCode;
      // delete element.latCode;
      // delete element.longCode;

      });

      this.spinner.show();
      const data = {
        attCapturePolicy: {
          id: this.utilServ.editData.id,
          captureCode: this.empCapturePolicy.controls.captureCode.value,
          allowBiometric: this.empCapturePolicy.controls.allowBio.value,
          allowMobileCheckin: this.empCapturePolicy.controls.allowMobileCheckin.value,
          hasGeoRestriction: this.empCapturePolicy.controls.restrictMobiletoLocation.value,
          hasIpRestriction: this.empCapturePolicy.controls.restrictWebtoLocation.value,
          allowWebCheckin: this.empCapturePolicy.controls.allowWebCheckIn.value,
          // allowRestrictMobileLoc: this.empCapturePolicy.controls.allowRestrictMobileLoc.value,
          isDefault: this.empCapturePolicy.controls.isDefault.value,
          active: this.empCapturePolicy.controls.isActive.value,
          description: this.empCapturePolicy.controls.description.value,
          tenantCode: this.utilServ.editData.tenantCode,
          buCode: this.utilServ.editData.buCode,
        },
        ipRange: this.webitemsArray,
        geofence: this.mobileItemsArray,
        policyMembersDTOs: this.membersList

      };
      this.httpPutServ.doPut('capturepolicy', data).subscribe((res: any) => {
        this.spinner.hide();

        if (res.status.message == 'SUCCESS') {
          Swal.fire({
            title: 'Success!',
            text: this.empCapturePolicy.controls.captureCode.value + ' Updated',
            icon: 'success',
            timer: 10000,
          }).then(() => {
            this.webitemsArray = [];
            this.mobileItemsArray = [];
            this.membersList = [];
            this.empCapturePolicy.reset();
            this.update = false;
            this.back();
            this.empCapturePolicy.controls.isActive.setValue(true);
          });
        }

      },
        (err: any) => {
          this.spinner.hide();
          Swal.fire({
            title: 'Error!',
            text: err.error.status.message,
            icon: 'error', showConfirmButton: true,
          });
        }
      );
    }
  }

  empty(ev, value: any) {
    if (value === 'for_web') {
      if (ev.target.checked == true) {
        this.addWebItem();
      } else {
        this.webitemsArray = [];
      }
    } else if (value === 'for_mobile') {
      if (ev.target.checked == true) {
        this.addMobileItem();
      } else {
        this.mobileItemsArray = [];
      }
    }
  }

}

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';
import { HttpPostService } from 'src/app/services/http-post.service';
import { HttpPutService } from 'src/app/services/http-put.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-devicemaster',
  templateUrl: './devicemaster.component.html',
  styleUrls: ['./devicemaster.component.scss']
})
export class DevicemasterComponent implements OnInit {
  deviceMasterForm: FormGroup;
  deviceList = [];
  deviceLoc = [];
  view = false;
  update = false;
  hasPermissionToUpdate = false;
  hasPermissionToApprove = false;
  deviceTypes = ['StandAlone', 'Doorlock'];
  captures = ['IN', 'OUT', 'IN_OUT'];

  constructor(private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private router: Router,
    private acRoute: ActivatedRoute,
    private httpPost: HttpPostService,
    private httpPut : HttpPutService,
    public globalServ: GlobalvariablesService,
    private httpGet: HttpGetService) { }

  ngOnInit() {
    this.globalServ.getMyCompLabels('deviceList');
    this.globalServ.getMyCompPlaceHolders('deviceList');
    this.acRoute.data.subscribe(data => {
      const permission = data.condition
      this.hasPermissionToUpdate = permission.hasPermissionToUpdate
      this.hasPermissionToApprove = permission.hasPermissionToApprove
    });
    this.getAllDevices();
    this.getAllDevicesLocations();
    this.deviceMasterForm = this.fb.group({
      id: null,
      deviceId: [null, Validators.required],
      deviceSerial: [null, Validators.required],
      deviceType: [null, Validators.required],
      captures: [null],
      secretKey: [null],
      tsLastUpdated: [null],
      connectorId: [null],
      deviceLocCode: [null],
      useForAttendance: [true],
      hasBiometric: [true],
      hasFacial: [false],
      hasRfid: [null],
      hasPin: [false],
      userName: [null],
      isactive: [true],
      "buCode": null,
      "tenantCode": null,
      "createdby": null,
      "createddate": null,
      "lastmodifiedby": null,
      "lastmodifieddate": null,

    })
  }
  back() {
    this.router.navigateByUrl('/timesetup');
  }
  cancel() {
    this.router.navigateByUrl('/timesetup/deviceMaster');
    this.deviceMasterForm.reset();
    this.deviceMasterForm.enable();
    this.view = false; this.update = false;
  }
  viewData(row) {
    this.view = true;
    this.update = false;
    this.deviceMasterForm.patchValue({
      id: row.id,
      deviceId: row.deviceId,
      deviceSerial: row.deviceSerial,
      deviceType: row.deviceType,
      captures: row.captures,
      secretKey: row.secretKey,
      tsLastUpdated: row.tsLastUpdated,
      connectorId: row.connectorId,
      deviceLocCode: row.deviceLocCode,
      useForAttendance: row.useForAttendance,
      hasBiometric: row.hasBiometric,
      hasFacial: row.hasFacial,
      hasRfid: row.hasRfid,
      hasPin: row.hasPin,
      userName: row.userName,
      isactive: row.isactive,
      "buCode": row.buCode,
      "tenantCode": row.tenantCode,
      "createdby": row.createdby,
      "createddate": row.createddate,
      "lastmodifiedby": row.lastmodifiedby,
      "lastmodifieddate": row.lastmodifieddate,
    })
    this.deviceMasterForm.disable();
  }
  editData(row) {
    this.view = false;
    this.update = true;
    this.deviceMasterForm.patchValue({
      id: row.id,
      deviceId: row.deviceId,
      deviceSerial: row.deviceSerial,
      deviceType: row.deviceType,
      captures: row.captures,
      secretKey: row.secretKey,
      tsLastUpdated: row.tsLastUpdated,
      connectorId: row.connectorId,
      deviceLocCode: row.deviceLocCode,
      useForAttendance: row.useForAttendance,
      hasBiometric: row.hasBiometric,
      hasFacial: row.hasFacial,
      hasRfid: row.hasRfid,
      hasPin: row.hasPin,
      userName: row.userName,
      isactive: row.isactive,
      "buCode": row.buCode,
      "tenantCode": row.tenantCode,
      "createdby": row.createdby,
      "createddate": row.createddate,
      "lastmodifiedby": row.lastmodifiedby,
      "lastmodifieddate": row.lastmodifieddate,
    })
    this.deviceMasterForm.enable();
    this.deviceMasterForm.controls.deviceId.disable();
    // this.deviceMasterForm.controls.deviceSerial.disable();
    // this.deviceMasterForm.controls.secretKey.disable();

  }


  getAllDevices() {
    this.spinner.show();
    this.httpGet.getMasterList('devices').subscribe((res: any) => {
      this.deviceList = res.response;
      this.spinner.hide();
    },
      err => {
        this.spinner.hide();
        console.error(err.error.status.message);
      })
  }
  getAllDevicesLocations() {
    this.spinner.show();
    this.httpGet.getMasterList('devicelocations?access=false').subscribe((res: any) => {
      this.deviceLoc = res.response.filter(x => x.isactive == true);
      this.spinner.hide();
    },
      err => {
        this.spinner.hide();
        console.error(err.error.status.message);
      })
  }
  submit() {
    this.spinner.show();
    const obj = {
      id: this.deviceMasterForm.controls.id.value,
      deviceId: this.deviceMasterForm.controls.deviceId.value,
      deviceSerial: this.deviceMasterForm.controls.deviceSerial.value,
      deviceType: this.deviceMasterForm.controls.deviceType.value,
      captures: this.deviceMasterForm.controls.captures.value,
      secretKey: this.deviceMasterForm.controls.secretKey.value,
      tsLastUpdated: this.deviceMasterForm.controls.tsLastUpdated.value,
      connectorId: this.deviceMasterForm.controls.connectorId.value,
      deviceLocCode: this.deviceMasterForm.controls.deviceLocCode.value,
      useForAttendance: this.deviceMasterForm.controls.useForAttendance.value,
      hasBiometric: this.deviceMasterForm.controls.hasBiometric.value,
      hasFacial: this.deviceMasterForm.controls.hasFacial.value,
      hasRfid: this.deviceMasterForm.controls.hasRfid.value,
      hasPin: this.deviceMasterForm.controls.hasPin.value,
      userName: this.deviceMasterForm.controls.userName.value,
      isactive: this.deviceMasterForm.controls.isactive.value,
      "buCode": this.deviceMasterForm.controls.buCode.value,
      "tenantCode": this.deviceMasterForm.controls.tenantCode.value,
      "createdby": this.deviceMasterForm.controls.createdby.value,
      "createddate": this.deviceMasterForm.controls.createddate.value,
      "lastmodifiedby": this.deviceMasterForm.controls.lastmodifiedby.value,
      "lastmodifieddate": this.deviceMasterForm.controls.lastmodifieddate.value,
    }
    this.httpPost.create('device', obj).subscribe((res: any) => {
      this.spinner.hide();
      if (res.status.message == 'SUCCESS') {
        Swal.fire({
          title: 'Success!',
          text: this.deviceMasterForm.controls.deviceId.value + ' Created',
          icon: 'success',
          timer: 10000,
        }).then(() => {
          this.deviceMasterForm.reset();
          this.getAllDevices();
          this.deviceMasterForm.controls.isactive.setValue(true);

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
      id: this.deviceMasterForm.controls.id.value,
      deviceId: this.deviceMasterForm.controls.deviceId.value,
      deviceSerial: this.deviceMasterForm.controls.deviceSerial.value,
      deviceType: this.deviceMasterForm.controls.deviceType.value,
      captures: this.deviceMasterForm.controls.captures.value,
      secretKey: this.deviceMasterForm.controls.secretKey.value,
      tsLastUpdated: this.deviceMasterForm.controls.tsLastUpdated.value,
      connectorId: this.deviceMasterForm.controls.connectorId.value,
      deviceLocCode: this.deviceMasterForm.controls.deviceLocCode.value,
      useForAttendance: this.deviceMasterForm.controls.useForAttendance.value,
      hasBiometric: this.deviceMasterForm.controls.hasBiometric.value,
      hasFacial: this.deviceMasterForm.controls.hasFacial.value,
      hasRfid: this.deviceMasterForm.controls.hasRfid.value,
      hasPin: this.deviceMasterForm.controls.hasPin.value,
      userName: this.deviceMasterForm.controls.userName.value,
      isactive: this.deviceMasterForm.controls.isactive.value,
      "buCode": this.deviceMasterForm.controls.buCode.value,
      "tenantCode": this.deviceMasterForm.controls.tenantCode.value,
      "createdby": this.deviceMasterForm.controls.createdby.value,
      "createddate": this.deviceMasterForm.controls.createddate.value,
      "lastmodifiedby": this.deviceMasterForm.controls.lastmodifiedby.value,
      "lastmodifieddate": this.deviceMasterForm.controls.lastmodifieddate.value,
    }
    this.httpPut.doPut('device', obj).subscribe((res: any) => {
      this.spinner.hide();
      if (res.status.message == 'SUCCESS') {
        Swal.fire({
          title: 'Success!',
          text: this.deviceMasterForm.controls.deviceId.value + ' Updated',
          icon: 'success',
          timer: 10000,
        }).then(() => {
          this.deviceMasterForm.reset();
          this.getAllDevices();
          this.deviceMasterForm.enable();
          this.update = false;
          this.deviceMasterForm.controls.isactive.setValue(true);
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
        Swal.fire({
          title: 'Error!',
          text: err.error.status.message,
          icon: 'error',
        });
      }
    );
  }
}

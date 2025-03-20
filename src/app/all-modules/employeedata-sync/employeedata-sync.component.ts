import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { HttpGetService } from 'src/app/services/http-get.service';
import { HttpPostService } from 'src/app/services/http-post.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-employeedata-sync',
  templateUrl: './employeedata-sync.component.html',
  styleUrl: './employeedata-sync.component.scss'
})
export class EmployeedataSyncComponent {

  emplist = [];
  checkedAll = false;
  selectedEmp = [];
  selectedDevices = [];
  devicesList = [];
  checkAllDevices = false;
  masterEmpData = [];
  masterDeviceData = [];
  fingermissingData = [];
  fingermissingDataTemp = [];

  facemissingData = [];
  facemissingDataTemp = [];
  faceaddedData = [];
  faceaddedDataTemp = [];
  fingeraddedData = [];
  fingeraddedDataTemp = [];
  // uploadUser = false;
  uploadFingerprint = false;
  uploadFace = false;
  constructor(
    private router: Router,
    private spinner: NgxSpinnerService,
    private httpGetService: HttpGetService,
    private httpPost: HttpPostService
  ) { }
  ngOnInit() {
    this.getEmps();
    this.getDevices();
  }
  getDevices() {
    this.httpGetService.getMasterList('devices').subscribe((data: any) => {
      // this.devicesList = data.response.filter(x => x.deviceBrand == 'ESSL' && x.isactive == true)
      this.devicesList = data.response.filter(x => x.isactive == true);
      this.masterDeviceData = data.response.filter(x => x.isactive == true);
    },
      err => {
        console.error(err);

      })
  }

  getEmps() {
    this.emplist = [];
    this.spinner.show();
    this.httpGetService.getMasterList('getAllDeviceEmployees').subscribe((res: any) => {
      this.spinner.hide();
      this.masterEmpData = res.response;
      this.emplist = res.response;
    },
      err => {
        this.spinner.hide();
        Swal.fire({
          title: 'Error!',
          text: err.error.status.message,
          icon: 'error',
        });
      })
  }


  selectAllEmps(event) {
    this.checkedAll = event.target.checked;
    if (this.checkedAll) {
      this.selectedEmp = [];
      this.emplist.forEach(x => {
        x.checked = true;
        this.selectedEmp.push({
          employeeCodeInDevice: x.employeeCodeInDevice,
          employeeCode: x.employeeCode,
          employeeId: x.employeeId,
          employeeName: x.employeeName
        });
      })
    } else {
      this.emplist.forEach((x) => {
        x.checked = false;
      })
      this.selectedEmp = [];
    }
  }
  selectedEmpFun(val, emps) {
    emps.checked = true;
    const index = this.selectedEmp.findIndex(
      (d) => d.employeeCode == emps.employeeCode
    );
    if (index > -1) {
      this.selectedEmp.splice(index, 1);
    }
    else {
      this.selectedEmp.push({
        employeeCodeInDevice: emps.employeeCodeInDevice,
        employeeCode: emps.employeeCode,
        employeeId: emps.employeeId,
        employeeName: emps.employeeName
      });
    }
  }
  selectedDeviceFun(val, dv) {
    dv.checked = true;
    const index = this.selectedDevices.findIndex(
      (d) => d.deviceSerial == dv.deviceSerial
    );
    if (index > -1) {
      this.selectedDevices.splice(index, 1);
    }
    else {
      this.selectedDevices.push({
        deviceSerial: dv.deviceSerial,
        deviceId: dv.deviceId,
        deviceBrand: dv.deviceBrand
      });
    }
  }


  selectAllDevices(event) {
    this.checkAllDevices = event.target.checked;
    if (this.checkAllDevices) {
      this.selectedDevices = [];
      this.devicesList.forEach(x => {
        x.checked = true;
        this.selectedDevices.push({
          deviceSerial: x.deviceSerial,
          deviceId: x.deviceId,
          deviceBrand: x.deviceBrand
        });
      })
    } else {
      this.devicesList.forEach((x) => {
        x.checked = false;
      })
      this.selectedDevices = [];
    }
  }

  back() {
    this.router.navigateByUrl('/dashboard');
  }

  employeeeFilter(event) {
    const val = event.target.value.toLowerCase();
    if (val == '') {
      this.emplist = [...this.masterEmpData];
    } else {
      const temp = this.masterEmpData.filter(function (d) {
        return (d.employeeName && d.employeeName.toLowerCase().indexOf(val) !== -1) ||
          (d.employeeRefCode && d.employeeRefCode.toLowerCase().indexOf(val) !== -1) ||
          (d.employeeCode && d.employeeCode.toLowerCase().indexOf(val) !== -1) || !val;
      });
      this.emplist = temp;
    }
  }
  deviceFilter(event) {
    const val = event.target.value.toLowerCase();
    if (val == '') {
      this.devicesList = [...this.masterDeviceData];
    } else {
      const temp = this.masterDeviceData.filter(function (d) {
        return (d.deviceSerial && d.deviceSerial.toLowerCase().indexOf(val) !== -1) || !val;
      });
      this.devicesList = temp;
    }
  }
  create() {
    this.facemissingData = [];
    this.faceaddedData = [];
    this.fingeraddedData = [];
    this.fingermissingData = [];
    if (this.selectedEmp.length == 0 || this.selectedDevices.length == 0) {
      Swal.fire({
        title: 'Error!',
        text: 'Please select at least one employee and one target device',
        icon: 'info',
      });
    } else {
      if (this.uploadFace == false && this.uploadFingerprint == false) {
        Swal.fire({
          title: 'Error!',
          text: 'You must check at least one below option to continue.',
          icon: 'info',
        });
      }
      else {
        const employeeMultdbDTOList = [], devicesDTOList = [];
        this.selectedEmp.forEach(x => {
          employeeMultdbDTOList.push({
            employeeCodeInDevice: x.employeeCodeInDevice,
            employeeId: x.employeeId,
            employeeName: x.employeeName
          })
        })
        this.selectedDevices.forEach(dv => {
          devicesDTOList.push({
            deviceSerial: dv.deviceSerial,
          })
        })
        const obj = {
          employeeMultdbDTOList,
          devicesDTOList,
          "deviceTypes": {
            "face": this.uploadFace,
            "finger": this.uploadFingerprint,
            "user": true
          }
        }
        this.spinner.show();
        this.httpPost.create('deviceCommandsMultdb', obj).subscribe((res: any) => {
          if (res.response) {
            const issues = [];
            const data = res.response
            if (data) {
              for (const [key, value] of Object.entries(data)) {
                if (value) {
                  issues.push(`${key}: ${value}`)
                }
              }
              issues.forEach(issue => {
                if (issue.includes('Face data not found for users:')) {
                  // Extract users after 'Face data not found for users:'
                  const facemissingData = issue.split('Face data not found for users: ')[1].split(',');
                  const employeeData = facemissingData.map(x => ({
                    employeeName: null,  // You can replace null with actual names if available
                    employeeCodeInDevice: null, // You can replace null with actual codes if available
                    userId: x // The user ID (e.g., "102AMPT", "30", etc.)
                  }));

                  this.emplist.forEach(c => {
                    const find = employeeData.find(x => x.userId == c.employeeCodeInDevice);
                    if (find) {
                      find.employeeName = c.employeeName,
                        find.employeeCodeInDevice = c.employeeCodeInDevice
                    }
                  })
                  this.facemissingData = employeeData;
                  this.facemissingDataTemp = employeeData;

                }
                if (issue.includes('Face data added for users:')) {
                  // Extract users after 'Face data added for users:'
                  const faceaddedData = issue.split('Face data added for users: ')[1].split(',');
                  const employeeData = faceaddedData.map(x => ({
                    employeeName: null,  // You can replace null with actual names if available
                    employeeCodeInDevice: null, // You can replace null with actual codes if available
                    userId: x // The user ID (e.g., "102AMPT", "30", etc.)
                  }));

                  this.emplist.forEach(c => {
                    const find = employeeData.find(x => x.userId == c.employeeCodeInDevice);
                    if (find) {
                      find.employeeName = c.employeeName,
                        find.employeeCodeInDevice = c.employeeCodeInDevice
                    }
                  })
                  this.faceaddedData = employeeData; this.faceaddedDataTemp = employeeData;
                }
                if (issue.includes('Finger data added for users:')) {
                  // Extract users after 'Face data added for users:'
                  const fingeraddedData = issue.split('Finger data added for users: ')[1].split(',');
                  const employeeData = fingeraddedData.map(x => ({
                    employeeName: null,  // You can replace null with actual names if available
                    employeeCodeInDevice: null, // You can replace null with actual codes if available
                    userId: x // The user ID (e.g., "102AMPT", "30", etc.)
                  }));

                  this.emplist.forEach(c => {
                    const find = employeeData.find(x => x.userId == c.employeeCodeInDevice);
                    if (find) {
                      find.employeeName = c.employeeName,
                        find.employeeCodeInDevice = c.employeeCodeInDevice
                    }
                  })
                  this.fingeraddedData = employeeData;
                  this.fingeraddedDataTemp = employeeData;
                }
                if (issue.includes('Finger data not found for users:')) {
                  // Extract users after 'Face data added for users:'
                  const fingermissingData = issue.split('Finger data not found for users: ')[1].split(',');
                  const employeeData = fingermissingData.map(x => ({
                    employeeName: null,  // You can replace null with actual names if available
                    employeeCodeInDevice: null, // You can replace null with actual codes if available
                    userId: x // The user ID (e.g., "102AMPT", "30", etc.)
                  }));

                  this.emplist.forEach(c => {
                    const find = employeeData.find(x => x.userId == c.employeeCodeInDevice);
                    if (find) {
                      find.employeeName = c.employeeName,
                        find.employeeCodeInDevice = c.employeeCodeInDevice
                    }
                  })
                  this.fingermissingData = employeeData;
                  this.fingermissingDataTemp = employeeData;
                }
                // 
              });
            }
            if (res.status.message !== 'SUCCESS') {
              this.spinner.hide();
              Swal.fire({
                title: 'Error!',
                text: res.status.message,
                icon: 'error',
              })
            } else {
              this.spinner.hide();
              Swal.fire({
                title: 'Success!',
                text: res.status.message,
                icon: 'success',
              })
            }
          } else {
            this.spinner.hide();
            Swal.fire({
              title: 'Error!',
              text: res.status.message,
              icon: 'error',
            })
          }
        },
          err => {
            this.spinner.hide();
            console.error(err);
            Swal.fire({
              title: 'Error!',
              text: err.error.status.message,
              icon: 'error',
            })
          })

      }
    }
  }
  fingermissingDataFilter(event) {
    const val = event.target.value.toLowerCase();
    if (val == '') {
      this.fingermissingData = [...this.fingermissingDataTemp];
    } else {
      const temp = this.fingermissingDataTemp.filter(function (d) {
        return (d.employeeName && d.employeeName.toLowerCase().indexOf(val) !== -1) ||
          (d.employeeCodeInDevice && d.employeeCodeInDevice.toLowerCase().indexOf(val) !== -1) ||
          (d.userId && d.userId.toLowerCase().indexOf(val) !== -1) || !val;
      });
      this.fingermissingData = temp;
    }
  }
  facemissingDataFilter(event) {
    const val = event.target.value.toLowerCase();
    if (val == '') {
      this.facemissingData = [...this.facemissingDataTemp];
    } else {
      const temp = this.facemissingDataTemp.filter(function (d) {
        return (d.employeeName && d.employeeName.toLowerCase().indexOf(val) !== -1) ||
          (d.employeeCodeInDevice && d.employeeCodeInDevice.toLowerCase().indexOf(val) !== -1) ||
          (d.userId && d.userId.toLowerCase().indexOf(val) !== -1) || !val;
      });
      this.facemissingData = temp;
    }
  }
  fingeraddedDataFilter(event) {
    const val = event.target.value.toLowerCase();
    if (val == '') {
      this.fingeraddedData = [...this.fingeraddedDataTemp];
    } else {
      const temp = this.fingeraddedDataTemp.filter(function (d) {
        return (d.employeeName && d.employeeName.toLowerCase().indexOf(val) !== -1) ||
          (d.employeeCodeInDevice && d.employeeCodeInDevice.toLowerCase().indexOf(val) !== -1) ||
          (d.userId && d.userId.toLowerCase().indexOf(val) !== -1) || !val;
      });
      this.fingeraddedData = temp;
    }
  }
  faceaddedDataFilter(event) {
    const val = event.target.value.toLowerCase();
    if (val == '') {
      this.faceaddedData = [...this.faceaddedDataTemp];
    } else {
      const temp = this.faceaddedDataTemp.filter(function (d) {
        return (d.employeeName && d.employeeName.toLowerCase().indexOf(val) !== -1) ||
          (d.employeeCodeInDevice && d.employeeCodeInDevice.toLowerCase().indexOf(val) !== -1) ||
          (d.userId && d.userId.toLowerCase().indexOf(val) !== -1) || !val;
      });
      this.faceaddedData = temp;
    }
  }
}

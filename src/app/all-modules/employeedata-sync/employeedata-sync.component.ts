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
  uploadUser = false;
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
    this.httpGetService.getEmployeesByDepartment('ALL').subscribe((res: any) => {
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
          employeeCode: x.employeeCode,
          employeeName: x.employeeName,
          deptCode: x.deptCode,
          employeeRefCode: x.employeeRefCode,
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
        employeeCode: emps.employeeCode,
        employeeName: emps.employeeName,
        employeeRefCode: emps.employeeRefCode,
        deptCode: emps.deptCode,
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
    if (this.selectedEmp.length == 0 || this.selectedDevices.length == 0) {
      alert('Please select at least one employee and one device');
      Swal.fire({
        title: 'Error!',
        text: 'Please select at least one employee and one target device',
        icon: 'info',
      });
    } else {
      if (this.uploadFace == false && this.uploadFingerprint == false && this.uploadUser == false) {
        alert('Please upload at least one of the required documents');
        Swal.fire({
          title: 'Error!',
          text: 'You must check at least one option below to continue.',
          icon: 'info',
        });
      }
      else {
        console.log('create', this.selectedEmp, this.selectedDevices, this.uploadFace, this.uploadFingerprint, this.uploadUser);
        const employeeMultdbDTOList = [], devicesMultdbDTOList = [];
        this.selectedEmp.forEach(x => {
          employeeMultdbDTOList.push({
            employeeCodeInDevice: x.employeeRefCode,
          })
        })
        this.selectedDevices.forEach(dv => {
          devicesMultdbDTOList.push({
            serialNumber: dv.deviceSerial,
          })
        })
        const obj = {
          employeeMultdbDTOList,
          devicesMultdbDTOList,
          "deviceTypes": {
            "face": this.uploadFace,
            "finger": this.uploadFingerprint,
            "user": this.uploadFace
          }
        }
        console.log(obj);
        this.httpPost.create('deviceCommandsMultdb', obj).subscribe((res: any) => {
          if (res.status.message !== 'SUCCESS') {
            const issues = [];
            const data = res.response.object
            if (data) {
              for (const [key, value] of Object.entries(data)) {
                if (value) {
                  console.log(`${key}: ${value}`);
                  issues.push(`${key}: ${value}`)
                }
              }
              Swal.fire({
                title: 'Error!',
                text: issues.join('\n'),
                icon: 'error',
              })
              console.log('issues', issues);
            } else {
              Swal.fire({
                title: 'Error!',
                text: res.status.message,
                icon: 'error',
                timer: 10000,
              })
            }

          } else {
            Swal.fire({
              title: 'Success!',
              text: 'Data Uploaded',
              icon: 'success',
              timer: 10000,
            })
          }
        },
          err => {
            console.error(err);
            Swal.fire({
              title: 'Error!',
              text: err.error.status.message,
              icon: 'error',
              timer: 10000,
            })
          })

      }
    }
  }
}

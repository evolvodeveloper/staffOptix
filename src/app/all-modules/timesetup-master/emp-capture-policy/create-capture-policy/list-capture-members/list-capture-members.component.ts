
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { HttpGetService } from 'src/app/services/http-get.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list-capture-members',
  templateUrl: './list-capture-members.component.html',
  styleUrls: ['./list-capture-members.component.scss']
})
export class ListCaptureMembersComponent implements OnInit {

  @Input() public fromParent;


  departments_list: any = [];
  update = false;
  view = false;
  projects_list: any = [];
  employee_list: any = [];
  forEmployee = false;
  forDepartment = false;
  forProject = false;
  captureCodes = [];
  memberCode = 'Employee';
  checkedRecords = [];

  memberCodes = [
    {
      code: '1',
      name: 'Project'
    },
    {
      code: '2',
      name: 'Department'
    },

    {
      code: '3',
      name: 'Employee'
    }

  ];
  constructor(
    private httpGetService: HttpGetService,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,

  ) { }

  ngOnInit() {
    this.fromParent.prop1.forEach(element => {
      this.checkedRecords.push({
        buCode: element.buCode,
        captureCode: element.captureCode,
        id: element.id,
        memberCode: element.memberCode,
        checked: true,
        status: element.status,
        memberType: element.memberType,
        tenantCode: element.tenantCode
      })
    });
    // this.getCaptureCodes();
    if (this.memberCode == 'Employee') {
      this.getMembers();
    }
  }
  selectedEmp(val, emps) {
    if (this.memberCode == 'Employee') {
      const index = this.checkedRecords.findIndex(x => x.memberCode === emps.employeeCode && x.memberType == this.memberCode);
      if (index >= 0) {
        if (this.checkedRecords[index].id !== undefined && this.checkedRecords[index].status !== 'DELETED') {
          this.checkedRecords[index].status = 'DELETED'
        } else if (this.checkedRecords[index].id !== undefined && this.checkedRecords[index].status == 'DELETED') {
          this.checkedRecords[index].status = 'NEW'
        }
        else {
          this.checkedRecords.splice(index, 1);
        }
      }
      else {
        this.checkedRecords.push({
          'memberCode': emps.employeeCode,
          memberType: this.memberCode,
          'checked': val.target.checked
        })
      }
    } else if (this.memberCode == 'Department') {
      const index1 = this.checkedRecords.findIndex(x => x.memberCode === emps.deptCode && x.memberType == this.memberCode);
      if (index1 >= 0) {
        if (this.checkedRecords[index1].id !== undefined) {
          this.checkedRecords[index1].status = 'DELETED'
        } else {
          this.checkedRecords.splice(index1, 1);
        }
      }
      else {
        this.checkedRecords.push({
          'memberCode': emps.deptCode,
          memberType: this.memberCode,
          'checked': val.target.checked
        })
      }
    }
    else if (this.memberCode == 'Project') {
      const index = this.checkedRecords.findIndex(x => x.memberCode === emps.categoryCode && x.memberType == this.memberCode);
      if (index >= 0) {
        if (this.checkedRecords[index].id !== undefined) {
          this.checkedRecords[index].status = 'DELETED'
        } else {
          this.checkedRecords.splice(index, 1);
        }
      }
      else {
        this.checkedRecords.push({
          'memberCode': emps.categoryCode,
          memberType: this.memberCode,
          'checked': val.target.checked
        })
      }
    }
  }

  getMembers() {
    if (this.memberCode == 'Employee') {
      this.forEmployee = true;
      this.forDepartment = false;
      this.forProject = false;
      this.httpGetService.getMasterList('emp/active').subscribe((res: any) => {
        res.response.map(x => x.checked = false);
        this.checkedRecords.forEach(element => {
          if (element.status !== 'DELETED') {
            if (this.memberCode.toLowerCase() == element.memberType.toLowerCase() || this.memberCode == element.memberType) {
              const id = res.response.findIndex(x => x.employeeCode == element.memberCode)
              if (id >= 0) {
                res.response[id].checked = true
              }
            }
          }
        });
        this.employee_list = res.response;
      },
        err => {
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: err.error.status.message,
          })
        }
      );
    } else if (this.memberCode == 'Department') {
      this.forDepartment = true;
      this.forEmployee = false;
      this.forProject = false;
      this.httpGetService.getMasterList('depts/active').subscribe((res: any) => {
        res.response.map(x => x.checked = false);
        this.checkedRecords.forEach(element => {
          if (element.status !== 'DELETED') {
            if (this.memberCode == element.memberType || this.memberCode.toLowerCase() == element.memberType.toLowerCase()) {
              const id = res.response.findIndex(x => x.deptCode == element.memberCode)
              if (id >= 0) {
                res.response[id].checked = true
              }
            }
          }
        });

        this.departments_list = res.response;
      },
        err => {
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: err.error.status.message,
          })
        }
      );
    } else if (this.memberCode == 'Project') {
      this.forProject = true;
      this.forDepartment = false;
      this.forEmployee = false;
      this.httpGetService.getMasterList('getprojwithaccess').subscribe((res: any) => {
        res.response.map(x => x.checked = false);
        this.checkedRecords.forEach(element => {
          if (element.status !== 'DELETED') {
            if (this.memberCode.toLowerCase() == element.memberType.toLowerCase() || this.memberCode == element.memberType) {
              const id = res.response.findIndex(x => x.categoryCode == element.memberCode)
              if (id >= 0) {
                res.response[id].checked = true
              }
            }
          }
        });
        this.projects_list = res.response;
      },
        err => {
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: err.error.status.message,
          })
        }
      );
    }

  }

  sendDataAndCloseModel() {
    this.activeModal.close(this.checkedRecords);
  }

  closeModal() {
    this.activeModal.close(this.checkedRecords);
  }

}

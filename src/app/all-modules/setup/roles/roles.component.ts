import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';
import { HttpPostService } from 'src/app/services/http-post.service';
import { HttpPutService } from 'src/app/services/http-put.service';
import { UtilService } from 'src/app/services/util.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss'],
})
export class RolesComponent implements OnInit, OnDestroy {
  rows = [];
  temp = [];
  config: any;
  selectedRoles: any;
  selectedRole: any;
  roleForm: FormGroup;
  // isactive = true;
  companyCode: string;
  view = false;
  edit = false;
  roleId: any;
  current_editData: any;
  labels:any;

  active = false;
  hasPermissionToUpdate = false;
  hasPermissionToApprove = false;
  charLimit: number;
  roleCode: string;
  constructor(
    private fb: FormBuilder,
    private httpPostService: HttpPostService,
    private httpPutService: HttpPutService,
    private acRoute: ActivatedRoute,
    private router: Router,
    private httpGetService: HttpGetService,
    private spinner: NgxSpinnerService,
    private globalServ: GlobalvariablesService,
    private modalService: NgbModal,
    private UtilServ: UtilService
  ) {
    this.config = {
      itemsPerPage: 25,
      currentPage: 1,
      totalItems: this.rows.length,
    };
  }

  
  getLabelDescription(divId: string): string {
    const label = this.labels?.find(item => item.colCode === divId);
    return label ? label.labelDescription : '';
  }
  getRolesLabels() {
    this.spinner.show();
    this.globalServ.getLabels('roleMaster').subscribe((res: any) => {
      this.labels = res.response;
      this.spinner.hide();
    }, (err) => {
      this.spinner.hide();
      console.error(err.error.status.message);
    });
  }
  ngOnInit(): void {
    // this.getRolesLabels();   
    this.acRoute.data.subscribe(data => {
      const permission = data.condition
      this.hasPermissionToUpdate = permission.hasPermissionToUpdate
      this.hasPermissionToApprove = permission.hasPermissionToApprove
    });
    this.getRoles();
    this.roleForm = this.fb.group({
      roleCode: ['', [Validators.required, this.httpPostService.customValidator()]],
      isactive: [true],
    });
    this.charLimit = this.globalServ.charLimitValue;

    this.companyCode = localStorage.getItem('company');
    this.roleForm.controls.isactive.setValue(true);
  }

  viewData(row) {
    this.view = true;
    this.edit = false;
    this.roleForm.disable();
    this.patchData(row);
  }

  editData(row) {
    this.view = false;
    this.edit = true;
    this.current_editData = row;
    this.roleForm.enable();
    this.patchData(row);
  }
  back() {
    this.router.navigateByUrl('/dashboard');
  }

  create() {
    this.view = false;
    this.edit = false;
    this.roleForm.reset();
    this.roleForm.controls.isactive.setValue(true);
    this.roleForm.enable();
  }

  patchData(data) {
    this.roleForm.patchValue({
      roleCode: data.roleCode,
      isactive: data.isactive,
    });
  }

  getRoles(): void {
    this.spinner.show();
    this.httpGetService.getMasterList('secroles?app=atlas').subscribe(
      (res: any) => {
        this.rows = res.response;
        this.temp = [...this.rows];
        this.config.totalItems = this.rows.length;
        this.spinner.hide();
      },
      (err) => {
        console.error(err.error.status.message);
        this.spinner.hide();
      }
    );
  }

  pageChanged(event) {
    this.config.currentPage = event;
  }
  resultsPerPage(event) {
    this.config.itemsPerPage =
      event.target.value == 'all' ? this.temp.length : event.target.value;
    this.config.currentPage = 1;
  }

  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    if (val == '') {
      this.rows = [...this.temp];
    } else {
      const temp = this.temp.filter(function (d) {
        return d.roleCode.toLowerCase().indexOf(val) !== -1 || !val;
      });
      this.rows = temp;
    }
    this.config.totalItems = this.rows.length;
    this.config.currentPage = 1;
  }


  saveChanges() {
    if (this.edit) {
      const obj = {
        roleCode: this.roleForm.value.roleCode.trim(),
        isactive:
          this.roleForm.value.isactive == null
            ? false
            : this.roleForm.value.isactive,
        tenantCode: this.companyCode,
        createdby: this.current_editData.createdby,
        createddate: this.current_editData.createddate,
        roleId: this.current_editData.roleId,
      };
      this.spinner.show();
      this.httpPutService.doPut('secrole', JSON.stringify(obj)).subscribe(
        (res: any) => {
          this.spinner.hide();
          if (res.status.message == 'SUCCESS') {
            Swal.fire({
              title: 'Success!',
              text: this.roleForm.controls.roleCode.value + ' Updated',
              icon: 'success',
              timer: 10000,
            }).then(() => {
              this.roleForm.reset();
              this.roleForm.controls.isactive.setValue(true);
              this.getRoles();
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
            timer: 3000,
          });
        }
      );
    } else {
      const obj: any = this.roleForm.value;
      if (obj.isactive == null) {
        obj.isactive = false;
      }
      (obj.roleCode = this.roleForm.value.roleCode.trim()),
        (obj.isactive =
          this.roleForm.value.isactive == null
            ? false
            : this.roleForm.value.isactive),
        this.spinner.show();
      this.httpPostService.create('secrole', JSON.stringify([obj])).subscribe(
        (res: any) => {
          this.spinner.hide();
          if (res.status.message == 'SUCCESS') {
            Swal.fire({
              title: 'Success!',
              text: this.roleForm.controls.roleCode.value + ' is Created',
              icon: 'success',
              timer: 10000,
            }).then(() => {
              this.roleForm.reset();
              this.getRoles();
              this.roleForm.controls.isactive.setValue(true);
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
          console.error(err.error.status.message);
          this.spinner.hide();
          Swal.fire({
            title: 'Error!',
            text: err.error.status.message,
            icon: 'error',
            timer: 3000,
          });
        }
      );
    }
  }

  ngOnDestroy() {
    this.UtilServ.editData = null;
    this.UtilServ.viewData = null;
  }

  updatePageSize(pageSize: number) {
    this.config.itemsPerPage = pageSize;
    this.pageChanged;
  }
}

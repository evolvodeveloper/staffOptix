import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';
import { HttpPostService } from 'src/app/services/http-post.service';
import { HttpPutService } from 'src/app/services/http-put.service';
import { UtilService } from 'src/app/services/util.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create-custom-feilds',
  templateUrl: './create-custom-feilds.component.html',
  styleUrl: './create-custom-feilds.component.scss'
})
export class CreateCustomFeildsComponent implements OnInit, OnDestroy{
  customFeildsform: FormGroup;
  view = false;
  update = false;
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    private httpPost: HttpPostService,
    private httpGetService: HttpGetService,
    private UtilServ: UtilService,
    private sanitizer: DomSanitizer,
    private globalServ: GlobalvariablesService,
    private httpPut: HttpPutService,
  ) { }
  ngOnDestroy() {
    this.UtilServ.editData = null;
    this.UtilServ.viewData = null;
  }

  ngOnInit() {
    this.customFeildsform = this.formBuilder.group({
      entityField: [null],
      entityDataType: [null],
      uiField: [null],
      uiDataType: [null],
      active: false,


    });

    if (this.UtilServ.viewData) {
      this.view = true;
      this.update = false;
      this.customFeildsform.controls.entityField.setValue(
        this.UtilServ.viewData.entityField
      );
      this.customFeildsform.controls.entityDataType.setValue(
        this.UtilServ.viewData.entityDataType
      );
      this.customFeildsform.controls.uiField.setValue(
        this.UtilServ.viewData.uiField
      );
      this.customFeildsform.controls.uiDataType.setValue(
        this.UtilServ.viewData.uiDataType
      );
      this.customFeildsform.controls.active.setValue(
        this.UtilServ.viewData.active
      );
      this.customFeildsform.disable();

    } else if (this.UtilServ.editData) {
      this.update = true;
      this.view = false;
      this.customFeildsform.enable();

      this.customFeildsform.controls.entityField.setValue(
        this.UtilServ.editData.entityField
      );
      this.customFeildsform.controls.entityDataType.setValue(
        this.UtilServ.editData.entityDataType
      );
      this.customFeildsform.controls.uiField.setValue(
        this.UtilServ.editData.uiField
      );
      this.customFeildsform.controls.uiDataType.setValue(
        this.UtilServ.editData.uiDataType
      );
      this.customFeildsform.controls.active.setValue(
        this.UtilServ.editData.active
      );
    }
  }

  create() {
      console.log(this.customFeildsform.value);
      
      this.spinner.show();

      const data = {
        entityField: this.customFeildsform.controls.entityField.value,
        entityDataType: this.customFeildsform.controls.entityDataType.value,
        uiField: this.customFeildsform.controls.uiField.value,
        uiDataType: this.customFeildsform.controls.uiDataType.value,
        active: this.customFeildsform.controls.active.value,
      };
      console.log(data);
      
      
      this.httpPost.create('hr/visit/ui-mapping/', data).subscribe((res: any) => {
        if (res.status.message == 'SUCCESS') {
          this.spinner.hide();
          Swal.fire({
            title: 'Success',
            text: 'Custom Field Created',
            icon: 'success',
            confirmButtonText: 'OK',
          }).then((result) => {
            if (result.isConfirmed) {
              this.customFeildsform.reset();
              this.router.navigateByUrl('/setup/visit-config');
            }
          });
        }
      },
        err => {
          this.spinner.hide();
          Swal.fire({
            title: 'Error!',
            text: err.error.status.message,
            icon: 'error',
          });
          console.error(err.error.status.message);
        });

  }

  Update(){
    this.spinner.show();

    const data = {
      id: this.UtilServ.editData.id,
      entityField: this.customFeildsform.controls.entityField.value,
      entityDataType: this.customFeildsform.controls.entityDataType.value,
      uiField: this.customFeildsform.controls.uiField.value,
      uiDataType: this.customFeildsform.controls.uiDataType.value,
      active: this.customFeildsform.controls.active.value,
      companyCode: this.UtilServ.editData.companyCode,
      branchCode: this.UtilServ.editData.branchCode,
    };
    console.log(data);
    
    this.httpPut.doPut('hr/visit/ui-mapping/', data).subscribe((res: any) => {
      this.spinner.hide();
      if (res.status.message == 'SUCCESS') {
        Swal.fire({
          title: 'Success',
          text: this.customFeildsform.controls.purpose.value + ' Updated',
          icon: 'success',
          confirmButtonText: 'OK',
        }).then(() => {
          this.router.navigateByUrl('/setup/visit-config');
          this.customFeildsform.reset();
        });
      }
    },
      err => {
        this.spinner.hide();
        Swal.fire({
          title: 'Error!',
          text: err.error.status.message,
          icon: 'error',
        });
      });
  }


  back() {
    this.router.navigateByUrl('/setup/custom-config');
  }
}

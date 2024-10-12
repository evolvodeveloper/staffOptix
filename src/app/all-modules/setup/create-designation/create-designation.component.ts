import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpPostService } from 'src/app/services/http-post.service';
import { HttpPutService } from 'src/app/services/http-put.service';
import { UtilService } from 'src/app/services/util.service';
import Swal from 'sweetalert2';


@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[app-create-designation]',
  templateUrl: './create-designation.component.html',
  styleUrls: ['./create-designation.component.scss'],
})
export class CreateDesignationComponent implements OnInit, OnChanges, OnDestroy {
  @Input('app-create-designation') selectedDesignationData: any;
  @Output() selectedDesignationEvent =
    new EventEmitter<string>();
  designationForm: FormGroup;
  view = false;
  update = false;
  active = false;
  charLimit: number;
  open = false;
  selectedDesignation: any;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private httpPostService: HttpPostService,
    public globalServ: GlobalvariablesService,
    private httpPutService: HttpPutService,
    private spinner: NgxSpinnerService,
    private UtilServ: UtilService
  ) { }

  ngOnChanges(designation: any): void {
    if (
      typeof designation !== 'undefined' &&
      typeof designation.selectedDesignationData !== 'undefined' &&
      typeof designation.selectedDesignationData.currentValue !== 'undefined' &&
      (designation.selectedDesignationData.currentValue.type === 'NEW' ||
        designation.selectedDesignationData.currentValue.type === 'VIEW' ||
        designation.selectedDesignationData.currentValue.type === 'EDIT')
    ) {
      this.open = true;
      this.designationForm.enable();
      delete this.UtilServ.viewData;
      delete this.UtilServ.editData;
      this.view = false;
      this.update = false;
      if (
        typeof designation.selectedDesignationData.currentValue.viewData !==
        'undefined'
      ) {
        this.UtilServ.viewData =
          designation.selectedDesignationData.currentValue.viewData;
        this.init();
      } else if (
        typeof designation.selectedDesignationData.currentValue.editData !==
        'undefined'
      ) {
        this.UtilServ.editData =
          designation.selectedDesignationData.currentValue.editData;
        this.init();
      } else {
        this.designationForm.reset();
        this.designationForm.controls.isactive.setValue(true);
      }
    }
  }

  closeModal(): void {
    this.open = false;
    this.selectedDesignationEvent.emit();
  }


  ngOnInit(): void {
    this.globalServ.getMyCompPlaceHolders('Designation');
    this.designationForm = this.fb.group({
      designation: [null, [Validators.required, this.httpPostService.customValidator()]],
      isManager: [true],
      isactive: [true]
    });
    this.charLimit = this.globalServ.charLimitValue;
    this.init();
  }

  init(): void {
    if (this.UtilServ.viewData) {
      this.view = true;
      this.designationForm.controls.designation.setValue(
        this.UtilServ.viewData.designation
      );
      this.designationForm.controls.isManager.setValue(
        this.UtilServ.viewData.isManager
      );
      this.designationForm.controls.isactive.setValue(
        this.UtilServ.viewData.isactive
      );
      this.designationForm.disable();
    } else if (this.UtilServ.editData) {
      this.update = true;
      this.designationForm.enable();
      this.designationForm.controls.designation.setValue(
        this.UtilServ.editData.designation
      );
      this.designationForm.controls.isactive.setValue(
        this.UtilServ.editData.isactive
      );
      this.designationForm.controls.isManager.setValue(
        this.UtilServ.editData.isManager
      );
    }
  }
  cancel() {
    this.router.navigateByUrl('setup/designation');
  }
  create() {
    this.designationForm.get('designation').setValue(this.globalServ.checkAndRemoveSpecialCharacters(this.designationForm.controls.designation.value), { emitEvent: false });
    const req = this.designationForm.value;
    req.designation = this.designationForm.controls.designation.value.trim();
    req.isManager =
      this.designationForm.controls.isManager.value == null
        ? false
        : this.designationForm.controls.isManager.value;
    req.isactive =
      this.designationForm.controls.isactive.value == null
        ? false
        : this.designationForm.controls.isactive.value;
    this.spinner.show();
    this.httpPostService
      .create('designation', this.designationForm.value)
      .subscribe(
        (res: any) => {
          this.spinner.hide();

          if (res.status.message == 'SUCCESS') {
            Swal.fire({
              title: 'Success!',
              text: ' Created',
              icon: 'success',
              timer: 50000,
            }).then(() => {
              this.designationForm.reset();
              this.designationForm.controls.isactive.setValue(true);
              this.UtilServ.allDesignations = [];
              //this.designationForm.controls.isactive.setValue(true);
              //  this.router.navigateByUrl('designation')
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
    this.designationForm.get('designation').setValue(this.globalServ.checkAndRemoveSpecialCharacters(this.designationForm.controls.designation.value), { emitEvent: false });
    this.spinner.show();
    const obj = {
      id: this.UtilServ.editData.id,
      designation: this.designationForm.controls.designation.value.trim(),
        isManager :
       this.designationForm.controls.isManager.value == null
         ? false
          : this.designationForm.controls.isManager.value,
      isactive:
        this.designationForm.controls.isactive.value == null
          ? false
          : this.designationForm.controls.isactive.value,

      companyCode: this.UtilServ.editData.companyCode,
    };
    this.httpPutService
      .doPut('designation', JSON.stringify(obj))
      .subscribe((res: any) => {
        this.spinner.hide();
        if (res.status.message == 'SUCCESS') {
          Swal.fire({
            title: 'Success!',
            text: this.designationForm.controls.designation.value + ' Updated',
            icon: 'success',
            timer: 50000,
          }).then(() => {
            this.designationForm.reset();
            this.designationForm.controls.isactive.setValue(true);
            this.UtilServ.allDesignations = [];
            // this.designationForm.controls.isManager.setValue(true);
            this.router.navigateByUrl('setup/designation');
          });
        } else {
          Swal.fire({
            title: 'Error!',
            text: res.status.message,
            icon: 'warning', showConfirmButton: true,
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
  ngOnDestroy() {
    this.UtilServ.editData = null;
    this.UtilServ.viewData = null;
  }
}


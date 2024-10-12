import { Component, ElementRef, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';
import { HttpPostService } from 'src/app/services/http-post.service';
import { HttpPutService } from 'src/app/services/http-put.service';
import { UtilService } from 'src/app/services/util.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ot-setup',
  templateUrl: './ot-setup.component.html',
  styleUrls: ['./ot-setup.component.scss']
})
export class OtSetupComponent implements OnInit, OnDestroy {
  overtimesetup: FormGroup;
  charLimit: number;
  salaryCompCodes = [];
  view = false;
  update = false;
  otBasis = [
    { code: 'Hours', name: 'Hours' },
    { code: 'ShiftEnd', name: 'ShiftEnd' }
  ];
  allowOTOn = [
    { code: 'Weekends', name: 'Weekends' },
    { code: 'Holidays', name: 'Holidays' },
    { code: 'Both', name: 'Both' },
  ];
  bonusType = [
    { code: 'Days', name: 'Days' },
    { code: 'Fixed', name: 'Fixed' }
  ];
  constructor(private httpGet: HttpGetService, private router: Router,
    private utilServ: UtilService,
    private httpPost: HttpPostService,
    private render: Renderer2,
    private el: ElementRef,
    private spinner: NgxSpinnerService,
    public globalServ: GlobalvariablesService,
    private httpPut: HttpPutService,
    private fb: FormBuilder) {
  }

  ngOnInit() {
    this.overtimesetup = this.fb.group({
      overtimeCode: [null, [Validators.required, this.httpPost.customValidator()]],
      allowOtOnWorkdays: [false],
      allowOtOnHoliday: [false],
      allowOtOnWeekend: [false],
      allowFullAttendanceBonus: [true],
      addEmpManually: true,
      otRatePct: [100, [Validators.required]],
      salaryComponentCode: [null],
      allowFullOt: [false],
      headerWorkDays: [false],
      allowOtAfter: [null],
      otBasis: [null],

      faBonusType: [null],
      faBonusValue: [null],
      faBonusValueFixed: [null],
      faBonusValueDays: [null],

      weAllowFullOt: [false],
      holAllowFullOt: [false],
      holAllowOtAfter: [null],
      holOtRatePct: [null],
      holSalaryComponentCode: [null],

      weAllowOtAfter: [null],
      weOtRatePct: [null],
      weSalaryComponentCode: [null],

    })
    // this.getlabels();
    this.getOtSetup();
    this.getsalaryCmpMaster();
    this.charLimit = this.globalServ.charLimitValue;
    this.checkInital();
    this.init();
  }
  allowMax(value) {
    if (value == 'otRatePct' && this.overtimesetup.controls.otRatePct.value > 100) {
      this.overtimesetup.controls.otRatePct.setValue(100);
    }
    if (value == 'allowOtAfter' && this.overtimesetup.controls.allowOtAfter.value > 12) {
      this.overtimesetup.controls.allowOtAfter.setValue(2);
    }
    if (value == 'weOtRatePct' && this.overtimesetup.controls.weOtRatePct.value > 100) {
      this.overtimesetup.controls.weOtRatePct.setValue(100);
    }
    if (value == 'holOtRatePct' && this.overtimesetup.controls.holOtRatePct.value > 100) {
      this.overtimesetup.controls.holOtRatePct.setValue(100);
    }
    if (value == 'holAllowOtAfter' && this.overtimesetup.controls.holAllowOtAfter.value > 12) {
      this.overtimesetup.controls.holAllowOtAfter.setValue(12);
    }
    if (value == 'weAllowOtAfter' && this.overtimesetup.controls.weAllowOtAfter.value > 12) {
      this.overtimesetup.controls.weAllowOtAfter.setValue(12);
    }
    if (value == 'faBonusType' && this.overtimesetup.controls.faBonusValueDays.value > 31) {
      this.overtimesetup.controls.faBonusValueDays.setValue(null);
    }
  }
  checkInital() {
    if (this.overtimesetup.controls.allowOtOnWorkdays.value == false) {
      this.overtimesetup.controls.otRatePct.disable();
      this.overtimesetup.controls.otRatePct.setValue(null);
      this.overtimesetup.controls.salaryComponentCode.disable();
      const otBH = document.getElementById("otBasis-Hours") as HTMLInputElement;
      otBH.disabled = true;
      otBH.checked = null;
      const otBS = document.getElementById("otBasis-ShiftEnd") as HTMLInputElement;
      if (this.overtimesetup.controls.allowOtOnWorkdays.value == false) {
        otBS.disabled = true;
        otBS.checked = null;
      }
      this.overtimesetup.controls.allowOtAfter.disable();
      this.overtimesetup.controls.allowOtAfter.setValue(null);

      const aft = document.getElementById("allowFullOt-True") as HTMLInputElement;
      if (aft) {
        aft.disabled = true;
        aft.checked = false;
      }

      const aff = document.getElementById("allowFullOt-False") as HTMLInputElement;
      aff.disabled = true;
      aff.checked = null;
    }
    if (this.overtimesetup.controls.allowOtOnWorkdays.value == true) {
      this.overtimesetup.controls.otRatePct.enable();
      this.overtimesetup.controls.salaryComponentCode.enable();
      const otBH = document.getElementById("otBasis-Hours") as HTMLInputElement;
      otBH.disabled = false;
      const otBS = document.getElementById("otBasis-ShiftEnd") as HTMLInputElement;
      otBS.disabled = false;
      this.overtimesetup.controls.allowOtAfter.enable();
      const aft = document.getElementById("allowFullOt-True") as HTMLInputElement;
      aft.disabled = false;
      const aff = document.getElementById("allowFullOt-False") as HTMLInputElement;
      aff.disabled = false;
    }

    if (this.overtimesetup.controls.allowOtOnWeekend.value == false) {
      this.overtimesetup.controls.weOtRatePct.disable();
      this.overtimesetup.controls.weOtRatePct.setValue(null);
      this.overtimesetup.controls.weAllowOtAfter.disable();
      this.overtimesetup.controls.weAllowOtAfter.setValue(null);
      this.overtimesetup.controls.weSalaryComponentCode.disable();
      this.overtimesetup.controls.weSalaryComponentCode.setValue(null);
    }
    if (this.overtimesetup.controls.allowOtOnWeekend.value == true) {
      this.overtimesetup.controls.weOtRatePct.enable();
      this.overtimesetup.controls.weAllowOtAfter.enable();
      this.overtimesetup.controls.weSalaryComponentCode.enable();
    }

    if (this.overtimesetup.controls.allowOtOnHoliday.value == false) {
      this.overtimesetup.controls.holOtRatePct.disable();
      this.overtimesetup.controls.holOtRatePct.setValue(null);
      this.overtimesetup.controls.holAllowOtAfter.disable();
      this.overtimesetup.controls.holAllowOtAfter.setValue(null);
      this.overtimesetup.controls.holSalaryComponentCode.disable();
      this.overtimesetup.controls.holSalaryComponentCode.setValue(null);
    }
    if (this.overtimesetup.controls.allowOtOnHoliday.value == true) {
      this.overtimesetup.controls.holOtRatePct.enable();
      this.overtimesetup.controls.holAllowOtAfter.enable();
      this.overtimesetup.controls.holSalaryComponentCode.enable();

    }

    if (this.overtimesetup.controls.allowFullAttendanceBonus.value == false) {
      this.overtimesetup.controls.faBonusType.disable();
      this.overtimesetup.controls.faBonusType.setValue(null);
      this.overtimesetup.controls.faBonusValue.disable();
      this.overtimesetup.controls.faBonusValue.setValue(null);
      this.overtimesetup.controls.faBonusValueFixed.setValue(null);
      this.overtimesetup.controls.faBonusValueDays.setValue(null);
      this.overtimesetup.controls.faBonusValueFixed.disable();
      this.overtimesetup.controls.faBonusValueDays.disable();
    }
    if (this.overtimesetup.controls.allowFullAttendanceBonus.value == true) {
      this.overtimesetup.controls.faBonusType.enable();
    }
  }

  faBonus() {
    if (this.overtimesetup.controls.faBonusType.value == 'Days') {
      this.overtimesetup.controls.faBonusValueFixed.setValue(null);
    }
    if (this.overtimesetup.controls.faBonusType.value == 'Fixed') {
      this.overtimesetup.controls.faBonusValueDays.setValue(null);
    }
  }


  init() {
    if (this.utilServ.editData) {
      this.update = true;
      this.view = false;
      this.overtimesetup.controls.overtimeCode.setValue(this.utilServ.editData.overtimeCode);
      this.overtimesetup.controls.otRatePct.setValue(this.utilServ.editData.otRatePct);
      this.overtimesetup.controls.allowFullAttendanceBonus.setValue(this.utilServ.editData.allowFullAttendanceBonus);
      this.overtimesetup.controls.salaryComponentCode.setValue(this.utilServ.editData.salaryComponentCode);
      this.overtimesetup.controls.allowFullOt.setValue(this.utilServ.editData.allowFullOt);
      this.overtimesetup.controls.addEmpManually.setValue(this.utilServ.editData.addEmpManually);
      if (this.utilServ.editData.allowFullOt == true) {

        const aft = document.getElementById("allowFullOt-True") as HTMLInputElement;
        if (aft) {
          aft.disabled = false;
          aft.checked = true;
        }

      }

      this.overtimesetup.controls.allowOtAfter.setValue(this.utilServ.editData.allowOtAfter);
      this.overtimesetup.controls.otBasis.setValue(this.utilServ.editData.otBasis);
      this.overtimesetup.controls.allowOtOnHoliday.setValue(this.utilServ.editData.allowOtOnHoliday);
      this.overtimesetup.controls.allowOtOnWeekend.setValue(this.utilServ.editData.allowOtOnWeekend);
      this.overtimesetup.controls.allowOtOnWorkdays.setValue(this.utilServ.editData.allowOtOnWorkdays);
      this.overtimesetup.controls.faBonusType.setValue(this.utilServ.editData.faBonusType);
      this.overtimesetup.controls.faBonusValue.setValue(this.utilServ.editData.faBonusValue);
      this.overtimesetup.controls.holAllowFullOt.setValue(this.utilServ.editData.holAllowFullOt);
      this.overtimesetup.controls.holAllowOtAfter.setValue(this.utilServ.editData.holAllowOtAfter);
      this.overtimesetup.controls.holOtRatePct.setValue(this.utilServ.editData.holOtRatePct);
      this.overtimesetup.controls.holSalaryComponentCode.setValue(this.utilServ.editData.holSalaryComponentCode);
      this.overtimesetup.controls.weSalaryComponentCode.setValue(this.utilServ.editData.weSalaryComponentCode);
      this.overtimesetup.controls.weAllowFullOt.setValue(this.utilServ.editData.weAllowFullOt);
      this.overtimesetup.controls.weAllowOtAfter.setValue(this.utilServ.editData.weAllowOtAfter);
      this.overtimesetup.controls.weOtRatePct.setValue(this.utilServ.editData.weOtRatePct);
      this.overtimesetup.enable();
      if (this.utilServ.editData.faBonusType == 'Fixed') {
        this.overtimesetup.controls.faBonusValueFixed.setValue(this.utilServ.editData.faBonusValue)
      }
      if (this.utilServ.editData.faBonusType == 'Days') {
        this.overtimesetup.controls.faBonusValueDays.setValue(this.utilServ.editData.faBonusValue)
      } this.checkInital();

      this.overtimesetup.controls.overtimeCode.disable();
    } else if (this.utilServ.viewData) {
      this.view = true;
      this.update = false;
      this.overtimesetup.controls.overtimeCode.setValue(this.utilServ.viewData.overtimeCode);
      this.overtimesetup.controls.otRatePct.setValue(this.utilServ.viewData.otRatePct);
      this.overtimesetup.controls.allowFullAttendanceBonus.setValue(this.utilServ.viewData.allowFullAttendanceBonus);
      this.overtimesetup.controls.salaryComponentCode.setValue(this.utilServ.viewData.salaryComponentCode);
      this.overtimesetup.controls.allowFullOt.setValue(this.utilServ.viewData.allowFullOt);
      this.overtimesetup.controls.allowOtAfter.setValue(this.utilServ.viewData.allowOtAfter);
      this.overtimesetup.controls.otBasis.setValue(this.utilServ.viewData.otBasis);
      this.overtimesetup.controls.addEmpManually.setValue(this.utilServ.viewData.addEmpManually);
      this.overtimesetup.controls.allowOtOnHoliday.setValue(this.utilServ.viewData.allowOtOnHoliday);
      this.overtimesetup.controls.allowOtOnWeekend.setValue(this.utilServ.viewData.allowOtOnWeekend);
      this.overtimesetup.controls.allowOtOnWorkdays.setValue(this.utilServ.viewData.allowOtOnWorkdays);
      this.overtimesetup.controls.faBonusType.setValue(this.utilServ.viewData.faBonusType);
      this.overtimesetup.controls.faBonusValue.setValue(this.utilServ.viewData.faBonusValue);
      this.overtimesetup.controls.holAllowFullOt.setValue(this.utilServ.viewData.holAllowFullOt);
      this.overtimesetup.controls.holAllowOtAfter.setValue(this.utilServ.viewData.holAllowOtAfter);
      this.overtimesetup.controls.holOtRatePct.setValue(this.utilServ.viewData.holOtRatePct);
      this.overtimesetup.controls.weAllowFullOt.setValue(this.utilServ.viewData.weAllowFullOt);
      this.overtimesetup.controls.weSalaryComponentCode.setValue(this.utilServ.viewData.weSalaryComponentCode);
      this.overtimesetup.controls.holSalaryComponentCode.setValue(this.utilServ.viewData.holSalaryComponentCode);

      this.overtimesetup.controls.weAllowOtAfter.setValue(this.utilServ.viewData.weAllowOtAfter);
      this.overtimesetup.controls.weOtRatePct.setValue(this.utilServ.viewData.weOtRatePct);
      this.overtimesetup.disable();
      if (this.utilServ.viewData.faBonusType == 'Fixed') {
        this.overtimesetup.controls.faBonusValueFixed.setValue(this.utilServ.viewData.faBonusValue)
      }
      if (this.utilServ.viewData.faBonusType == 'Days') {
        this.overtimesetup.controls.faBonusValueDays.setValue(this.utilServ.viewData.faBonusValue)
      }
    }

  }
  // getlabels() {
  //   this.spinner.show();
  //   this.httpGet.getLabelsForForm(1, 'overtimesetup').subscribe((res: any) => {
  //     this.spinner.hide();
  //     this.labels = res.response;
  //     this.init();
  //   },
  //     (err) => {
  //       this.spinner.hide();
  //       Swal.fire({
  //         icon: 'error',
  //         title: 'Error!',
  //         text: err.error?.status?.message,
  //         showConfirmButton: true,
  //       }).then(() => {
  //         this.router.navigateByUrl('otSetup');
  //       });
  //     })
  // }

  // hasInteger(colCode: string): boolean {
  //   const label = this.labels.find(item => item.colCode === colCode);
  //   return label?.labelDescription.includes('{integer}');
  // }
  // splitLabelDescription(colCode: string): { before: string, after: string } {
  //   const label = this.labels.find(item => item.colCode === colCode);
  //   const parts = label.labelDescription.split('{integer}');
  //   return {
  //     before: parts[0] || '',
  //     after: parts[1] || ''
  //   };
  // }
  getsalaryCmpMaster() {
    this.httpGet.getMasterList('salarycomponents/active').subscribe((res: any) => {
      const salaryMasterList = res.response;
      this.salaryCompCodes = salaryMasterList.filter(c => !this.utilServ.theseComponentsShouldBeHiden.includes(c.componentCode));
    })
  }

  getOtSetup() {
    this.httpGet.getMasterList('overtimesetups').subscribe((res: any) => {
      this.utilServ.getAllOtSetups = res.response;

    },
      (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: err.error.status.message,
          showConfirmButton: true,
        });
      }
    )
  }

  back() {
    this.router.navigateByUrl('timesetup/otSetup');

  }
  create() {

    this.overtimesetup.get('overtimeCode').setValue(this.globalServ.checkAndRemoveSpecialCharacters(this.overtimesetup.controls.overtimeCode.value), { emitEvent: false });

    const req = this.overtimesetup.value;
    req.weAllowFullOt = this.overtimesetup.controls.allowOtOnWeekend.value == true ? true : false;
    req.holAllowFullOt = this.overtimesetup.controls.allowOtOnHoliday.value == true ? true : false;
    if (this.overtimesetup.controls.faBonusType.value == 'Fixed') {
      req.faBonusValue = this.overtimesetup.controls.faBonusValueFixed.value
    }
    if (this.overtimesetup.controls.faBonusType.value == 'Days') {
      req.faBonusValue = this.overtimesetup.controls.faBonusValueDays.value
    }
    this.spinner.show();
    this.httpPost.create('overtimesetup', [this.overtimesetup.value]).subscribe((res: any) => {
      this.spinner.hide();
      if (res.status.message == 'SUCCESS') {
        Swal.fire({
          title: 'Success!',
          text: this.overtimesetup.controls.overtimeCode.value + ' Created',
          icon: 'success',
          timer: 3000,
        }).then(() => {
          this.utilServ.getAllOtSetups = [];
          this.back();
        });
      }
      else {
        Swal.fire({
          title: 'Error!',
          text: res.status.message,
          icon: 'warning',
          showConfirmButton: true,
        })
      }
    },
      err => {
        this.spinner.hide();
        Swal.fire({
          title: 'error!',
          text: err.error.status.message,
          icon: 'error',
          timer: 3000,
        })
      });
  }
  Update() {
    this.overtimesetup.get('overtimeCode').setValue(this.globalServ.checkAndRemoveSpecialCharacters(this.overtimesetup.controls.overtimeCode.value), { emitEvent: false });

    this.spinner.show();
    const req = this.overtimesetup.value;
    req.weAllowFullOt = this.overtimesetup.controls.allowOtOnWeekend.value == true ? true : false;
    req.holAllowFullOt = this.overtimesetup.controls.allowOtOnHoliday.value == true ? true : false;
    if (this.overtimesetup.controls.faBonusType.value == 'Fixed') {
      req.faBonusValue = this.overtimesetup.controls.faBonusValueFixed.value
    }
    if (this.overtimesetup.controls.faBonusType.value == 'Days') {
      req.faBonusValue = this.overtimesetup.controls.faBonusValueDays.value
    }
    const obj = {
      "id": this.utilServ.editData.id,
      "overtimeCode": this.overtimesetup.controls.overtimeCode.value,
      "salaryComponentCode": this.overtimesetup.controls.salaryComponentCode.value,
      "allowOtOnWorkdays": this.overtimesetup.controls.allowOtOnWorkdays.value,
      "otBasis": this.overtimesetup.controls.otBasis.value,
      addEmpManually: this.overtimesetup.controls.addEmpManually.value,
      "allowOtAfter": this.overtimesetup.controls.allowOtAfter.value,
      "allowFullOt": this.overtimesetup.controls.allowFullOt.value,
      "otRatePct": this.overtimesetup.controls.otRatePct.value,
      weSalaryComponentCode: this.overtimesetup.controls.weSalaryComponentCode.value,
      holSalaryComponentCode: this.overtimesetup.controls.holSalaryComponentCode.value,
      "allowOtOnWeekend": this.overtimesetup.controls.allowOtOnWeekend.value,
      "weAllowOtAfter": this.overtimesetup.controls.weAllowOtAfter.value,
      "weAllowFullOt": this.overtimesetup.controls.allowOtOnWeekend.value == true ? true : false,
      "holAllowFullOt": this.overtimesetup.controls.allowOtOnHoliday.value == true ? true : false,
      "weOtRatePct": this.overtimesetup.controls.weOtRatePct.value,
      "allowOtOnHoliday": this.overtimesetup.controls.allowOtOnHoliday.value,
      "holAllowOtAfter": this.overtimesetup.controls.holAllowOtAfter.value,
      "holOtRatePct": this.overtimesetup.controls.holOtRatePct.value,
      "allowFullAttendanceBonus": this.overtimesetup.controls.allowFullAttendanceBonus.value,
      "faBonusType": this.overtimesetup.controls.faBonusType.value,
      "faBonusValue": req.faBonusValue,
      "buCode": this.utilServ.editData.buCode,
      "tenantCode": this.utilServ.editData.tenantCode,
      "createdby": this.utilServ.editData.createdby,
      "createddate": this.utilServ.editData.createddate,
      "lastmodifiedby": this.utilServ.editData.lastmodifiedby,
      "lastmodifieddate": this.utilServ.editData.lastmodifieddate,
      "approvedby": this.utilServ.editData.approvedby,
      "approvedate": this.utilServ.editData.approvedate,
    }
    this.httpPut.doPut('overtimesetup', obj).subscribe((res: any) => {
      this.spinner.hide();
      if (res.status.message == 'SUCCESS') {
        Swal.fire({
          title: 'Success!',
          text: this.overtimesetup.controls.overtimeCode.value + ' Updated',
          icon: 'success',
          timer: 3000,
        }).then(() => {
          this.utilServ.getAllOtSetups = [];
          this.back();
        });
      }
      else {
        Swal.fire({
          title: 'Error!',
          text: res.status.message,
          icon: 'warning',
          showConfirmButton: true,
        })
      }
    },
      err => {
        this.spinner.hide();
        Swal.fire({
          title: 'error!',
          text: err.error.status.message,
          icon: 'error',
          timer: 3000,
        })
      });
  }





  ngOnDestroy() {
    this.utilServ.editData = null;
    this.utilServ.viewData = null;
  }

}

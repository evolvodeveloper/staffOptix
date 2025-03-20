import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';
import { HttpPutService } from 'src/app/services/http-put.service';
import { UtilService } from 'src/app/services/util.service';
import Swal from 'sweetalert2';
import { HttpPostService } from '../../../services/http-post.service';

interface MonthObject {
  code: string;
  value: string;
}

@Component({
  selector: 'app-leave-setup',
  templateUrl: './leave-setup.component.html',
  styleUrls: ['./leave-setup.component.scss'],
})
export class LeaveSetupComponent implements OnInit, OnDestroy {
  className = 'LeaveSetupComponent';
  leavePlanForm: FormGroup;
  leaveTypeForm: FormGroup;
  charLimit: number;
  leaveSetupList = [];
  message: string;
  planMessage: string;
  leaveTypeMessage: string;
  firstTab = false;
  secondTab = true;
  thirdTab = false;
  onlyCreate = true;
  config: any;

  searchLeavePlan: string;
  searchLeaveType: string;
  searchedInSetUp: string;
  hasPermissionToUpdate = false;
  hasPermissionToApprove = false;
  view = false;
  update = false;
  leaveTypeview = false;
  leaveTypeUpdate = false;
  firstDatesOfMonths: any;
  dateFormat: string;
  leaveTypesList = [];
  constructor(
    private httpGet: HttpGetService,
    private acRoute: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private utilServ: UtilService,
    public activeModal: NgbActiveModal,
    private router: Router,
    public globalServ: GlobalvariablesService,
    private httpPOst: HttpPostService,
    private httpPutServ: HttpPutService,
    private cdr: ChangeDetectorRef
  ) {
    this.config = {
      itemsPerPage: 25,
      currentPage: 1,
      totalItems: this.leaveSetupList.length,
    };
    // this.config1 = {
    //   itemsPerPage: 25,
    //   currentPage: 1,
    //   totalItems: this.leavePlansList.length,
    // };
    // this.config2Type = {
    //   itemsPerPage: 25,
    //   currentPage: 1,
    //   totalItems: this.leaveTypesList.length,
    // };
    this.dateFormat = this.globalServ.dateFormat;
    this.charLimit = this.globalServ.charLimitValue;
  }
  dates = [];
  leavePlansList = [];

  getFirstDatesOfMonths(): MonthObject[] {
    const currentYear = moment().year();
    const monthObjects: MonthObject[] = [];
    for (let month = 0; month < 12; month++) {
      const monthName = moment().month(month).format('MMMM');
      const firstDateOfMonth = moment({ year: currentYear, month, day: 1 });
      const formattedDate = firstDateOfMonth.format('YYYY-MM-DD');

      const monthObject: MonthObject = {
        code: monthName,
        value: formattedDate,
      };

      monthObjects.push(monthObject);
    }
    return monthObjects;
  }

  ngOnInit() {
    this.globalServ.getMyCompLabels('leavesetup');
    this.globalServ.getMyCompPlaceHolders('leavesetup');
    this.globalServ.getMyCompErrors('leavesetup')

    this.acRoute.data.subscribe(data => {
      const permission = data.condition
      this.hasPermissionToUpdate = permission.hasPermissionToUpdate
      this.hasPermissionToApprove = permission.hasPermissionToApprove
    });
    this.leavePlanForm = this.fb.group({
      leavePlanCode: [null, [Validators.required, this.httpPOst.customValidator()]],
      description: [null],
      leaveCalSrtDate: [null],
      branchCode: [null],
      leaveCalendarStartDate: [null, Validators.required],
      runLeavepolicyOnDt: [null, Validators.required],
      companyCode: [null],
      createdby: [null],
      createddate: [null],
      nextRunDate: [null],
      id: [null],
      lastRunDate: [null],
      lastmodifiedby: [null],
      lastmodifieddate: [null],
    });
    this.leaveTypeForm = this.fb.group({
      leaveTypeCode: [null, [Validators.required, this.httpPOst.customValidator()]],
      description: [null],
      isGenderBased: [false],
      forGender: null,
      isMaritalStatusBased: [false],
      forMaritalStatus: null,
      isactive: true,
      isVisible: true,
      "leaveTypeId": null,
      "branchyCode": null,
      "companyCode": null,
      "createdby": null,
      "createddate": null,
      "lastmodifiedby": null,
      "lastmodifieddate": null,
      "leaveSetup": null,
    });
    this.firstDatesOfMonths = this.getFirstDatesOfMonths();
    for (let i = 1; i <= 30; i++) {
      this.dates.push(i);
    }
    if (this.utilServ.previousSelectedTab == 'firstTab') {
      this.tab1();
    }
    // this.dates.push('MonthEnd');
    this.leaveSetupList = this.utilServ.leaveSetupBackup;
    if (this.utilServ.leaveSetupBackup.length > 0) {
      if (this.searchedInSetUp !== '' && this.searchedInSetUp !== undefined) {
        const val = this.searchedInSetUp.toLowerCase()
        this.leaveSetupList = this.utilServ.leaveSetupBackup.filter(function (d) {
          return d.leaveTypeCode?.toLowerCase().indexOf(val) !== -1 || d.leavePlanCode?.toLowerCase().indexOf(val) !== -1 || !val;
        });
      } else {
        this.leaveSetupList = this.utilServ.leaveSetupBackup;
      }
    } else {
      this.getLeaveSetup();
    }
    if (this.utilServ.leavePlanbackup.length > 0) {
      // this.leavePlansList = this.utilServ.leavePlanbackup;
      if (this.className == this.utilServ.universalSerchedData?.componentName) {
        this.searchLeavePlan = this.utilServ.universalSerchedData?.searchedText;
      }
      if (this.searchLeavePlan !== '' && this.searchLeavePlan !== undefined) {
        const val = this.searchLeavePlan.toLowerCase();
        this.leavePlansList = this.utilServ.leavePlanbackup.filter(function (d) {
          return d.leavePlanCode?.toLowerCase()?.indexOf(val) !== -1 || !val;
        });
        this.config.totalItems = this.leavePlansList.length;
        this.config.currentPage = 1;
      } else {
        this.leavePlansList = this.utilServ.leavePlanbackup;
      }
    } else {
      this.getleavePlans();
    }
    if (this.utilServ.leaveTypesBackup.length > 0) {
      this.leaveTypesList = this.utilServ.leaveTypesBackup;
    } else {
      this.getLeaveTypes();
    }
    this.leaveTypeForm.controls.isGenderBased.setValue(false);
    this.leaveTypeForm.controls.isMaritalStatusBased.setValue(false);
    this.cdr.detectChanges();
    this.genderBased(); this.maritalStatusBased();
  }

  getLeaveTypes() {
    this.leaveTypesList = [];
    this.utilServ.leaveTypesBackup = [];
    this.httpGet.getMasterList('leavetypes').subscribe((res: any) => {
      this.utilServ.leaveTypesBackup = res.response;
      if (this.className == this.utilServ.universalSerchedData?.componentName) {
        this.searchLeaveType = this.utilServ.universalSerchedData?.searchedInType;
      }
      if (this.searchLeaveType !== '' && this.searchLeaveType !== undefined) {
        const val = this.searchLeaveType.toLowerCase();
        this.leaveTypesList = this.utilServ.leaveTypesBackup.filter(function (d) {
          return d.leaveTypeCode?.toLowerCase()?.indexOf(val) !== -1 || !val;
        });
      } else {
        this.leaveTypesList = this.utilServ.leaveTypesBackup;
      }
    },
      (err) => {
        this.leaveTypeMessage = 'error'
        this.spinner.hide(); console.error(err.error);
      });
  }
  tab1() {
    this.config.currentPage = 1;
    this.cdr.detectChanges();
    this.firstTab = true;
    this.secondTab = false;
    this.thirdTab = false;
    if (this.className == this.utilServ.universalSerchedData?.componentName) {
      this.searchedInSetUp = this.utilServ.universalSerchedData?.searchedInSetup;
    }
    if (this.searchedInSetUp !== '' && this.searchedInSetUp !== undefined) {
      const val = this.searchedInSetUp.toLowerCase();
      this.leaveSetupList = this.utilServ.leaveSetupBackup.filter(function (d) {
        return d.leaveTypeCode?.toLowerCase().indexOf(val) !== -1 || d.leavePlanCode?.toLowerCase().indexOf(val) !== -1 || !val;
      });
    } else {
      this.leaveSetupList = this.utilServ.leaveSetupBackup;
    }
    this.config.totalItems = this.utilServ.leaveSetupBackup.length;
  }
  tab2() {
    this.config.currentPage = 1;
    this.cdr.detectChanges();
    this.firstTab = false;
    this.secondTab = true;
    this.thirdTab = false;

    if (this.className == this.utilServ.universalSerchedData?.componentName) {
      this.searchLeavePlan = this.utilServ.universalSerchedData?.searchedText;
    }
    if (this.searchLeavePlan !== '' && this.searchLeavePlan !== undefined) {
      const val = this.searchLeavePlan.toLowerCase();
      this.leavePlansList = this.utilServ.leavePlanbackup.filter(function (d) {
        return d.leavePlanCode?.toLowerCase()?.indexOf(val) !== -1 || !val;
      });
    } else {
      this.leavePlansList = this.utilServ.leavePlanbackup;
    }
    // this.leavePlansList = this.utilServ.leavePlanbackup;
    this.config.totalItems = this.leavePlansList.length;
  }
  tab3() {
    this.config.currentPage = 1;
    this.cdr.detectChanges();
    this.firstTab = false;
    this.secondTab = false;
    this.thirdTab = true;
    if (this.className == this.utilServ.universalSerchedData?.componentName) {
      this.searchLeaveType = this.utilServ.universalSerchedData?.searchedInType;
    }
    if (this.searchLeaveType !== '' && this.searchLeaveType !== undefined) {
      const val = this.searchLeaveType.toLowerCase();
      this.leaveTypesList = this.utilServ.leaveTypesBackup.filter(function (d) {
        return d.leaveTypeCode?.toLowerCase()?.indexOf(val) !== -1 || !val;
      });
    } else {
      this.leaveTypesList = this.utilServ.leaveTypesBackup;
    }
    // this.leaveTypesList = this.utilServ.leaveTypesBackup;
    this.config.totalItems = this.utilServ.leaveTypesBackup.length;
  }

  getleavePlans() {
    this.utilServ.leavePlanbackup = []; this.leavePlansList = [];
    this.spinner.show();
    this.httpGet.getMasterList('leavePlans').subscribe(
      (res: any) => {
        this.utilServ.leavePlanbackup = res.response;
        if (this.className == this.utilServ.universalSerchedData?.componentName) {
          this.searchLeavePlan = this.utilServ.universalSerchedData?.searchedText;
        }
        if (this.searchLeavePlan !== '' && this.searchLeavePlan !== undefined) {
          const val = this.searchLeavePlan.toLowerCase();
          this.leavePlansList = this.utilServ.leavePlanbackup.filter(function (d) {
            return d.leavePlanCode?.toLowerCase()?.indexOf(val) !== -1 || !val;
          });
        } else {
          this.leavePlansList = this.utilServ.leavePlanbackup;
        }

        this.config.totalItems = this.leavePlansList.length;
        this.config.currentPage = 1;
        this.spinner.hide();
      },
      (err) => {
        this.message = 'error'
        this.spinner.hide();
        console.error(err.error);
      });
  }
  addleaveType() {
    this.leaveTypeForm.reset();
    this.leaveTypeForm.enable();
    this.leaveTypeUpdate = false;
    this.leaveTypeview = false;
    this.leaveTypeForm.controls.isactive.setValue(true);
    this.leaveTypeForm.controls.isVisible.setValue(true);
    this.genderBased();
    this.maritalStatusBased();
  }
  addPlan() {
    this.leavePlanForm.reset();
    this.leavePlanForm.enable();
    this.update = false;
    this.view = false;
  }
  closeModelPlan() {
    const closeButton = document.querySelector('.closeModelPlan') as HTMLElement;
    if (closeButton) {
      closeButton.click();
    }
  }
  closeModelType() {
    const closeButton = document.querySelector('.closeModelType') as HTMLElement;
    if (closeButton) {
      closeButton.click();
    }
  }
  genderBased() {
    this.cdr.detectChanges();
    if (this.leaveTypeForm.controls.isGenderBased.value == true) {
      this.leaveTypeForm.controls.forGender.enable();
    } else {
      this.leaveTypeForm.controls.forGender.disable();
      this.leaveTypeForm.controls.forGender.reset();
      this.cdr.detectChanges();

    }
    this.cdr.detectChanges();
  }
  maritalStatusBased() {
    if (this.leaveTypeForm.controls.isMaritalStatusBased.value == true) {
      this.leaveTypeForm.controls.forMaritalStatus.enable();
    } else {
      this.leaveTypeForm.controls.forMaritalStatus.disable();
      this.leaveTypeForm.controls.forMaritalStatus.reset();

    }
  }
  viewDataForPlan(row) {
    this.view = true;
    this.update = false;
    this.leavePlanForm.patchValue({
      leavePlanCode: row.leavePlanCode,
      description: row.description,
      branchCode: row.branchCode,
      leaveCalendarStartDate: row.leaveCalendarStartDate,
      companyCode: row.companyCode,
      createdby: row.createdby,
      createddate: row.createddate,
      id: row.id,
      lastRunDate: row.lastRunDate,
      lastmodifiedby: row.lastmodifiedby,
      lastmodifieddate: row.lastmodifieddate,
      nextRunDate: row.nextRunDate,
      runLeavepolicyOnDt: row.runLeavepolicyOnDt
    })
    this.leavePlanForm.disable();
  }
  editDataForPlan(row) {
    this.view = false;
    this.update = true;
    this.leavePlanForm.patchValue({
      leavePlanCode: row.leavePlanCode,
      description: row.description,
      branchCode: row.branchCode,
      leaveCalendarStartDate: row.leaveCalendarStartDate,
      companyCode: row.companyCode,
      createdby: row.createdby,
      createddate: row.createddate,
      id: row.id,
      lastRunDate: row.lastRunDate,
      lastmodifiedby: row.lastmodifiedby,
      lastmodifieddate: row.lastmodifieddate,
      nextRunDate: row.nextRunDate,
      runLeavepolicyOnDt: row.runLeavepolicyOnDt
    })
    this.leavePlanForm.enable();
    this.leavePlanForm.controls.leavePlanCode.disable();
  }
  viewDataForType(row) {
    this.leaveTypeview = true;
    this.leaveTypeUpdate = false;
    this.leaveTypeForm.patchValue({
      "leaveTypeId": row.leaveTypeId,
      "leaveTypeCode": row.leaveTypeCode,
      "description": row.description,
      "isGenderBased": row.isGenderBased,
      "forGender": row.forGender,
      "isMaritalStatusBased": row.isMaritalStatusBased,
      "forMaritalStatus": row.forMaritalStatus,
      "branchyCode": row.branchyCode,
      "companyCode": row.companyCode,
      "isactive": row.isactive,
      isVisible: row.isVisible,
      "createdby": row.createdby,
      "createddate": row.createddate,
      "lastmodifiedby": row.lastmodifiedby,
      "lastmodifieddate": row.lastmodifieddate,
      "leaveSetup": row.leaveSetup,
    })
    this.leaveTypeForm.disable();
    // this.genderBased();
    // this.maritalStatusBased();
  }
  editDataForType(row) {
    this.leaveTypeview = false;
    this.leaveTypeUpdate = true;
    this.leaveTypeForm.patchValue({
      "leaveTypeId": row.leaveTypeId,
      "leaveTypeCode": row.leaveTypeCode,
      "description": row.description,
      isVisible: row.isVisible,
      "isGenderBased": row.isGenderBased,
      "forGender": row.forGender,
      "isMaritalStatusBased": row.isMaritalStatusBased,
      "forMaritalStatus": row.forMaritalStatus,
      "branchyCode": row.branchyCode,
      "companyCode": row.companyCode,
      "isactive": row.isactive,
      "createdby": row.createdby,
      "createddate": row.createddate,
      "lastmodifiedby": row.lastmodifiedby,
      "lastmodifieddate": row.lastmodifieddate,
      "leaveSetup": row.leaveSetup,
    })
    this.leaveTypeForm.enable();
    this.leaveTypeForm.controls.leaveTypeCode.disable();
    this.genderBased();
    this.maritalStatusBased();
  }

  createLeaveSetup() {
    this.utilServ.previousSelectedTab = 'firstTab';
    this.router.navigateByUrl('timesetup/leavesetup/create-leave-setup');
  }



  viewData(row) {
    this.utilServ.previousSelectedTab = 'firstTab';
    this.utilServ.viewData = row;

    this.router.navigateByUrl('timesetup/leavesetup/create-leave-setup');

  }
  editData(row) {
    this.utilServ.previousSelectedTab = 'firstTab';
    this.utilServ.editData = row;
    this.router.navigateByUrl('timesetup/leavesetup/create-leave-setup');
  }
  resultsPerPage(event) {
    this.config.itemsPerPage =
      event.target.value == 'all' ? this.utilServ.leaveSetupBackup.length : event.target.value;
    this.config.currentPage = 1;
    this.config.itemsPerPage =
      event.target.value == 'all' ? this.utilServ.leavePlanbackup.length : event.target.value;
    this.config.currentPage = 1;
    this.config.itemsPerPage =
      event.target.value == 'all' ? this.utilServ.leaveTypesBackup.length : event.target.value;
    this.config.currentPage = 1;
  }

  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    if (val == '') {
      this.leaveSetupList = [...this.utilServ.leaveSetupBackup];
    } else {
      const temp = this.utilServ.leaveSetupBackup.filter(function (d) {
        return d.leaveTypeCode?.toLowerCase().indexOf(val) !== -1 || d.leavePlanCode?.toLowerCase().indexOf(val) !== -1 || !val;
      });
      this.leaveSetupList = temp;
    }
    this.config.totalItems = this.leaveSetupList.length;
    this.config.currentPage = 1;

    this.utilServ.universalSerchedData = {
      componentName: this.className,
      searchedText: this.searchLeavePlan,
      searchedInType: this.searchLeaveType,
      searchedInSetup: this.searchedInSetUp
    }
  }

  updateFilterForPlan(event) {
    const val = event.target.value.toLowerCase();
    if (val == '') {
      this.leavePlansList = this.utilServ.leavePlanbackup;
    } else {
      const temp = this.utilServ.leavePlanbackup.filter(function (d) {
        return d.leavePlanCode?.toLowerCase()?.indexOf(val) !== -1 || !val;
      });
      this.leavePlansList = temp;
    }
    this.config.totalItems = this.leavePlansList.length;
    this.config.currentPage = 1;
    this.utilServ.universalSerchedData = {
      componentName: this.className,
      searchedText: this.searchLeavePlan,
      searchedInType: this.searchLeaveType,
      searchedInSetup: this.searchedInSetUp
    }
  }
  updateFilterFortype(event) {
    const val = event.target.value.toLowerCase();
    if (val == '') {
      this.leaveTypesList = this.utilServ.leaveTypesBackup;
    } else {
      const temp = this.utilServ.leaveTypesBackup.filter(function (d) {
        return d.leaveTypeCode.toLowerCase().indexOf(val) !== -1 || !val;
      });
      this.leaveTypesList = temp;
    }
    this.config.totalItems = this.leaveTypesList.length;
    this.config.currentPage = 1;
    this.utilServ.universalSerchedData = {
      componentName: this.className,
      searchedText: this.searchLeavePlan,
      searchedInType: this.searchLeaveType,
      searchedInSetup: this.searchedInSetUp
    }
  }

  pageChanged(event) {
    this.config.currentPage = event;
  }

  getLeaveSetup() {
    this.utilServ.leaveSetupBackup = [];
    this.spinner.show();
    this.httpGet.getMasterList('leavesetups').subscribe(
      (res: any) => {
        this.spinner.hide();
        this.leaveSetupList = res.response;
        this.utilServ.leaveSetupBackup = res.response;
      },
      (err) => {
        this.planMessage = 'error'
        this.spinner.hide(); console.error(err.error);
      });
  }


  ngOnDestroy() {
    this.leavePlanForm.reset();
  }


  submit() {
    this.leavePlanForm.get('leavePlanCode').setValue(this.globalServ.checkAndRemoveSpecialCharacters(this.leavePlanForm.controls.leavePlanCode.value), { emitEvent: false });
    this.spinner.show();
    if (this.leavePlanForm.controls.id.value == null) {
      const obj = {
        leavePlanCode: this.leavePlanForm.controls.leavePlanCode.value,
        description: this.leavePlanForm.controls.description.value,
        leaveCalSrtDate: this.leavePlanForm.controls.leaveCalSrtDate.value,
        branchCode: this.leavePlanForm.controls.branchCode.value,
        leaveCalendarStartDate: this.leavePlanForm.controls.leaveCalendarStartDate.value,
        runLeavepolicyOnDt: this.leavePlanForm.controls.runLeavepolicyOnDt.value,
        companyCode: this.leavePlanForm.controls.companyCode.value,
        createdby: this.leavePlanForm.controls.createdby.value,
        createddate: this.leavePlanForm.controls.createddate.value,
        nextRunDate: this.leavePlanForm.controls.nextRunDate.value,
        id: this.leavePlanForm.controls.id.value,
        lastRunDate: this.leavePlanForm.controls.lastRunDate.value,
        lastmodifiedby: this.leavePlanForm.controls.lastmodifiedby.value,
        lastmodifieddate: this.leavePlanForm.controls.lastmodifieddate.value,
      }
      this.httpPOst.create('leavePlan', obj).subscribe((res: any) => {
        this.spinner.hide();
        if (res.status.message == 'SUCCESS') {
          Swal.fire({
            title: 'Success!',
            text: this.leavePlanForm.controls.leavePlanCode.value + ' Created',
            icon: 'success',
            timer: 10000,
          }).then(() => {
            this.leavePlanForm.reset();
            this.getleavePlans();
            this.closeModelPlan();
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
    else {
      this.UpdatePlan();
    }
  }

  UpdatePlan() {
    this.leavePlanForm.get('leavePlanCode').setValue(this.globalServ.checkAndRemoveSpecialCharacters(this.leavePlanForm.controls.leavePlanCode.value), { emitEvent: false });
    this.spinner.show();
    const obj = {
      leavePlanCode: this.leavePlanForm.controls.leavePlanCode.value,
      description: this.leavePlanForm.controls.description.value,
      leaveCalSrtDate: this.leavePlanForm.controls.leaveCalSrtDate.value,
      branchCode: this.leavePlanForm.controls.branchCode.value,
      leaveCalendarStartDate: this.leavePlanForm.controls.leaveCalendarStartDate.value,
      runLeavepolicyOnDt: this.leavePlanForm.controls.runLeavepolicyOnDt.value,
      companyCode: this.leavePlanForm.controls.companyCode.value,
      createdby: this.leavePlanForm.controls.createdby.value,
      createddate: this.leavePlanForm.controls.createddate.value,
      nextRunDate: this.leavePlanForm.controls.nextRunDate.value,
      id: this.leavePlanForm.controls.id.value,
      lastRunDate: this.leavePlanForm.controls.lastRunDate.value,
      lastmodifiedby: this.leavePlanForm.controls.lastmodifiedby.value,
      lastmodifieddate: this.leavePlanForm.controls.lastmodifieddate.value,
    }
    this.httpPutServ.doPut('leavePlan', obj).subscribe((res: any) => {
      this.spinner.hide();
      if (res.status.message == 'SUCCESS') {
        Swal.fire({
          title: 'Success!',
          text: this.leavePlanForm.controls.leavePlanCode.value + ' Updated',
          icon: 'success',
          timer: 10000,
        }).then(() => {
          this.leavePlanForm.reset();
          this.leavePlanForm.enable();
          this.getleavePlans();
          this.closeModelPlan();
          this.update = false;
          this.activeModal.close();

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

  createLeaveType() {
    this.leaveTypeForm.get('leaveTypeCode').setValue(this.globalServ.checkAndRemoveSpecialCharacters(this.leaveTypeForm.controls.leaveTypeCode.value), { emitEvent: false });
    this.spinner.show();

    if (this.leaveTypeForm.controls.leaveTypeId.value == null) {
      const obj = {
        leaveTypeCode: this.leaveTypeForm.controls.leaveTypeCode.value,
        description: this.leaveTypeForm.controls.description.value,
        isGenderBased: this.leaveTypeForm.controls.isGenderBased.value == null
          ? false : this.leaveTypeForm.controls.isGenderBased.value,
        forGender: this.leaveTypeForm.controls.forGender.value,
        isMaritalStatusBased: this.leaveTypeForm.controls.isMaritalStatusBased.value == null
          ? false : this.leaveTypeForm.controls.isMaritalStatusBased.value,
        forMaritalStatus: this.leaveTypeForm.controls.forMaritalStatus.value,
        isactive: this.leaveTypeForm.controls.isactive.value,
        isVisible: this.leaveTypeForm.controls.isVisible.value == null
          ? false : this.leaveTypeForm.controls.isVisible.value,
      }

      this.httpPOst.create('leavetypes', [obj]).subscribe((res: any) => {
        this.spinner.hide();
        if (res.status.message == 'SUCCESS') {
          Swal.fire({
            title: 'Success!',
            text: this.leaveTypeForm.controls.leaveTypeCode.value + ' Created',
            icon: 'success',
            timer: 10000,
          }).then(() => {
            this.leaveTypeForm.reset();
            this.leaveTypeForm.controls.isactive.setValue(true);
            this.getLeaveTypes();
            this.closeModelType();
            this.activeModal.close();
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
    else {
      this.UpdateType();
    }
  }

  UpdateType() {
    this.leaveTypeForm.get('leaveTypeCode').setValue(this.globalServ.checkAndRemoveSpecialCharacters(this.leaveTypeForm.controls.leaveTypeCode.value), { emitEvent: false });
    this.spinner.show();

    const obj = {
      leaveTypeCode: this.leaveTypeForm.controls.leaveTypeCode.value,
      description: this.leaveTypeForm.controls.description.value,
      isGenderBased: this.leaveTypeForm.controls.isGenderBased.value == null
        ? false : this.leaveTypeForm.controls.isGenderBased.value,
      forGender: this.leaveTypeForm.controls.isGenderBased.value == true ? this.leaveTypeForm.controls.forGender.value : null,
      isMaritalStatusBased: this.leaveTypeForm.controls.isMaritalStatusBased.value == null
        ? false : this.leaveTypeForm.controls.isMaritalStatusBased.value,
      forMaritalStatus: this.leaveTypeForm.controls.isMaritalStatusBased.value == true ? this.leaveTypeForm.controls.forMaritalStatus.value : null,
      isactive: this.leaveTypeForm.controls.isactive.value,
      isVisible: this.leaveTypeForm.controls.isVisible.value == null
        ? false : this.leaveTypeForm.controls.isVisible.value,
      "leaveTypeId": this.leaveTypeForm.controls.leaveTypeId.value,
      "branchyCode": this.leaveTypeForm.controls.branchyCode.value,
      "companyCode": this.leaveTypeForm.controls.companyCode.value,
      "createdby": this.leaveTypeForm.controls.createdby.value,
      "createddate": this.leaveTypeForm.controls.createddate.value,
      "lastmodifiedby": this.leaveTypeForm.controls.lastmodifiedby.value,
      "lastmodifieddate": this.leaveTypeForm.controls.lastmodifieddate.value,
      "leaveSetup": this.leaveTypeForm.controls.leaveSetup.value,
    }

    this.httpPutServ.doPut('leavetype', obj).subscribe((res: any) => {
      this.spinner.hide();
      if (res.status.message == 'SUCCESS') {
        Swal.fire({
          title: 'Success!',
          text: this.leaveTypeForm.controls.leaveTypeCode.value + ' Updated',
          icon: 'success',
          timer: 10000,
        }).then(() => {
          this.leaveTypeForm.reset();
          this.leaveTypeForm.controls.isactive.setValue(true);
          this.getLeaveTypes();
          this.closeModelType();
          this.activeModal.close();
          this.leaveTypeForm.enable();
          this.leaveTypeUpdate = false;
          this.genderBased(); this.maritalStatusBased();
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

import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpGetService } from 'src/app/services/http-get.service';
import { UtilService } from '../../../services/util.service';


@Component({
  selector: 'app-add-branch-item',
  templateUrl: './add-branch-item.component.html',
  styleUrls: ['./add-branch-item.component.scss']
})
export class AddBranchItemComponent implements OnInit {
  @Input() public fromParent;

  public branchForm: FormGroup;
  countryNames = [];
  stateNames = [];
  // cityNames = [];
  branchLevelerror: object;
  dateFormats = ['dd/MM/yyyy', 'dd-MM-yyyy', 'ddMMyyyy'];
  timeZones: any = [];
  view = false;
  update = false;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private httpGet: HttpGetService,
    private utilServ: UtilService,
  ) { }

  ngOnInit(): void {
    // this.getCountrys();
    this.branchForm = this.fb.group({
      branchCode: new FormControl(null, [Validators.required]),
      branchName: new FormControl(null, [Validators.required]),
      address: null,
      shortName: new FormControl(null, [Validators.required]),
      priority: null,
      phoneNo: null,
      dateFormat: null,
      tin: null,
      mobDateFormat: null,
      timezone: new FormControl(null, [Validators.required]),
      dayClosingTime: new FormControl('23:59:59'),
      headoffice: [false],
      branchLock: [false],
      city: new FormControl(null, [Validators.required]),
      state: null,
      country: null,
      zipCode: [null, Validators.maxLength(6)],
    });
    this.branchForm.controls.timezone.setValue(this.fromParent.apiData.ipLocation.timezone);
    this.branchForm.controls.country.setValue(this.fromParent.apiData.ipLocation.country_name);
    this.branchForm.controls.city.setValue(this.fromParent.apiData.ipLocation.city);
    this.branchForm.controls.state.setValue(this.fromParent.apiData.ipLocation.region);
    this.getStatesForThatCmp(this.branchForm.controls.country.value)
    this.init();
  }


  getStatesForThatCmp(country) {
    this.httpGet.nonTokenApi('states?country=' + country).subscribe((res: any) => {
      // this.branchItems().controls.forEach((control: FormControl, i) => {
      this.stateNames = res.response
    })
  }
  init() {
    if (this.fromParent.action == 'edit') {
      this.branchForm.enable();
      this.branchForm.controls.branchName.disable();
      this.branchForm.controls.branchName.setValue(
        this.fromParent.row.branchName);
      this.branchForm.controls.branchCode.setValue(this.fromParent.row.branchCode);
      this.branchForm.controls.shortName.setValue(this.fromParent.row.shortName);

      this.branchForm.controls.city.setValue(this.fromParent.row.city);
      this.branchForm.controls.country.setValue(this.fromParent.row.country);
      this.branchForm.controls.state.setValue(this.fromParent.row.state);
      this.branchForm.controls.dateFormat.setValue(this.fromParent.row.dateFormat);
      this.branchForm.controls.headoffice.setValue(this.fromParent.row.headoffice);
      this.branchForm.controls.phoneNo.setValue(this.fromParent.row.phoneNo);
      this.branchForm.controls.timezone.setValue(this.fromParent.row.timezone);
      this.branchForm.controls.zipCode.setValue(this.fromParent.row.zipCode);
    }
  }


  getCountrys() {
    this.httpGet.nonTokenApi('countries').subscribe((res: any) => {
      this.countryNames = res.response;
    });
  }

  close() {
    this.activeModal.close();
  }

  closeModal(sendData) {
    this.activeModal.close(sendData);
  }

  saveBranch() {
    const obj = {
      branchCode: this.branchForm.controls.branchCode.value,
      branchName: this.branchForm.controls.branchName.value,
      address: this.branchForm.controls.address.value,
      city: this.branchForm.controls.city.value,
      shortName: this.branchForm.controls.shortName.value,
      priority: this.branchForm.controls.priority.value,
      phoneNo: this.branchForm.controls.phoneNo.value,
      dateFormat: this.branchForm.controls.dateFormat.value,
      mobDateFormat: this.branchForm.controls.mobDateFormat.value,
      timezone: this.branchForm.controls.timezone.value,
      dayClosingTime: this.branchForm.controls.dayClosingTime.value,
      headoffice: this.branchForm.controls.headoffice.value,
      branchLock: this.branchForm.controls.branchLock.value,
      state: this.branchForm.controls.state.value,
      country: this.branchForm.controls.country.value,
      zipCode: this.branchForm.controls.zipCode.value,
      tin: this.branchForm.controls.tin.value,
    };
    this.closeModal(obj);

  }

}

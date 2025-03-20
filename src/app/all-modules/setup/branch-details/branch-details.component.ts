import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';
import { HttpPostService } from 'src/app/services/http-post.service';
import { HttpPutService } from 'src/app/services/http-put.service';
import { UtilService } from 'src/app/services/util.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-branch-details',
  templateUrl: './branch-details.component.html',
  styleUrls: ['./branch-details.component.scss']
})
export class BranchDetailsComponent implements OnInit {
  className = 'BranchDetailsComponent';
  branchs = [];
  temp = [];
  config: any;
  branchForm: FormGroup;
  branchview = false;
  branchupdate = false;
  locationData: any;
  timezones = [];
  countryNames = [];
  stateNames = [];
  hasPermissionToUpdate = false;
  hasPermissionToApprove = false;
  modifyHeadOfficeRecord: any;
  dateFormats = ['MM-dd-yyyy', 'dd-MM-yyyy', 'yyyy-MM-dd', 'MM/dd/yyyy', 'dd/MM/yyyy', 'yyyy/MM/dd'];
  themes = [
    { code: 'blue', name: 'Blue' },
    { code: 'green', name: 'Green' },
    { code: 'orange', name: 'Orange' },
  ];
  img: any = {
    fileName: null,
    fileType: null,
    image: null,
    imageByte: null,
  }
  stampImg: any = {
    fileName: null,
    fileType: null,
    image: null,
    imageByte: null,
  };
  logoImg: any = {
    fileName: null,
    fileType: null,
    image: null,
    imageByte: null,
  };
  searchedFor: string;

  constructor(private fb: FormBuilder,
    private httpGet: HttpGetService,
    private utilServ: UtilService,
    private authenticationService: AuthenticationService,
    private http: HttpClient,
    public globalServ: GlobalvariablesService,
    private httpPut: HttpPutService,
    private spinner: NgxSpinnerService,
    private httpPost: HttpPostService,
    private acRoute: ActivatedRoute,
    public activeModal: NgbActiveModal,
    private router: Router
  ) {
    this.config = {
      itemsPerPage: 25,
      currentPage: 1,
      totalItems: this.branchs.length,
    };
    this.branchs = JSON.parse(localStorage.getItem('branch'));
    this.branchs.sort((a, b) => {
      return a?.priority - b?.priority;
    });
  }


  ngOnInit() {
    this.globalServ.getMyCompLabels('branchInfo');
    this.globalServ.getMyCompPlaceHolders('branchInfo')
    if (this.className == this.utilServ.universalSerchedData?.componentName) {
      this.searchedFor = this.utilServ.universalSerchedData?.searchedText;
    }

    if (this.utilServ.branchApiData?.length > 0) {
      if (this.searchedFor !== '' && this.searchedFor !== undefined) {
        const val = this.searchedFor.toLowerCase();
        this.branchs = this.utilServ.branchApiData.filter(function (d) {
          return d.branchName?.toLowerCase().indexOf(val) !== -1 || !val;
        });
        this.config.totalItems = this.branchs.length;
        this.config.currentPage = 1;
      } else {
        this.branchs = this.utilServ.branchApiData;
      }
    } else {
      this.getBranchList();
    }
    this.acRoute.data.subscribe(data => {
      const permission = data.condition
      this.hasPermissionToUpdate = permission.hasPermissionToUpdate
      this.hasPermissionToApprove = permission.hasPermissionToApprove
    });
    this.branchFormContols();
    this.getTimezone();
  }
  getBranchList() {
    this.spinner.show();
    this.branchs = [];
    // if (!localStorage.getItem('branch')) {
    this.httpGet.getMasterList('branchs').subscribe(
      async (res: any) => {
        this.spinner.hide();
        const branchs = res.response;
        this.temp = [...branchs];
        this.utilServ.branchApiData = branchs;
        if (this.searchedFor !== '' && this.searchedFor !== undefined) {
          const val = this.searchedFor.toLowerCase();
          this.branchs = branchs.filter(function (d) {
            return d.branchName.toLowerCase().indexOf(val) !== -1 || !val;
          });
        }
        else {
          this.branchs = branchs
        }
        this.config.totalItems = this.branchs.length;
        localStorage.setItem('branch', JSON.stringify(res.response));
      },
      (err) => {
        this.spinner.hide();

        console.error(err);
      }
    );
  }
  getTimezone() {
    this.httpGet.timeZone().subscribe(
      (res: any) => {
        this.timezones = res.response;
      }
    );
  }


  branchFormContols() {
    this.branchForm = this.fb.group({
      address: [null],
      branchName: [null, [Validators.required, this.httpPost.customValidator()]],
      bankDetails: [null],
      branchCode: [null, [Validators.required, this.httpPost.customValidator()]],
      branchId: [null],
      branchLock: [false],
      city: [null,Validators.required],
      state: [null, Validators.required],
      country: [null, Validators.required],
      zipCode: [null],
      dateFormat: [null],
      dayClosingTime: [null],
      fileDir: [null],
      headoffice: [false],
      imageType: [null],
      stamImgType: [null],
      logoImgType: [null],
      isactive: [true],

      mobDateFormat: [null],
      phoneNo: [null],
      priority: [null],
      qrCode: [null],
      stamp: [null],
      logo: [null],
      qrName: [''],
      stampName: [''],
      logoName: [''],
      shortName: [null, this.httpPost.customValidator()],
      theme: [null],
      timezone: [null, Validators.required],
      tin: [null],
      companyCode: [null],
      createdby: [null],
      createddate: [null],
      lastmodifieddate: [null],
      lastmodifiedby: [null]
    });
  }
  onSelectFile(event: any) {
    if (event.target.files && event.target.files[0]) {
      const extension = event.target.files[0]?.type;
      this.img.fileType = extension.replace('image/', '');
      const reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]); // read file as data url
      reader.onload = (event) => {
        // called once readAsDataURL is completed
        this.img.image = event?.target?.result;
        const base64_data = this.img.image.split(',')[1]
        this.img.imageByte = base64_data
      };
      this.img.fileName = event.target.files[0].name
      // this.branchForm.controls.qrName.setValue(this.img.fileName),
      this.branchForm.controls.qrCode.setValue(this.img.imageByte),
        this.branchForm.controls.imageType.setValue(this.img.fileType)
    }

  }
  onSelectFile_Stamp(event: any) {
    if (event.target.files && event.target.files[0]) {
      const extension = event.target.files[0]?.type;
      this.stampImg.fileType = extension.replace('image/', '');
      const reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]); // read file as data url
      reader.onload = (event) => {
        // called once readAsDataURL is completed
        this.stampImg.image = event?.target?.result;
        const base64_data = this.stampImg.image.split(',')[1]
        this.stampImg.imageByte = base64_data
      };
      this.stampImg.fileName = event.target.files[0].name
      this.branchForm.controls.stamp.setValue(this.stampImg.imageByte),
        this.branchForm.controls.stamImgType.setValue(this.stampImg.fileType)
    }
  }
  onSelectFile_Logo(event: any) {
    if (event.target.files && event.target.files[0]) {
      const extension = event.target.files[0]?.type;
      this.logoImg.fileType = extension.replace('image/', '');
      const reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]); // read file as data url
      reader.onload = (event) => {
        // called once readAsDataURL is completed
        this.logoImg.image = event?.target?.result;
        const base64_data = this.logoImg.image.split(',')[1]
        this.logoImg.imageByte = base64_data
      };
      this.logoImg.fileName = event.target.files[0].name
      this.branchForm.controls.logo.setValue(this.logoImg.imageByte),
        this.branchForm.controls.logoImgType.setValue(this.logoImg.fileType)
    }
  }



  showBranchModel(row, action) {
    
    this.img = {
      fileName: null,
      fileType: null,
      image: null,
      imageByte: null,
    },
    this.stampImg = {
      fileName: null,
      fileType: null,
      image: null,
      imageByte: null,
    };
    this.logoImg = {
      fileName: null,
      fileType: null,
      image: null,
      imageByte: null,
    };
    console.log('row',row);
    this.branchForm.controls.branchCode.setValue(row.branchCode);
    console.log( 'branchCode',this.branchForm.controls.branchCode);
    this.branchForm.controls.branchName.setValue(row.branchName);
    console.log( 'branchName',this.branchForm.controls.branchName);
    this.branchForm.controls.address.setValue(row.address);
    console.log( 'address',this.branchForm.controls.address);
    this.branchForm.controls.bankDetails.setValue(row.bankDetails);
    console.log( 'bankDetails',this.branchForm.controls.bankDetails);
    this.branchForm.controls.branchId.setValue(row.branchId);
    console.log( 'branchId',this.branchForm.controls.branchId);
    this.branchForm.controls.city.setValue(row.city);
    console.log( 'city',this.branchForm.controls.city);
    this.branchForm.controls.companyCode.setValue(row.companyCode);
    console.log( 'companyCode',this.branchForm.controls.companyCode);
    this.branchForm.controls.dateFormat.setValue(row.dateFormat);
    console.log( 'dateFormat',this.branchForm.controls.dateFormat);
    this.branchForm.controls.dayClosingTime.setValue(row.dayClosingTime);
    console.log( 'dayClosingTime',this.branchForm.controls.dayClosingTime);
    this.branchForm.controls.headoffice.setValue(row.headoffice);
    console.log( 'headoffice',this.branchForm.controls.headoffice);
    this.branchForm.controls.isactive.setValue(row.isactive);
    console.log( 'isactive',this.branchForm.controls.isactive);
    this.branchForm.controls.mobDateFormat.setValue(row.mobDateFormat);
    console.log( 'mobDateFormat',this.branchForm.controls.mobDateFormat);
    this.branchForm.controls.phoneNo.setValue(row.phoneNo);
    console.log( 'phoneNo',this.branchForm.controls.phoneNo);
    this.branchForm.controls.priority.setValue(row.priority);
    console.log( 'priority',this.branchForm.controls.priority);
    this.branchForm.controls.zipCode.setValue(row.zipCode);
    console.log( 'zipCode',this.branchForm.controls.zipCode);
    this.branchForm.controls.city.setValue(row.city);
    console.log( 'city',this.branchForm.controls.city);
    this.branchForm.controls.state.setValue(row.state);
    console.log( 'state',this.branchForm.controls.state);
    this.branchForm.controls.country.setValue(row.country);
    console.log( 'country',this.branchForm.controls.country);
    // this.branchForm.controls.logoName.setValue(row?.logoName);

    console.log( 'logoName',this.branchForm.controls.logoName);


    this.branchForm.controls.shortName.setValue(row.shortName);
    this.branchForm.controls.theme.setValue(row.theme);
    this.branchForm.controls.timezone.setValue(row.timezone);
    this.branchForm.controls.tin.setValue(row.tin);
    // this.branchForm.controls.qrName.setValue(row.qrName == null ? '' : row.qrName);
    this.branchForm.controls.qrCode.setValue(row.qrCode);
    this.branchForm.controls.stamp.setValue(row.stamp);
    // this.branchForm.controls.qrName.setValue(row.stampFileDir),
    this.branchForm.controls.imageType.setValue(row.imageType);
    // this.branchForm.controls.stampName.setValue(row.stampName.concat('.jpg')),
    this.branchForm.controls.stamImgType.setValue(row.stamImgType);
    this.branchForm.controls.logoImgType.setValue(row.logoImgType);
    this.branchForm.controls.fileDir.setValue(row.fileDir);
    this.branchForm.controls.branchLock.setValue(row.branchLock);
    this.branchForm.controls.createddate.setValue(row.createddate);
    console.log( 'createddate',this.branchForm.controls.createddate);
    
    this.branchForm.controls.createdby.setValue(row.createdby);
    this.branchForm.controls.lastmodifieddate.setValue(row.lastmodifieddate);
    this.branchForm.controls.lastmodifiedby.setValue(row.lastmodifiedby);
    const header = 'data:image/' + row.imageType + ';base64,';
    this.img = {
      // fileName: row.qrName.concat('.jpg'),
      fileType: row.imageType,
      image: header.concat(row.qrCode),
      imageByte: row.qrCode,
    }
    this.stampImg = {
      // fileName: row.stampName.concat('.jpg'),
      fileType: row.stamImgType,
      image: header.concat(row.stamp),
      imageByte: row.stamp,
    }
    this.logoImg = {
      // fileName: row.stampName.concat('.jpg'),
      fileType: row.logoImgType,
      image: header.concat(row.logo),
      imageByte: row.logo,
    }
    // this.img.fileName = event.target.files[0].name
    // this.branchForm.controls.qrName.setValue(this.img.fileName),
    this.branchForm.controls.qrCode.setValue(this.img.imageByte),
      this.branchForm.controls.stamp.setValue(this.stampImg.imageByte),

      this.branchForm.controls.imageType.setValue(this.img.fileType),
      this.branchForm.controls.stamImgType.setValue(this.stampImg.fileType)

      this.branchForm.controls.imageType.setValue(this.img.fileType),
      this.branchForm.controls.logoImgType.setValue(this.logoImg.fileType)


    if (action == 'view') {
      this.branchview = true;
      this.branchupdate = false;
      //this is for viewing the branch details and not allowing to edit it
      this.branchForm.disable();
    } else if (action == 'edit') {
      this.branchupdate = true;
      this.branchForm.enable();
      this.branchForm.controls.branchCode.disable();
      this.branchview = false;
      this.getIPAdress();
    }
  }

  getIPAdress(): void {
    if (!localStorage.getItem('Ipaddress')) {
      this.authenticationService.getIPAdress().subscribe((res: any) => {
        this.getLocationByIPAddress(res.ip);
      });
    }
    else {
      this.getLocationByIPAddress(localStorage.getItem('Ipaddress'));

    }
  }
  getLocationByIPAddress(ipAddress) {
    this.http.get('https://ipapi.co/' + ipAddress + '/json/')
      .subscribe((res: any) => {
        this.locationData = res;
        this.branchForm.controls.country.setValue(this.locationData.country_name);
        this.branchForm.controls.state.setValue(this.locationData.region);
        // this.branchForm.controls.zipCode.setValue(this.locationData.postal);
      });
    this.getCountrys();
  }

  getCountrys() {
    this.httpGet.nonTokenApi('countries').subscribe((res: any) => {
      this.countryNames = res.response;
      if (this.branchForm.controls.country.value) {
        this.getStatesForThatCmp(this.branchForm.controls.country.value)
      } else {
        this.branchForm.controls.country.setValue(this.locationData?.country_name);
        this.getStatesForThatCmp(this.branchForm.controls.country.value)
      }
    });
  }
  getStatesForThatCmp(country) {
    this.httpGet.nonTokenApi('states?country=' + country).subscribe((res: any) => {
      this.stateNames = res.response;
    })
  }
  add() {
    this.img = {
      fileName: null,
      fileType: null,
      image: null,
      imageByte: null,
    }
    this.stampImg = {
      fileName: null,
      fileType: null,
      image: null,
      imageByte: null,
    };
    this.logoImg = {
      fileName: null,
      fileType: null,
      image: null,
      imageByte: null,
    };
    this.branchupdate = false;
    this.branchview = false;
    this.branchForm.reset();
    this.branchForm.controls.isactive.setValue(true);
    this.getIPAdress();
    this.branchForm.controls.priority.setValue(this.branchs.length + 1);
    this.branchForm.controls.priority.disable();

  }
  create() {
    this.branchForm.get('branchName').setValue(this.globalServ.checkAndRemoveSpecialCharacters(this.branchForm.controls.branchName.value), { emitEvent: false });
    this.branchForm.get('branchCode').setValue(this.globalServ.checkAndRemoveSpecialCharacters(this.branchForm.controls.branchCode.value), { emitEvent: false });
    this.branchForm.get('shortName').setValue(this.globalServ.checkAndRemoveSpecialCharacters(this.branchForm.controls.shortName.value), { emitEvent: false });

    this.spinner.show();
    const obj = {
      "branchId": this.branchForm.controls.branchId.value,
      "branchCode": this.branchForm.controls.branchCode.value,
      "branchName": this.branchForm.controls.branchName.value,
      "shortName": this.branchForm.controls.shortName.value,
      "priority": this.branchs.length + 1,
      "branchLock": this.branchForm.controls.branchLock.value == null ? false : this.branchForm.controls.branchLock.value,
      "companyCode": this.branchForm.controls.companyCode.value,
      "dateFormat": this.branchForm.controls.dateFormat.value,
      "mobDateFormat": this.branchForm.controls.mobDateFormat.value,
      "address": this.branchForm.controls.address.value,
      "city": this.branchForm.controls.city.value,
      "state": this.branchForm.controls.state.value,
      "country": this.branchForm.controls.country.value,
      "zipCode": this.branchForm.controls.zipCode.value,
      "phoneNo": this.branchForm.controls.phoneNo.value,
      "tin": this.branchForm.controls.tin.value,
      "timezone": this.branchForm.controls.timezone.value,
      "theme": this.branchForm.controls.theme.value,
      "dayClosingTime": this.branchForm.controls.dayClosingTime.value,
      "bankDetails": this.branchForm.controls.bankDetails.value,
      "headoffice": this.branchForm.controls.headoffice.value == null ? false : this.branchForm.controls.headoffice.value,
      "isactive": this.branchForm.controls.isactive.value == null ? false : this.branchForm.controls.isactive.value,
      "createdby": this.branchForm.controls.createdby.value,
      "createddate": this.branchForm.controls.createddate.value,
      "lastmodifiedby": this.branchForm.controls.lastmodifiedby.value,
      "lastmodifieddate": this.branchForm.controls.lastmodifieddate.value,
      "qrName": this.branchForm.controls.qrName.value,
      "logoName": this.branchForm.controls.logoName.value,
      // "stampName": this.branchForm.controls.stampName.value,
      "qrCode": this.img.imageByte,
      "stamp": this.stampImg.imageByte,
      "logo": this.logoImg.imageByte,
      "stampImageType": this.branchForm.controls.stamImgType.value,
      "logoType": this.branchForm.controls.logoImgType.value,
      "imageType": this.branchForm.controls.imageType.value,
    }
    this.httpPost.create('branch', [obj]).subscribe((res: any) => {
      this.spinner.hide();
      if (res.status.message == 'SUCCESS') {
        if (this.modifyHeadOfficeRecord) {
          this.updateheadOfficeRecord();
        }
        Swal.fire({
          title: 'Success!',
          text: this.branchForm.controls.branchName.value + ' Created',
          icon: 'success',
        }).then(() => {
          this.branchForm.reset();
          this.getBranchList();
          this.branchForm.controls.isactive.setValue(true);
          this.img = {
            fileName: null,
            fileType: null,
            image: null,
            imageByte: null,
          }
          this.stampImg = {
            fileName: null,
            fileType: null,
            image: null,
            imageByte: null,
          };
          this.logoImg = {
            fileName: null,
            fileType: null,
            image: null,
            imageByte: null,
          };
        })
      }
    },
      (err) => {
        this.spinner.hide();
        Swal.fire({
          title: 'Error!',
          text: err.error.status.message,
          icon: 'error',
        });
      })
  }

  submit() {
    this.branchForm.get('branchName').setValue(this.globalServ.checkAndRemoveSpecialCharacters(this.branchForm.controls.branchName.value), { emitEvent: false });
    this.branchForm.get('branchCode').setValue(this.globalServ.checkAndRemoveSpecialCharacters(this.branchForm.controls.branchCode.value), { emitEvent: false });
    this.branchForm.get('shortName').setValue(this.globalServ.checkAndRemoveSpecialCharacters(this.branchForm.controls.shortName.value), { emitEvent: false });
    this.spinner.show();
    const obj = {
      "branchId": this.branchForm.controls.branchId.value,
      "branchCode": this.branchForm.controls.branchCode.value,
      "branchName": this.branchForm.controls.branchName.value,
      "shortName": this.branchForm.controls.shortName.value,
      "priority": this.branchForm.controls.priority.value,
      "branchLock": this.branchForm.controls.branchLock.value == null ? false : this.branchForm.controls.branchLock.value,

      "companyCode": this.branchForm.controls.companyCode.value,
      "dateFormat": this.branchForm.controls.dateFormat.value,
      "mobDateFormat": this.branchForm.controls.mobDateFormat.value,
      "address": this.branchForm.controls.address.value,
      "city": this.branchForm.controls.city.value,
      "state": this.branchForm.controls.state.value,
      "country": this.branchForm.controls.country.value,
      "zipCode": this.branchForm.controls.zipCode.value,
      "phoneNo": this.branchForm.controls.phoneNo.value,
      "tin": this.branchForm.controls.tin.value,
      "timezone": this.branchForm.controls.timezone.value,
      "theme": this.branchForm.controls.theme.value,
      "dayClosingTime": this.branchForm.controls.dayClosingTime.value,
      "bankDetails": this.branchForm.controls.bankDetails.value,
      "headoffice": this.branchForm.controls.headoffice.value == null ? false : this.branchForm.controls.headoffice.value,
      "isactive": this.branchForm.controls.isactive.value == null ? false : this.branchForm.controls.isactive.value,
      "createdby": this.branchForm.controls.createdby.value,
      "createddate": this.branchForm.controls.createddate.value,
      "lastmodifiedby": this.branchForm.controls.lastmodifiedby.value,
      "lastmodifieddate": this.branchForm.controls.lastmodifieddate.value,
      "qrName": this.branchForm.controls.qrName.value,
      // "stampName": this.branchForm.controls.stampName.value,
      "qrCode": this.img.imageByte,
      "stamp": this.stampImg.imageByte,
      "logo": this.logoImg.imageByte,
      "stampImageType": this.branchForm.controls.stamImgType.value,
      "imageType": this.branchForm.controls.imageType.value,
    }  
    console.log(obj);
     
    this.httpPut.doPut('branch', obj).subscribe((res: any) => {
      this.spinner.hide();
      if (res.status.message == 'SUCCESS') {
        if (this.modifyHeadOfficeRecord) {
          this.updateheadOfficeRecord();
        }
        Swal.fire({
          title: 'Success!',
          text: this.branchForm.controls.branchName.value + ' Updated',
          icon: 'success',
        }).then(() => {
          this.branchForm.reset(); this.getBranchList();
          this.branchForm.controls.isactive.setValue(true);
          this.branchview = false;
          this.branchupdate = false;
          this.img = {
            fileName: null,
            fileType: null,
            image: null,
            imageByte: null,
          }
          this.stampImg = {
            fileName: null,
            fileType: null,
            image: null,
            imageByte: null,
          };
          this.logoImg = {
            fileName: null,
            fileType: null,
            image: null,
            imageByte: null,
          };
          this.closeModel('dismiss');
        })
      }
    },
      (err) => {
        this.spinner.hide();
        Swal.fire({
          title: 'Error!',
          text: err.error.status.message,
          icon: 'error',
        });
      })
  }

  checkHeadOffice() {
    const row = this.branchs.find(x => x.headoffice == true);
    if (row) {
      if (row.branchName !== this.branchForm.controls.branchName.value) {
        if (this.branchForm.controls.headoffice.value) {
          if (this.branchForm.controls.branchName.value !== null) {
            if (row) {
              Swal.fire({
                title: 'Are you sure?',
                html:
                  'Headoffice Already marked for ' + '<b>' + row?.branchName + '</b>' +
                  '<br> Do You Want to Set ' + this.branchForm.controls.branchName.value + '?' + 'as Headoffice',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes',
                allowOutsideClick: false,
              }).then((result) => {
                if (result.isConfirmed) {
                  this.modifyHeadOfficeRecord = row
                }
                else {
                  this.branchForm.controls.headoffice.setValue(false);
                }
              })
            }
          } else {
            Swal.fire({
              icon: 'warning',
              text: 'Enter branch Name',
              showConfirmButton: true,
            });
            this.branchForm.controls.headoffice.setValue(false);
          }
        }
        else {
          this.modifyHeadOfficeRecord = null;
        }
      } else {
        const rows = this.branchs.filter(x => x.headoffice == true);
        if (rows.length > 1) {
          this.branchForm.controls.headoffice.setValue(false);
        } else {
          Swal.fire({
            icon: 'warning',
            text: 'We required one branch as headoffice',
            showConfirmButton: true,
          });
          this.branchForm.controls.headoffice.setValue(true);

        }
      }
    }
  }
  updateheadOfficeRecord() {
    const req = this.modifyHeadOfficeRecord;
    req.headoffice = false;
    this.httpPut.doPut('branch', req).subscribe((res: any) => {
      if (res.status.message == 'SUCCESS') {
        this.sweetAlert('success', req.branchName + ' also Updated!');
        this.branchForm.reset(); this.getBranchList();
        this.branchForm.controls.isactive.setValue(true);
        this.branchview = false;
        this.branchupdate = false;
        this.modifyHeadOfficeRecord = null;
      }
      else {
        Swal.fire({
          icon: 'warning',
          title: res.status.message,
          showConfirmButton: true,
        });
      }
    }, (err) => {
      this.spinner.hide();
      this.sweetAlert('error', err.error.status.message);
    });
  }
  sweetAlert(icon, title) {
    Swal.fire({
      icon: icon,
      title: title,
      showConfirmButton: true,
      // timer: 1500,
    });
  }

  // updateFilter(event) {
  //   const val = event.target.value.toLowerCase();
  //   if (val == '') {
  //     this.branchs = [...this.temp];
  //   } else {
  //     const temp = this.temp.filter(function (d) {
  //       return d.branchName.toLowerCase().indexOf(val) !== -1 || !val;
  //     });
  //     this.branchs = temp;
  //   }
  // }

  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    if (val == '') {
      this.branchs = this.utilServ.branchApiData;
    } else {
      const temp = this.utilServ.branchApiData.filter(function (d) {
        return d.branchName.toLowerCase().indexOf(val) !== -1 || !val;
      });
      this.branchs = temp;
      this.config.totalItems = this.branchs.length;

    }
    this.config.totalItems = this.branchs.length;
    this.config.currentPage = 1;


    this.utilServ.universalSerchedData = {
      componentName: this.className,
      searchedText: this.searchedFor
    }

  }

  resultsPerPage(event) {
    this.config.itemsPerPage =
      event.target.value == 'all' ? this.temp.length : event.target.value;
    this.config.currentPage = 1;
  }
  pageChanged(event) {
    this.config.currentPage = event;
  }

  updatePageSize(pageSize: number) {
    this.config.itemsPerPage = pageSize;
    this.pageChanged;
  }

  closeModel(dismiss) {
    const closeButton = document.querySelector('.delete-btn') as HTMLElement;
    if (closeButton) {
      closeButton.click();
    }
    this.activeModal.dismiss(dismiss);
    this.branchview = false;
    this.branchForm.enable();
    this.branchupdate = false;
  }
}

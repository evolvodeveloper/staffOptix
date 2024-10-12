import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';
import { HttpPostService } from 'src/app/services/http-post.service';
import { HttpPutService } from 'src/app/services/http-put.service';
import { UtilService } from 'src/app/services/util.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-company-details',
  templateUrl: './company-details.component.html',
  styleUrls: ['./company-details.component.scss']
})
export class CompanyDetailsComponent implements OnInit {
  company: any;
  compName: string;
  editName = false;

  companyImgbite: any;
  logoModified = false;
  groupedDocuments = [];
  editDoc = false;
  companyLogoPresent = false;
  companyObj: any = {
    companyId: '',
    companyCode: '',
    companyName: '',
    companyLogo: '',
    fileDir: '',
    shortName: '',
    logoName: '',
    createdby: '',
    createddate: '',
  };


  dateFormat: string;
  hasPermissionToUpdate = false;
  hasPermissionToApprove = false;
  constructor(
    private httpGet: HttpGetService,
    private spinner: NgxSpinnerService,
    private httpPutServ: HttpPutService,
    private httpPost: HttpPostService,
    private utilServ: UtilService,
    private fb: FormBuilder,
    private router: Router,
    private global: GlobalvariablesService,
    private acRoute: ActivatedRoute,

  ) {

  }
  back() {
    this.router.navigateByUrl('setup');
  }
  ngOnInit() {
    this.acRoute.data.subscribe(data => {
      const permission = data.condition
      this.hasPermissionToUpdate = permission.hasPermissionToUpdate
      this.hasPermissionToApprove = permission.hasPermissionToApprove
    });
    this.dateFormat = this.global.dateFormat;

    this.getCompany();
  }


  getCompany() {
    this.spinner.show();
    this.httpGet.getMasterList('company').subscribe(
      (res: any) => {
        this.company = res.response;
        const header = 'data:image/' + res.response.imageType + ';base64,';
        if (res.response.logo) {
          this.companyLogoPresent = true
        }
        this.companyObj = {
          companyId: res.response.companyId,
          companyCode: res.response.companyCode,
          companyName: res.response.companyName,
          companyLogo: res.response.logo == undefined ? '' : header.concat(res.response.logo),
          fileDir: res.response.fileDir,
          shortName: res.response.shortName,
          logoName: res.response.logoName,
          "pricingCode": res.response.pricingCode,
          "validTill": res.response.validTill,
          isactive: res.response.isactive,
          createdby: res.response.createdby,
          createddate: res.response.createddate,
        };
        this.compName = res.response.companyName;
        this.spinner.hide();

      }, err => {
        this.spinner.hide();
        Swal.fire({
          title: 'error',
          text: err.error.status.message,
          icon: 'error',
          timer: 10000,
        });
      }
    );
  }
  onSelectFile(event) {
    this.logoModified = true;
    // if (event.target.files[0].name === undefined) {
    //   if (this.url === undefined) {
    //     this.url = 'none';
    //   }
    // } else {
    if (event.target.files && event.target.files[0]) {
      const extension = event.target.files[0]?.type;
      this.companyObj.imageType = extension.replace('image/', '');
      const reader = new FileReader();

      reader.readAsDataURL(event.target.files[0]); // read file as data url

      reader.onload = (event) => {
        // called once readAsDataURL is completed
        this.companyObj.companyLogo = event.target.result;
        this.companyLogoPresent = true;
        const base64_data = this.companyObj.companyLogo.split(',')[1]
        // const base64_data1 = this.companyObj.companyLogo.split(',')[0]

        this.companyImgbite = base64_data

        // this.companyObj.companyLogo.replace(
        // /^data:image\/\w+;base64,/,'');
      };
      // }
    }
    setTimeout(() => {
      this.sendLogo('logo');
    }, 2000);
  }

  UpdateCompanyName() {
    this.sendLogo('name');
  }
  clearEditedName() {
    this.editName = !this.editName;
    this.compName = this.company.companyName
  }
  sendLogo(source) {
    this.spinner.show();
    const obj = {
      companyCode: this.companyObj.companyCode,
      companyId: this.companyObj.companyId,
      companyName: this.compName,
      createdby: this.companyObj.createdby,
      createddate: this.companyObj.createddate,
      isactive:
        this.companyObj.isactive == null ? false : this.companyObj.isactive,
      logo: this.companyImgbite,
      imageType: this.companyObj.imageType,
      logoName: this.companyObj.logoName,
      "pricingCode": this.companyObj.pricingCode,
      "validTill": this.companyObj.validTill,
      fileDir: this.companyObj.fileDir,
      shortName: this.companyObj.shortName,
      theme: this.companyObj.theme,
    };
    this.httpPutServ.doPut('company', obj).subscribe(
      (res: any) => {
        if (res.status.message == 'SUCCESS') {
          this.logoModified = false;
          this.editName = false;
          if (source == 'name') {
            this.company.companyName = this.compName;
            localStorage.setItem('companyName', this.compName)
          }
          this.spinner.hide();
          // this.company = {};
          // this.companyObj = {
          //   companyId: '',
          //   companyCode: '',
          //   companyName: '',
          //   companyLogo: '',
          //   imageType: '',
          //   fileDir: '',
          //   shortName: '',
          //   logoName: '',
          //   createdby: '',
          //   createddate: '',
          // };
          // this.companyImgbite = '';
          // this.companyLogoPresent = false;
          Swal.fire({
            title: 'Success!',
            text: source == 'logo' ? 'Logo Updated' : 'Name Updated',
            icon: 'success',
            timer: 10000,
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
          title: 'error',
          text: err.error.status.message,
          icon: 'error',
          timer: 10000,
        });
      }
    );
  }
  companyEdit(row) {
    const obj = row;
    const header = 'data:image/png;base64,';
    if (obj.logo !== null && obj.logo !== undefined) {
      this.companyLogoPresent = true;
    }
    this.companyObj = {
      companyId: obj.companyId,
      companyCode: obj.companyCode,
      isactive: obj.isactive,
      companyName: obj.companyName,
      companyLogo: header.concat(obj.logo),
      fileDir: obj.fileDir,
      shortName: obj.shortName,
      logoName: obj.logoName,
      createdby: obj.createdby,
      createddate: obj.createddate,
    };
  }
}

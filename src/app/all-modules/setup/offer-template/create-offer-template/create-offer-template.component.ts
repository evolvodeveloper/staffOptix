import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { HttpGetService } from 'src/app/services/http-get.service';
import { HttpPostService } from 'src/app/services/http-post.service';
import { HttpPutService } from 'src/app/services/http-put.service';
import Swal from 'sweetalert2';
import { UtilService } from '../../../../services/util.service';

@Component({
  selector: 'app-create-offer-template',
  templateUrl: './create-offer-template.component.html',
  styleUrl: './create-offer-template.component.scss'
})
export class CreateOfferTemplateComponent {

  maxWords: number = 2000;
  default = false;
  templateSubject: string;
  totalWords: number;
  templatebody: string;
  update = false;
  records = [
    { placeholder: '@Company_Name', description: 'Represents Company Name' },
    // { placeholder: '@Logo', description: 'Represents Company Logo' },
    { placeholder: '@Applicant_Name', description: 'Represents applicant name' },
    { placeholder: '@Applicant_Address', description: 'Represents applicant address' },
    { placeholder: '@Date', description: 'Represents todays date' },
    { placeholder: '@Designation', description: 'Represents designation' },
    { placeholder: '@Salary', description: 'Represents Salary' },
    { placeholder: '@Table', description: 'Represents salary structure which you gonna fill it up at the time of creating offer letter' },
    { placeholder: '@Join_Date', description: 'Represents applicant join date' },
  ]
  constructor(private httpGet: HttpGetService,
    private httPPost: HttpPostService,
    private utilServ: UtilService,
    private httpPut: HttpPutService,
    private spinner: NgxSpinnerService,
    private router: Router) {

  }
  loadTheDefaultTemplate() {
    this.templatebody = null;
    const row = this.utilServ.offerTemplates.find(x => x.isdefault);
    this.templatebody = row.templateBody;
    this.countWords(this.templatebody);

  }
  ngOnInit() {
    if (this.utilServ.editData?.templateBody || this.utilServ.editData?.templateSubject) {
      this.update = true
      this.templatebody = this.utilServ.editData.templateBody;
      this.templateSubject = this.utilServ.editData.templateSubject;
      this.default = this.utilServ.editData.isdefault;
      this.countWords(this.templatebody);
    }
  }
  countWords(text) {
    // Remove extra spaces and split text into words
    let data = text?.trim().split(/\s+/);
    data = data?.includes('@Table')
    const charCount = text?.length;
    this.totalWords = charCount;
    if (data) {
      this.maxWords = 1400;
    } else {
      this.maxWords = 2000;
    }
    return text;
  };

  back() {
    this.router.navigateByUrl('/setup/offtemplist');
  }
  submit() {
    this.spinner.show();
    const obj = {
      templateName: 'OfferLetter',
      templateSubject: this.templateSubject,
      templateBody: this.templatebody,
      isdefault: this.default
    }
    this.httPPost.create('emailTemplate', obj).subscribe((res: any) => {
      this.spinner.hide();
      if (res.status.message == 'SUCCESS') {
        Swal.fire({
          title: 'Success!',
          text: 'Template Created',
          icon: 'success',
          timer: 10000,
        }).then(() => {
          this.router.navigateByUrl('/setup/offtemplist');
          this.utilServ.editData = null;
          this.update = false;
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
        });
      }
    );
  }
  Update() {
    this.spinner.show();
    const obj = {
      id: this.utilServ.editData.id,
      templateName: 'OfferLetter',
      templateSubject: this.templateSubject,
      templateBody: this.templatebody,
      isdefault: this.default
    }
    this.httpPut.doPut('emailTemplate', obj).subscribe((res: any) => {
      this.spinner.hide();
      if (res.status.message == 'SUCCESS') {
        Swal.fire({
          title: 'Success!',
          text: 'Template Updated',
          icon: 'success',
          timer: 10000,
        }).then(() => {
          this.router.navigateByUrl('/setup/offtemplist');
          this.utilServ.editData = null;
          this.update = false;
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
        });
      }
    );
  }

  ngOnDestroy() {
    this.utilServ.editData = null;
    this.update = false;
  }
}

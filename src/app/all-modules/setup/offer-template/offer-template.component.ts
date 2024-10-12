import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { HttpGetService } from 'src/app/services/http-get.service';
import { UtilService } from '../../../services/util.service';

@Component({
  selector: 'app-offer-template',
  templateUrl: './offer-template.component.html',
  styleUrl: './offer-template.component.scss'
})
export class OfferTemplateComponent {
  searchedFor = '';
  temp = [];
  templatebody = [];
  constructor(private router: Router, private spinner: NgxSpinnerService,
    private utilServ: UtilService, private httpGet: HttpGetService,) {

  }

  ngOnInit() {
    this.getTemplate();
  }

  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    if (val == '') {
      this.templatebody = [...this.temp];
    } else {
      const temp = this.temp.filter(function (d) {
        return d.templateSubject.toLowerCase().indexOf(val) !== -1 || !val;

      });
      this.templatebody = temp;
    }
  }
  create() {
    this.router.navigateByUrl('/setup/offtemplist/template');

  }
  // resultsPerPage(event) {
  //   this.config.itemsPerPage =
  //     event.target.value == 'all' ? this.templatebody.length : event.target.value;
  //   this.config.currentPage = 1;
  // }
  getTemplate() {
    this.spinner.show();
    this.httpGet.getMasterList('emailTemplate?templateName=OfferLetter').subscribe((res: any) => {
      this.templatebody = res.response;
      this.temp = res.response;
      this.utilServ.offerTemplates = this.templatebody;
      this.spinner.hide();
    },
      err => {
        this.spinner.hide();
        console.error(err);
      })
  }
  back() {
    this.router.navigateByUrl('/dashboard');
  }
  update(row) {
    this.utilServ.editData = row;
    this.router.navigateByUrl('/setup/offtemplist/template');

  }
}

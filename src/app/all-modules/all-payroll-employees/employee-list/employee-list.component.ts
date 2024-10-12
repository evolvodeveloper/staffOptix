import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpGetService } from 'src/app/services/http-get.service';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss']
})
export class EmployeeListComponent {
  allemps = [];

  constructor(private route: Router,
    private httpGet: HttpGetService) {

  }


  getEmployees() {
    this.httpGet
      .getMasterList('getEmployeeInfo?isactive=true')
      .subscribe(
        (res: any) => {
          this.allemps = res.response

        })
  }
  create() {
    this.route.navigateByUrl('setup/empList/reg1')
  }

}
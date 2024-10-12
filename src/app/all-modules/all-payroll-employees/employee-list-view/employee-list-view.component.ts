import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-employee-list-view',
  templateUrl: './employee-list-view.component.html',
  styleUrls: ['./employee-list-view.component.scss']
})
export class EmployeeListViewComponent implements OnInit, OnDestroy {
  @Input() public fromParent;
  value: any;
  dateFormat: string;
  emp: any = {
    fileName: '',
    fileType: '',
    image: '',
    imageByte: '',
  }
  isSpecialRoute: boolean;

  constructor(
    public activeModal: NgbActiveModal,
    private utilServ: UtilService,
    private router: Router,
    public globalServ: GlobalvariablesService
  ) {
  }
  ngOnInit() {
    if (this.fromParent?.prop4 === "AllPayrollEmployeesComponent") {
      this.isSpecialRoute = true;
    } else if (this.fromParent?.prop4 == undefined) {
      this.isSpecialRoute = false;
    }

    this.value = this.fromParent?.value;
    this.dateFormat = this.globalServ.dateFormat
    const obj = this.value
    if (obj?.employeeMaster?.empImage !== null && obj?.employeeMaster?.fileType !== null && obj?.employeeMaster?.empImage !== undefined) {
      this.emp.image = (obj.employeeMaster?.empImage),
        this.emp.imageByte = (obj.employeeMaster?.imageByte),
        this.emp.fileType = obj.employeeMaster?.fileType,
        this.emp.filName = obj.employeeMaster?.fileName
    }
    else {
      this.emp = {
        fileName: '',
        fileType: '',
        image: '',
        imageByte: '',
      }
    }

  }
  back() {
    this.router.navigateByUrl('/empList');
    this.activeModal.close();

  }
  ngOnDestroy() {
    this.utilServ.viewData = null;
    this.fromParent = null;
  }



}

import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';

@Component({
  selector: 'app-load-more',
  templateUrl: './load-more.component.html',
  styleUrls: ['./load-more.component.scss']
})
export class LoadMoreComponent implements OnInit {
  @Input() public load_more;
  data: any = [];
  temp: any = [];
  dateFormat: string;

  constructor(public activeModal: NgbActiveModal,
    public global: GlobalvariablesService,
  ) { }

  ngOnInit(): void {
    this.data = [...this.load_more.data];
    this.temp = [...this.load_more.data];
    this.dateFormat = this.global.dateFormat;

  }

  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    if (val == '') {
      this.data = [...this.temp];
    } else {
      const temp = this.temp.filter(function (d) {
        return (d.employeeName && d.employeeName.toLowerCase().indexOf(val) !== -1) || (d.employeeCode && d.employeeCode.toLowerCase().indexOf(val) !== -1) || !val;
      });
      this.data = temp;
    }
  }

  closeModal(sendData) {
    this.activeModal.close(sendData);
  }
}

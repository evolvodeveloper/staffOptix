import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-resignation-list',
  templateUrl: './resignation-list.component.html',
  styleUrls: ['./resignation-list.component.scss'],
})
export class ResignationListComponent implements OnInit {
  public addResignForm: FormGroup;
  public editResignForm: FormGroup;
  lstResignation = [
    {
      id: 1,
      employee: 'John Doe',
      department: 'Web development',
      reason: 'tested',
      noticedDate: '28-02-2019',
      resignDate: '28-03-2019',
    },
    {
      id: 2,
      employee: 'Russia smith',
      department: 'Web development',
      reason: 'tested',
      noticedDate: '28-02-2019',
      resignDate: '28-03-2019',
    },
    {
      id: 3,
      employee: 'Richared deo',
      department: 'Web development',
      reason: 'tested',
      noticedDate: '28-02-2019',
      resignDate: '28-03-2019',
    },
    {
      id: 4,
      employee: 'Mark hentry',
      department: 'Web development',
      reason: 'tested',
      noticedDate: '28-02-2019',
      resignDate: '28-03-2019',
    },
  ];
  constructor(private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.addResignForm = this.formBuilder.group({
      EmployeeName: ['', [Validators.required]],
      NoticeDated: ['', [Validators.required]],
      ResignationDate: ['', [Validators.required]],
      ReasonName: ['', [Validators.required]],
    });

    this.editResignForm = this.formBuilder.group({
      EmployeeName: ['', [Validators.required]],
      NoticeDated: ['', [Validators.required]],
      ResignationDate: ['', [Validators.required]],
      ReasonName: ['', [Validators.required]],
    });
  }
}

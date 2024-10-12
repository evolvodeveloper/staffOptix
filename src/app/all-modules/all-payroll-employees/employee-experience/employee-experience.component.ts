import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { HttpGetService } from 'src/app/services/http-get.service';

@Component({
  selector: 'app-employee-experience',
  templateUrl: './employee-experience.component.html',
  styleUrls: ['./employee-experience.component.scss']
})
export class EmployeeExperienceComponent implements OnInit {
  hasTabs = false;
  mstNew = [];
  tabData = []; fields: any;

  constructor(
    private httpGet: HttpGetService,
    private formBuilder: FormBuilder,
    private router: Router,
  ) { }
  back() {
    this.router.navigateByUrl('/all-payroll-employees');
  }

  ngOnInit() {
    this.empExperience();
  }
  empExperience() {
    this.hasTabs = false;
    this.httpGet.getMasterList('mst/form?formCode=employee experience').subscribe((res: any) => {
      this.mstNew = res.response
      res.response.formHeader.forEach(element => {
        if (element.tab == false && element.tabId !== null) {
          this.hasTabs = true
          this.tabData.push({
            tabId: element.tabId,
            header: element.header,
            formCode: element.formCode,
            array: []
          })
        } else {
          if (res.response.formHeader.length <= 1) {
            this.tabData.push({
              tabId: element.tabId,
              header: element.header,
              formCode: element.formCode,
              array: []
            })
          }
        }
      })
      const jsonList = [];
      res.response.formColumns.forEach(element => {
        if (element.dataType == 'json') {
          this.fields = JSON.parse(element.defaultValues);
          this.fields['Additional Columns'].forEach(ele => {
            if (ele?.Param) {
              jsonList.push({
                'label': ele.Param,
                columnCode: ele.Param,
                columnName: ele.Param,
                'pctSize': ele.pctSize,
                'dataLength': ele.dataLength,
                dataType: ele.dataType,
                isMandatory: ele.isMandatory,
                placeHolder: ele.placeHolder,
                sameLine: ele.sameLine,
                subheadName: element.columnCode,
                form: element.form, tab: element.tab
              })
            }
          });
        }
      })
      const array = res.response.formColumns.concat(jsonList)
      array.forEach(element => {
        if (this.hasTabs) {
          const matchingTab = this.tabData.filter(column => element.tab === column.tabId ? column.tabId : null);
          if (matchingTab) {
            matchingTab[0].array.push(element)
          }
        } else {
          console.error('else');
          this.tabData[0]['array'].push(element)
        }
      });
      this.tabData.forEach(tab => {
        const formGroup = this.createFormGroup(tab.formCode, tab.array);
        tab['formGroup'] = formGroup;
      });
      this.processData(array).then(() => {
        // The dropDownData should be populated now
      });
    },
      err => {
        console.error(err.error.status.message);
      }
    );
  }
  createFormGroup(formCode: string, formArray: any[]): FormGroup {
    const formGroupControls = {};

    formArray.forEach(field => {
      if (field.dataType == 'checkbox') {
        const control = new FormControl(true, field.isMandatory ? Validators.required : null);
        formGroupControls[field.columnName] = control;
      } else {
        const control = new FormControl('', field.isMandatory ? Validators.required : null);
        formGroupControls[field.columnName] = control;
      }
    });

    return this.formBuilder.group(formGroupControls);
  }
  getData(val): Observable<any> {
    return this.httpGet.generalApiRequestFromDynamicForm(val);
  }
  async processData(response) {
    for (const element of response) {
      if (element.dataType === "dropdown") {
        element.dropDownData = [];
        element.defaultValues = JSON.parse(element.defaultValues);
        if (element.defaultValues?.url && !element.defaultValues?.parameter) {
          this.getData(element.defaultValues.url).subscribe((data) => {
            element.dropDownData = data.response;
          });
        }
        else {
          element.dropDownData = element.defaultValues?.tags
        }
      }
    }
  }

}

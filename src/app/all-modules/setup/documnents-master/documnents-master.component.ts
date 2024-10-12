import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { GlobalvariablesService } from 'src/app/services/globalvariables.service';
import { HttpGetService } from 'src/app/services/http-get.service';
import { HttpPostService } from 'src/app/services/http-post.service';
import { HttpPutService } from 'src/app/services/http-put.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-documnents-master',
  templateUrl: './documnents-master.component.html',
  styleUrls: ['./documnents-master.component.scss']
})
export class DocumnentsMasterComponent implements OnInit {
  empDoc = [];
  listOfNames = [];
  docType: string;
  groupedDocuments = [];
  editDoc = false;
  constructor(
    private httpGet: HttpGetService,
    private global: GlobalvariablesService,
    public activeModal: NgbActiveModal,
    private spinner: NgxSpinnerService,
    private httpPutServ: HttpPutService,
    private httpPost: HttpPostService,
    private router: Router

  ) { }

  ngOnInit() {
    this.getEmpDocs();
  }
  back() {
    this.router.navigateByUrl('setup');
  }

  getEmpDocs() {
    this.httpGet.getMasterList('docs').subscribe(
      (res: any) => {
        this.empDoc = res.response;
        const groupedDocuments = res.response.reduce((acc, doc) => {
          const documentType = doc.documentType;
          if (!acc[documentType]) {
            acc[documentType] = { docType: documentType, documents: [] };
          }
          acc[documentType].documents.push(doc);

          return acc;
        }, {});
        this.groupedDocuments = Object.values(groupedDocuments);
      },
      err => {
        console.error(err?.error?.status?.message);

      }
    );
  }
  AddDocType() {
    const val = (this.global.checkAndRemoveSpecialCharacters(this.docType));
    this.listOfNames.push({
      documentType: val,
      documentName: '',
      isMandatory: false
    })
  }
  addNew(val, source) {
    if (source === 'edit') {
      this.editDoc = true;
      this.docType = val.docType
      val.documents.forEach(element => {
        this.listOfNames.push({
          buCode: element.buCode,
          documentId: element.documentId,
          documentName: element.documentName,
          documentType: element.documentType,
          isMandatory: element.isMandatory,
          tenantCode: element.tenantCode,
        })
      });
    }
  }
  closeModel(dismiss) {
    this.editDoc = false;
    this.docType = '',
      this.listOfNames = [];
    const closeButton = document.querySelector('.delete-btn') as HTMLElement;
    if (closeButton) {
      closeButton.click();
    }
    // this.activeModal.dismiss(dismiss);
  }
  create() {
    let pass = false;
    const list = this.listOfNames.filter(x => x.documentId == undefined)
    list.forEach(x => {
      if (x.documentName !== '' && x.documentType !== undefined && x.documentType !== '') {
        pass = true;
      } else {
        pass = false
      }
    })
    if (list.length > 0 && pass) {
      this.spinner.show();
      this.httpPost.create('docs', list).subscribe((res: any) => {
        this.spinner.hide();
        if (res.status.message == 'SUCCESS') {
          Swal.fire({
            title: 'Success!',
            text: 'Document added',
            icon: 'success',
            timer: 10000,
          }).then(() => {
            this.closeModel('');
            this.getEmpDocs();
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
          console.error(err.error.status.message);
          Swal.fire({
            title: 'Error!',
            text: err.error.status.message,
            icon: 'error',
          });
        }
      );

    } else {
      Swal.fire({
        title: 'info!',
        text: 'Please add a document name and type',
        icon: 'info',
      });
    }
  }
  remove(i) {
    this.listOfNames.splice(i, 1)
  }
  Update() {
    let pass = false;
    // const list = this.listOfNames.filter(x => x.documentId == undefined)
    this.listOfNames.forEach(x => {
      if (x.documentName !== '' && x.documentType !== undefined && x.documentType !== '') {
        pass = true;
      } else {
        pass = false
      }
    })
    if (this.listOfNames.length > 0 && pass) {
      this.spinner.show();
      this.httpPutServ.doPut('docs', this.listOfNames).subscribe((res: any) => {
        this.spinner.hide();
        if (res.status.message == 'SUCCESS') {
          Swal.fire({
            title: 'Success!',
            text: 'Documents Updated',
            icon: 'success',
            timer: 10000,
          }).then(() => {
            this.closeModel('');
            this.getEmpDocs();

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
          console.error(err.error.status.message);
          Swal.fire({
            title: 'Error!',
            text: err.error.status.message,
            icon: 'error',
          });
        }
      );

    } else {
      Swal.fire({
        title: 'info!',
        text: 'Please add a document name and type',
        icon: 'info',
      });
    }
  }

}

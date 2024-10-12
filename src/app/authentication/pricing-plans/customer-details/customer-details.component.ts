import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { HttpGetService } from 'src/app/services/http-get.service';
import { HttpPostService } from 'src/app/services/http-post.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-customer-details',
  templateUrl: './customer-details.component.html',
  styleUrls: ['./customer-details.component.scss']
})
export class CustomerDetailsComponent implements OnInit {
  @Input() public userdata;

  customerForm: FormGroup;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private httpGet: HttpGetService,
    private httpPost: HttpPostService,
    private spinner: NgxSpinnerService,
    private router: Router
  ) { }


  ngOnInit(): void {
    this.customerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', Validators.required],
      phone: ['', Validators.required],
      // country: ['', Validators.required],
      // pincode: ['', Validators.required],
    });
  }

  closeModal(sendData) {
    this.activeModal.close(sendData);
  }
  submit() {
    this.spinner.show();
    const obj = {
      "name": this.customerForm.controls.name.value.trim(),
      "email": this.customerForm.controls.email.value,
      "phoneNo": this.customerForm.controls.phone.value,
    }
    this.httpPost.create('contactus', obj).subscribe((res: any) => {
      this.spinner.hide();
      if (res.status.message == 'SUCCESS') {
        this.closeModal(res);
        Swal.fire({
          position: 'top-right',
          title: 'Success!',
          text: 'We will contact you soon. ',
          icon: 'success',
          timer: 10000,
        }).then(() => {

          this.customerForm.reset();
          // if (res.status.message === 'SUCCESS') {
          localStorage.removeItem('token');
          localStorage.removeItem('user-data');
          localStorage.removeItem('branch');
          localStorage.removeItem('branchCode');
          this.router.navigateByUrl('auth');
          // }
        });
      }
      else {
        Swal.fire({
          title: 'Error!',
          text: res.status.message,
          icon: 'warning',
          showConfirmButton: true,
        });
      }
    },
      err => {
        this.spinner.hide();
        console.error(err);
        Swal.fire({
          title: 'Error!',
          text: err.error.status.message,
          icon: 'error',
        });
      });
  }

}

import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { HttpGetService } from 'src/app/services/http-get.service';
import { HttpPostService } from 'src/app/services/http-post.service';
import { HttpPutService } from 'src/app/services/http-put.service';
import { RazorPayService } from 'src/app/services/razor-pay.service';
import { UtilService } from 'src/app/services/util.service';
import Swal from 'sweetalert2';
import { CustomerDetailsComponent } from './customer-details/customer-details.component';
declare let Razorpay: any;
@Component({
  selector: 'app-pricing-plans',
  templateUrl: './pricing-plans.component.html',
  styleUrls: ['./pricing-plans.component.scss']
})
export class PricingPlansComponent implements OnInit {

  pricemasterlist = [];
  subscriptionList = [];
  isMostPopular = false;
  planAmount = 0;
  subscriptionMode: string;
  constructor(
    private spinner: NgxSpinnerService,
    private httpGet: HttpGetService,
    private httpPut: HttpPutService,
    private razorpayService: RazorPayService,
    private cd: ChangeDetectorRef,
    private router: Router,
    private modalService: NgbModal,
    private uilSer: UtilService,
    private httpPostService: HttpPostService,
  ) {
    if (!localStorage.getItem('company')) {
      this.router.navigate(['auth']);
    }
    this.uilSer.showGif = false;
  }
  signIn() {
    localStorage.removeItem('token');
    localStorage.removeItem('user-data');
    localStorage.removeItem('branch');
    localStorage.removeItem('branchCode');
    this.router.navigateByUrl('auth');
  }

  ngOnInit() {
    this.getPricingPlans();
    // this.getYealyPricingPlans();
    this.razorpayService
      .lazyLoadLibrary('https://checkout.razorpay.com/v1/checkout.js')
      .subscribe();
  }

  public proceed(row: any) {   
    let razorPayOrder: any;
    if (row.plan.pricingCode == 'Freemium') {
      const obj = {
        subscriptionMode: row.subscription.subscriptionMode,
        company: localStorage.getItem('company')
      }
      this.httpPut.nonTokenApi('companyFreePlan?subscriptionMode=' + obj.subscriptionMode + '&company=' + obj.company, '').subscribe((Res: any) => {
        // if(Res.response.status == 'SUCCESS'
        if (Res.status.message === 'SUCCESS') {
          localStorage.removeItem('token');
          localStorage.removeItem('user-data');
          localStorage.removeItem('branch');
          localStorage.removeItem('branchCode');
          this.router.navigateByUrl('auth');
        }
      })



    } else if (row.plan.pricingCode == 'Premium' || row.plan.pricingCode == 'Basic' || row.plan.pricingCode == 'Gold') {
      this.spinner.show();
      this.subscriptionMode = row.subscription.subscriptionMode
      const obj = {
        "amount": row.subscription.amount * 100,
        "currency": row.subscription.currency,
        companyCode: localStorage.getItem('company'),
        "subscriptionMode": row.subscription.subscriptionMode
      }
      if (obj != null) {
        this.httpPostService.nonTokenApi('razorPayOrder', obj).subscribe((res: any) => {
          this.spinner.hide();
          razorPayOrder = res.response
          const RAZORPAY_OPTIONS = {
            // "key": "rzp_live_JgqiXhA52wq17g ", // Enter the Key ID generated from the Dashboard
            "key": "rzp_test_7WQAw2owyf4cd4 ",
            "amount": razorPayOrder.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
            "currency": razorPayOrder.currency,
            "name": "SpringLogix Software Pvt Ltd", //your business name
            "description": "Test Transaction",
            "image": "https://example.com/your_logo",
            "order_id": razorPayOrder.orderId, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1

            "prefill": { //We recommend using the prefill parameter to auto-fill customer's contact information especially their phone number
              "name": "", //your customer's name
              "email": "",
              "contact": "" //Provide the customer's phone number for better conversion rates
            },
            "notes": {
              "address": ""
            },
            "theme": {
              "color": "#2563eb"
            }
          };

          RAZORPAY_OPTIONS['handler'] = this.razorPaySuccessHandler.bind(this);

          const rzp1 = new Razorpay(RAZORPAY_OPTIONS);
          rzp1.open();



        },
          (err) => {
            this.spinner.hide();
            Swal.fire({
              title: 'Error!',
              text: err.error.status.message,
              icon: 'error',
              timer: 3000,
            });
          }
        );
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Something went wrong!',
        })
      }

    } else if (row.plan.pricingCode == 'Enterprise') {
      this.openModal(row);
    }

  }

  public async proceedForYearly(row: any) {
    if (row.plan.pricingCode == 'Freemium') {
      this.router.navigate(['auth']);
    } else if (row.plan.pricingCode == 'Premium' || row.plan.pricingCode == 'Basic' || row.plan.pricingCode == 'Gold') {

      this.spinner.show();
      this.isMostPopular = false;
      this.httpGet.nonTokenApi('razorPayOrder?amount=' + row.subscription.amount + '&currency=' + row.subscription.currency + '&subscriptionMode' + row.subscription.subscriptionMode).subscribe((res: any) => {
        this.spinner.hide();
      },
        (err) => {
          this.spinner.hide();
          Swal.fire({
            title: 'Error!',
            text: err.error.status.message,
            icon: 'error',
            timer: 3000,
          });
        }
      );


  // const RAZORPAY_OPTIONS_YEARLY = {
  //   "key": "rzp_live_JgqiXhA52wq17g", // Enter the Key ID generated from the Dashboard
      //   "amount": '10000', // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
      //   "currency": "INR",
      //   "name": "SpringLogix Software Pvt Ltd", //your business name
      //   "description": "Test Transaction",
      //   "image": "https://example.com/your_logo",
      //   "order_id": "order_McBczUIogdDh63", //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
      //   "handler": function (response) {
      //     // alert(response.razorpay_payment_id);
      //     // alert(response.razorpay_order_id);
      //     // alert(response.razorpay_signature)
      //   },
      //   "prefill": { //We recommend using the prefill parameter to auto-fill customer's contact information especially their phone number
      //     "name": "Dhanajay Reddy", //your customer's name
      //     "email": "gaurav.kumar@example.com",
      //     "contact": "9000090000" //Provide the customer's phone number for better conversion rates
      //   },
      //   "notes": {
      //     "address": "Razorpay Corporate Office"
      //   },
      //   "theme": {
      //     "color": "#3399cc"
      //   }
      // };
      // try {
      //   RAZORPAY_OPTIONS_YEARLY.amount = row.subscription.amount;
      //   var rzp1 = new Razorpay(RAZORPAY_OPTIONS_YEARLY);
      //   rzp1.open();
      //   rzp1.on('payment.failed', function (response) {
      //     // alert(response.error.code);
      //     // alert(response.error.description);
      //     // alert(response.error.source);
      //     // alert(response.error.step);
      //     // alert(response.error.reason);
      //     // alert(response.error.metadata.order_id);
      //     // alert(response.error.metadata.payment_id);
      //   });
      // } catch (error) {
      // }

      // RAZORPAY_OPTIONS_YEARLY.amount = RAZORPAY_OPTIONS_YEARLY.amount + '00';
      // let razorpay = new Razorpay(RAZORPAY_OPTIONS_YEARLY);
      // razorpay.open();
    } else if (row.plan.pricingCode == 'Enterprise') {
      this.openModal(row);
    }
  }

  openModal(data) {
    const modalRef = this.modalService.open(CustomerDetailsComponent, {
      scrollable: true,
      windowClass: 'myCustomModalClass',
      size: 'md',
    });
    modalRef.componentInstance.userdata = {
      row: data,
    };
    // modalRef.componentInstance.fromParent = data;
  }

  onYearly(event: any) {
    // this.isYearly = event.target.checked;


    if (event.target.checked == true) {
      // this.isQuaterly = false;
      // this.isYearly = true;
      this.getYealyPricingPlans();
    } else if (event.target.checked == false || event.target.checked == undefined || event.target.checked == null) {
      // this.isYearly = false;
      // this.isQuaterly = true;
      this.getPricingPlans();
    }
  }

  public razorPaySuccessHandler(response) {
    const obj = {
      companyCode: localStorage.getItem('company'),
      orderId: response.razorpay_order_id,
      paymentId: response.razorpay_payment_id,
      razorSecKey: response.razorpay_signature,
      subscriptionMode: this.subscriptionMode,
    }

    this.httpPostService.nonTokenApi('razorPayment', obj).subscribe((res: any) => {
      if (res == true) {
        Swal.fire({
          icon: 'success',
          title: 'Payment Success',
          text: 'Your payment has been successfully completed!',
        });
        localStorage.removeItem('token');
        localStorage.removeItem('user-data');
        localStorage.removeItem('branch');
        localStorage.removeItem('branchCode');
        this.router.navigateByUrl('auth');
      } else if (res == false) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Payment Failed ! Please try again',
        })
      }
    });
    this.cd.detectChanges();
    // document.getElementById('razorpay-response').style.display = 'block';
  }

  getPricingPlans() {
    this.spinner.show();
    this.isMostPopular = false;
    this.httpGet.nonTokenApi('pricingPlans?module=ATLAS&currency=INR').subscribe((res: any) => {
      this.spinner.hide();
      res.response.forEach(element => {
        element.plan.color = this.getRandomColor();
        element.plan.isMostPopular = false;
        const string = element.plan.pricingCode.toLowerCase();
        element.plan.pricingCode = string.charAt(0).toUpperCase() + string.slice(1);

        if (element.plan.pricingCode === 'Premium') {
          element.plan.isMostPopular = true;
        }

      });
      this.pricemasterlist = res.response;
      // for (let i = 0; i < this.pricemasterlist.length; i++) {
      //   const randomColor = this.getRandomColor();
      //   this.pricemasterlist.push(randomColor);
      // }


    },
      (err) => {
        this.spinner.hide();
        Swal.fire({
          title: 'Error!',
          text: err.error.status.message,
          icon: 'error',
          timer: 3000,
        });
      }
    );
  }

  getYealyPricingPlans() {
    this.spinner.show();
    this.isMostPopular = false;
    this.planAmount = 0;
    this.httpGet.nonTokenApi('pricingPlansYearly?module=ATLAS&currency=INR').subscribe((res: any) => {
      this.spinner.hide();
      if (res.response.subscription == null) {
        res.response.subscription = [];
        res.response.subscription.push({
          "duration": "Yearly",
          "currency": "INR",
          "amount": 0,
        })
      }
      res.response.forEach(element => {
        element.plan.color = this.getRandomColor();
        element.plan.isMostPopular = false;
        // element.plan.planAmount = '';
        // let sub = [];
        // sub.push(element.subscription)
        // element.plan.planAmount = sub[0].amount;
        const string = element.plan.pricingCode.toLowerCase();
        element.plan.pricingCode = string.charAt(0).toUpperCase() + string.slice(1);

        if (element.plan.pricingCode === 'Premium') {
          element.plan.isMostPopular = true;
        }

      });
      this.pricemasterlist = res.response;
    },
      (err) => {
        this.spinner.hide();
        Swal.fire({
          title: 'Error!',
          text: err.error.status.message,
          icon: 'error',
          timer: 3000,
        });
      }
    );
  }

  getRandomColor() {  // Generate a random RGB color  
    const r = Math.floor(Math.random() * 256); const g = Math.floor(Math.random() * 256); const b = Math.floor(Math.random() * 256);
    // Convert RGB values to a CSS color string 
    return `rgb(${r}, ${g}, ${b})`;
  }

}

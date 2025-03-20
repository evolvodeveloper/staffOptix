import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-five-zero-three-page',
  templateUrl: './five-zero-three-page.component.html',
  styleUrls: ['./five-zero-three-page.component.scss']
})
export class FiveZeroThreePageComponent {


  constructor(
    private router: Router,
  ) { }

  revertBack() {
    this.router.navigate(['']);
  }

}

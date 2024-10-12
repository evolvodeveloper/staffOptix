import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appAlphaNumeric]'
})
export class AlphaNumericDirective {
  constructor(private el: ElementRef) { 
  }

  @HostListener('input', ['$event']) onInput(event: Event): void {
    const input = this.el.nativeElement.value;
    // Remove leading spaces
    const value = input.replace(/^\s+/, '');
    // Remove consecutive spaces
    const val = value.replace(/\s{2,}/g, ' ');

    // Allow only characters and numbers
    const fValue = val.replace(/[^a-zA-Z0-9_()]/g, '');
    const vVa = fValue.replace(/[^a-zA-Z0-9_()\s]/g, '');
    this.el.nativeElement.value = vVa

    // this.el.nativeElement.value = input.replace(/[^\s+a-zA-Z0-9 ]/g, '');
    // this.el.nativeElement.value = input.replace(/[^\s+a-zA-Z0-9 ]/g, '');
    //   this.el.nativeElement.value = input.replace(/^(?! )[a-zA-Z0-9 ]*(?<! )$/, '');

    // }
  }
}
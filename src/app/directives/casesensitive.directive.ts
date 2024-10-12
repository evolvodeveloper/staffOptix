import { Directive, ElementRef, HostListener } from '@angular/core';
import { GlobalvariablesService } from '../services/globalvariables.service';

@Directive({
    selector: '[appCaseSensitive]'
})
export class CaseSensitiveDirective {
    constructor(private el: ElementRef,
        private globalServ: GlobalvariablesService) {
    }

    @HostListener('input', ['$event']) onInput(event: Event): void {
        const input = this.el.nativeElement.value;
        if (this.globalServ.appvariables?.get('SPECIFIED_CASE') === 'UPPER') {
            // this.el.nativeElement.value = input.toUpperCase();
            this.checkAlpaNum(input.toUpperCase());
        } else if (this.globalServ.appvariables?.get('SPECIFIED_CASE') === 'LOWER') {
            // this.el.nativeElement.value = input.toLowerCase();
            this.checkAlpaNum(input.toLowerCase());
        } else if (
            this.globalServ.appvariables?.get('SPECIFIED_CASE') === 'CAMEL_CASE'
        ) {
            const x = input.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            // this.el.nativeElement.value = x
            this.checkAlpaNum(x);
        }
    }
    checkAlpaNum(input: string) {
        const value = input.replace(/^\s+/, '');
        // Remove consecutive spaces
        const val = value.replace(/\s{2,}/g, ' ');

        // Allow only characters and numbers
        const fValue = val.replace(/[^a-zA-Z0-9_()\s]+$/g, '');
        const vVa = fValue.replace(/[^a-zA-Z0-9_()\s]+$/g, '');
        this.el.nativeElement.value = vVa;
        const sanitizedInput = vVa.replace(/[^a-zA-Z0-9_()\s]/g, '');
        this.el.nativeElement.value = sanitizedInput;
        // this.el.nativeElement.value = this.el.nativeElement.value.replace(/[^a-zA-Z0-9_()\s]+$/g, '');
        return this.el.nativeElement.value

    }
}
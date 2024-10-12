import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'decreaseText'
})
export class DecreaseTextPipe implements PipeTransform {
  transform(value: string, limit: number, ellipsis = '...'): string {
    if (value) {
      // if (completeWords) {
      //   limit = value.substr(0, limit).lastIndexOf(' ');
      // }
      return value.length > limit ? value.substr(0, limit) + ellipsis : value;
    }
  }
}

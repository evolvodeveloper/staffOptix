import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';
@Pipe({
  name: 'timeFormater'
})
export class TimeFormaterPipe implements PipeTransform {

  transform(value: string): unknown {
    const val = value ? moment(value, 'HH:mm:ss').format('HH:mm') : '';
    return val;
  }

}

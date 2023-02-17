import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'phone_mask'
})
export class PhonePipe implements PipeTransform {

  transform(value: string, arg?: any): any {
    let cleaned = ('' + value).replace(/\D/g, '');
    let phone = cleaned.match(/^(\d{2})(\d{4})(\d{4})$/);
    let smartphone = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
    if (phone) {
      return '(' + phone[1] + ') ' + phone[2] + '-' + phone[3];
    } else if (smartphone) {
      return '(' + smartphone[1] + ') ' + smartphone[2] + '-' + smartphone[3];
    } else {
      return value;
    }
  }

}

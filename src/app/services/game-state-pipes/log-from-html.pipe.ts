import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'logFromHTML',
})
export class LogFromHTMLPipe implements PipeTransform {
  transform(value: string | number, label?: string): string | number {
    if (label) {
      console.warn('Logging HTML Pipe ' + label, value);
    } else {
      console.warn('Logging HTML Pipe', value);
    }
    return value;
  }
}

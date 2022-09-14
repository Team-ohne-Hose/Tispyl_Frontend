import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'logFromHTML',
})
export class LogFromHTMLPipe implements PipeTransform {
  transform(value: string | number, label?: string): string | number {
    console.warn('Logging HTML Pipe' + label ? ` ${label}` : '', value);
    return value;
  }
}

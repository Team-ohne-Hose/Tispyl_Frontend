import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'getLoginName',
})
export class GetLoginNamePipe implements PipeTransform {
  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }
}

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'asRomanNumeral',
})
export class RomanNumeralsPipe implements PipeTransform {
  transform(value: number): string {
    return this._romanize(value);
  }

  /** This function was taken from the following blog: https://blog.stevenlevithan.com/archives/javascript-roman-numeral-converter */
  private _romanize(num) {
    if (!+num) {
      return 'ERROR';
    }
    const digits = String(+num).split('');
    const key = [
      '',
      'C',
      'CC',
      'CCC',
      'CD',
      'D',
      'DC',
      'DCC',
      'DCCC',
      'CM',
      '',
      'X',
      'XX',
      'XXX',
      'XL',
      'L',
      'LX',
      'LXX',
      'LXXX',
      'XC',
      '',
      'I',
      'II',
      'III',
      'IV',
      'V',
      'VI',
      'VII',
      'VIII',
      'IX',
    ];
    let roman = '';
    let i = 3;

    while (i--) {
      roman = (key[+digits.pop() + i * 10] || '') + roman;
    }

    return Array(+digits.join('') + 1).join('M') + roman;
  }
}

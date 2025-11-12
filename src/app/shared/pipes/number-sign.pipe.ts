import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'numberSign', standalone: true })
export class NumberSignPipe implements PipeTransform {
  transform(value: number): string {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}`;
  }
}

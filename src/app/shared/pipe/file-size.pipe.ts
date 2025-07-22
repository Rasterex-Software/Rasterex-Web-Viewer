import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileSize'
})
export class FileSizePipe implements PipeTransform {

transform(bytes: number | string | null | undefined, decimal: number = 2): string {
    if (bytes == null || isNaN(+bytes)) return '0 Bytes';

    const value = +bytes;
    if (value === 0) return '0 Bytes';

    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(value) / Math.log(1024));
    const size = parseFloat((value / Math.pow(1024, i)).toFixed(decimal));

    return `${size} ${sizes[i]}`;
  }
}

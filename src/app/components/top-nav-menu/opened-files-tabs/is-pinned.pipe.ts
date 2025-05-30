import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'isPinned',
  pure: false
})
export class IsPinnedPipe implements PipeTransform {
  transform(file: any, pinnedFiles: any[]): boolean {
    return pinnedFiles?.some((element) => element.id === file.id);
  }
}

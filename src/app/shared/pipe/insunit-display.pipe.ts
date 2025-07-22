import { Pipe, PipeTransform } from '@angular/core';
import { INSUNIT_MAPPING } from 'src/app/models/insunit-mapping';

@Pipe({
  name: 'insunitDisplay'
})
export class InsunitDisplayPipe implements PipeTransform {

   transform(value: string | number | null | undefined): string {
    if (value === null || value === undefined) {
      return 'Unitless';
    }
    
    const stringValue = value.toString();
    return INSUNIT_MAPPING[stringValue] || `Unknown Unit (${stringValue})`;
  }

}

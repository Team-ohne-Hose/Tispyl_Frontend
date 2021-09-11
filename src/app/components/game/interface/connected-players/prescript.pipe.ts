import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'prescript',
})
export class PrescriptPipe implements PipeTransform {
  private static readonly DEFAULT = 'Name';
  private static readonly LEFT_NEIGHBOR = 'Linker Nachbar';
  private static readonly RIGHT_NEIGHBOR = 'Rechter Nachbar';
  private static readonly OVERLAP = 'Nachbar';

  /** This pipe resolves the neighbors array into a human readable form based on the value i.
   *  Resulting in a html template that avoids both direct function calls that conflict with
   *  Angulars change detection and unwieldy *ngIf chains */
  transform(neighbors: [number, number], i: number): string {
    if (neighbors !== undefined && neighbors !== null && neighbors !== []) {
      const l = neighbors[0];
      const r = neighbors[1];

      if (i === l && i !== r) {
        return PrescriptPipe.LEFT_NEIGHBOR;
      } else if (i === r && i !== l) {
        return PrescriptPipe.RIGHT_NEIGHBOR;
      } else if (i === r && i === l) {
        return PrescriptPipe.OVERLAP;
      } else {
        return PrescriptPipe.DEFAULT;
      }
    } else {
      return PrescriptPipe.DEFAULT;
    }
  }
}

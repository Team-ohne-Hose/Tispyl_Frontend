import { Pipe, PipeTransform } from '@angular/core';
import { Observable, map } from 'rxjs';

@Pipe({
  name: 'playerAffiliation',
})
export class PlayerAffiliationPipe implements PipeTransform {
  transform(playerLogin$: Observable<string>, myLoginName: string): Observable<string> {
    return playerLogin$.pipe(
      map((playerLogin: string) => {
        return myLoginName === playerLogin ? 'yours' : 'others';
      })
    );
  }
}

import { Pipe, PipeTransform } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Player } from 'src/app/model/state/Player';
import { MapSchema } from '@colyseus/schema';

@Pipe({
  name: 'asPlayerArray',
})
export class AsPlayerArrayPipe implements PipeTransform {
  transform(playerList$: Observable<MapSchema<Player>>): Observable<Player[]> {
    return playerList$.pipe(
      map((m: Map<string, Player>) => {
        return Array.from(m.values());
      })
    );
  }
}

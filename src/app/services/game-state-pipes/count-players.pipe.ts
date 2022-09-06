import { Pipe, PipeTransform } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Player } from 'src/app/model/state/Player';
import { MapSchema } from '@colyseus/schema';
@Pipe({
  name: 'countPlayers',
})
export class CountPlayersPipe implements PipeTransform {
  transform(playerList$: Observable<MapSchema<Player>>): Observable<number> {
    return playerList$.pipe(
      map((playerList: MapSchema<Player>) => {
        return playerList.size;
      })
    );
  }
}

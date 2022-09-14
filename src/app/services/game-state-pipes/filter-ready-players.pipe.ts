import { Pipe, PipeTransform } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Player } from 'src/app/model/state/Player';
import { MapSchema } from '@colyseus/schema';

@Pipe({
  name: 'filterReadyPlayers',
})
export class FilterReadyPlayersPipe implements PipeTransform {
  transform(playerList$: Observable<MapSchema<Player>>): Observable<number> {
    return playerList$.pipe(
      map((playerList: MapSchema<Player>) => {
        let n = 0;
        playerList.forEach((player: Player) => {
          if (player.isReady) n++;
        });
        return n;
      })
    );
  }
}

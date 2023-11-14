import { Pipe, PipeTransform } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Player } from 'src/app/model/state/Player';

/* PlayerEntry as a mean of abstraction to differ real players from ghosts used to fill the edge of the playerlist */
export interface PlayerEntry {
  player: Player;
  isGhost: boolean;
}

@Pipe({
  name: 'extendPlayerlist',
})
export class ExtendPlayerlistPipe implements PipeTransform {
  transform(players$: Observable<Player[]>, padLength?: number): Observable<PlayerEntry[]> {
    return players$.pipe(
      map((players: Player[]) => {
        // map player Array into the PlayerEntry datastructure
        const playersGhosts: PlayerEntry[] = players.map((player: Player) => {
          return { player: player, isGhost: true };
        });
        const realPlayers: PlayerEntry[] = players.map((player: Player) => {
          return { player: player, isGhost: false };
        });

        // negative indices refer to the end of the array. i.e. -1 is the last element
        if (padLength) {
          return playersGhosts.slice(-padLength, -1).concat(realPlayers, playersGhosts.slice(0, padLength));
        } else {
          return playersGhosts.concat(realPlayers, playersGhosts);
        }
      })
    );
  }
}

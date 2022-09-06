import { Pipe, PipeTransform } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Player } from 'src/app/model/state/Player';

@Pipe({
  name: 'getDisplayName',
})
export class GetDisplayNamePipe implements PipeTransform {
  transform(player$: Observable<Player>): unknown {
    return player$.pipe(
      map((player: Player) => {
        return player;
      })
    );
  }
}

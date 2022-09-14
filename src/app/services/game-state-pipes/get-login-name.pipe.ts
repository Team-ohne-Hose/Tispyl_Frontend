import { Pipe, PipeTransform } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Player } from 'src/app/model/state/Player';

@Pipe({
  name: 'getLoginName',
})
export class GetLoginNamePipe implements PipeTransform {
  transform(player$: Observable<Player>): Observable<string> {
    return player$.pipe(
      map((player: Player) => {
        return player.loginName;
      })
    );
  }
}

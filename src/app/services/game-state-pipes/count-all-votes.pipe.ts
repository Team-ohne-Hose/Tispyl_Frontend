import { Pipe, PipeTransform } from '@angular/core';
import { Observable, map } from 'rxjs';
import { VoteEntry } from 'src/app/components/game/interface/menu-bar/vote-system/helpers/VoteEntry';
import { ArraySchema } from '@colyseus/schema';

@Pipe({
  name: 'countAllVotes',
})
export class CountAllVotesPipe implements PipeTransform {
  transform(voteList$: Observable<ArraySchema<VoteEntry>>): Observable<number> {
    return voteList$.pipe(
      map((voteList: ArraySchema<VoteEntry>) => {
        let voteCount = 0;
        voteList.forEach((voteEntry: VoteEntry) => {
          voteCount += voteEntry.castVotes.length;
        });
        return voteCount;
      })
    );
  }
}

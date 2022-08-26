import { Pipe, PipeTransform } from '@angular/core';
import { MarkdownContentService } from '../../../services/markdown-content.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Pipe({
  name: 'resolveToHeadline',
})
export class ResolveToHeadlinePipe implements PipeTransform {
  constructor(private mdc: MarkdownContentService) {}
  /**
   * Translates markdown file names to their headline
   * @param markdownName name of the file that will be translated through the cache
   */
  transform(markdownName: string): Observable<string> {
    return this.mdc.headlineCache.pipe(map((cache: [string, string][]) => (cache !== undefined ? cache[markdownName] : 'undefined')));
  }
}

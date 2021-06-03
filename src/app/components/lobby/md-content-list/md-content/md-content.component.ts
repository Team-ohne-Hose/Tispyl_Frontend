import { Component } from '@angular/core';
import { MarkdownContentService, SourceDirectory } from '../../../../services/markdown-content.service';

@Component({
  selector: 'app-md-content',
  templateUrl: './md-content.component.html',
  styleUrls: ['./md-content.component.css']
})
export class MdContentComponent {

  mdText = undefined;
  constructor(private mcs: MarkdownContentService) {}


  /**
   * Loads a markdown file based on its name and inlines a parsed version as HTML
   * This inlines arbitrary html and thus is not sanitized or necessarily clean. This should be corrected.
   * TODO: Fix this by adding the additional pipe described in the blog below
   *
   * @see https://medium.com/angular-in-depth/warning-sanitizing-html-stripped-some-content-and-how-to-deal-with-it-properly-10ff77012d5a
   * @param dir source directory on the server
   * @param fileName file name of the file in the source directory
   */
  load(dir: SourceDirectory, fileName: string) {
    this.mcs.getMarkdownFor(dir, fileName).subscribe(
      (md: any) => { this.mdText = md; },
    (error: any) => { console.error(error); }
    );
  }
}

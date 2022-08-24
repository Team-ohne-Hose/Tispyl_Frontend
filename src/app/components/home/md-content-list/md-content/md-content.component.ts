import { Component, SecurityContext, ViewEncapsulation } from '@angular/core';
import { MarkdownContentService, SourceDirectory } from '../../../../services/markdown-content.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-md-content',
  templateUrl: './md-content.component.html',
  styleUrls: ['./md-content.component.css'],
  encapsulation: ViewEncapsulation.None, // no view encapsulation to be able to style the markdown in innerHTML
})
export class MdContentComponent {
  mdText = undefined;
  anchorTag = undefined;
  constructor(private mcs: MarkdownContentService, private sanitizer: DomSanitizer) {}

  /**
   * Loads a markdown file based on its name and inlines a parsed version as HTML
   * @param dir source directory on the server
   * @param fileName file name of the file in the source directory
   */
  load(dir: SourceDirectory, fileName: string): void {
    this.mcs.getMarkdownFor(dir, fileName).subscribe(
      (md: string) => {
        // Treats html as safe html, inline style is forbidden, since it allows for XSS.
        // Define classes in md-content.component.css and use classes!
        this.mdText = this.sanitizer.sanitize(SecurityContext.HTML, md);
        this.anchorTag = fileName;
      },
      (error) => {
        console.error(error);
      }
    );
  }
}

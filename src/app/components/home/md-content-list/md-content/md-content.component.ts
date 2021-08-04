import { Component } from '@angular/core';
import { MarkdownContentService, SourceDirectory } from '../../../../services/markdown-content.service';
import { DomSanitizer } from '@angular/platform-browser';
import { MarkdownToHtmlPipe } from 'markdown-to-html-pipe/src/markdown-to-html.pipe';

@Component({
  selector: 'app-md-content',
  templateUrl: './md-content.component.html',
  styleUrls: ['./md-content.component.css'],
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
        const p = new MarkdownToHtmlPipe();
        this.mdText = this.sanitizer.bypassSecurityTrustHtml(p.transform(md));
        this.anchorTag = fileName;
      },
      (error) => {
        console.error(error);
      }
    );
  }
}

import { Component, OnInit } from '@angular/core';
import { MarkdownContentService, SourceDirectory } from 'src/app/services/markdown-content.service';

@Component({
  selector: 'app-updates',
  templateUrl: './updates.component.html',
  styleUrls: ['./updates.component.css'],
})
export class UpdatesComponent {
  src = SourceDirectory.UPDATES;
  availableUpdates: string[];

  constructor(private mcs: MarkdownContentService) {
    mcs.getAvailableContent(this.src).subscribe((content) => {
      this.availableUpdates = content;
      this.availableUpdates.reverse();
    });
  }
}

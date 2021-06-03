import { Component } from '@angular/core';
import { MarkdownContentService, SourceDirectory } from '../../../services/markdown-content.service';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.css']
})
export class NewsComponent {

  src = SourceDirectory.NEWS;
  availableNews: string[];

  constructor( private mcs: MarkdownContentService ) {
    mcs.getAvailableContent(this.src).subscribe(content => this.availableNews = content );
  }

}

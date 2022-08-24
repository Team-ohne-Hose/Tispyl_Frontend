import {
  AfterViewInit,
  Component,
  ComponentFactory,
  ComponentFactoryResolver,
  ComponentRef,
  ElementRef,
  HostListener,
  Input,
  ViewChild,
} from '@angular/core';
import { MdContentDirective } from './md-content.directive';
import { MarkdownContentService, SourceDirectory } from '../../../services/markdown-content.service';
import { MdContentComponent } from './md-content/md-content.component';

@Component({
  selector: 'app-md-content-list',
  templateUrl: './md-content-list.component.html',
  styleUrls: ['./md-content-list.component.css'],
})
export class MdContentListComponent implements AfterViewInit {
  @Input() src: SourceDirectory;
  @Input() reverse: boolean;
  @ViewChild(MdContentDirective, { static: true }) newsListRef: MdContentDirective;

  availableContent = [];
  latestIdx = 0;
  latestRef: ElementRef = undefined;

  constructor(private factoryResolver: ComponentFactoryResolver, private mcs: MarkdownContentService) {}

  ngAfterViewInit(): void {
    this.triggerNewsRecursion();
  }

  /** Initial trigger to load markdown files recursively */
  triggerNewsRecursion(): void {
    this.mcs.getAvailableContent(this.src).subscribe(
      ((contentList: string[]) => {
        this.availableContent = contentList;
        if (this.reverse) {
          this.availableContent.reverse();
        }
        this.loadNext(contentList, true);
      }).bind(this)
    );
  }

  /** Recursive call that loads tiles until a tile is outside of the viewport */
  loadNext(contentList: string[], continueLoading: boolean): void {
    if (this.latestIdx >= 0 && this.latestIdx < contentList.length) {
      this.addContentTile(contentList[this.latestIdx]);

      this.latestIdx = this.latestIdx + 1;
      if (continueLoading && this.latestIdx < contentList.length) {
        this.loadNext(contentList, this.isBottomInViewport(this.latestRef));
      }
    }
  }

  /**
   * Builds a DOMElement using a ComponentFactory and loads content found under the specified markdown name
   * @param mdContentName file name that should be loaded by the DOMElement
   */
  addContentTile(mdContentName: string): void {
    const factory: ComponentFactory<MdContentComponent> =
      this.factoryResolver.resolveComponentFactory(MdContentComponent);
    const mdContentRef: ComponentRef<MdContentComponent> = this.newsListRef.viewContainerRef.createComponent(factory);
    mdContentRef.instance.load(this.src, mdContentName);
    this.latestRef = mdContentRef.location;
  }

  /** Attach event listener to check if more tiles need to be loaded */
  @HostListener('window:scroll', ['$event'])
  onScroll(): void {
    if (this.latestRef) {
      if (this.isBottomInViewport(this.latestRef) && this.latestIdx < this.availableContent.length) {
        this.loadNext(this.availableContent, true);
      }
    }
  }

  isBottomInViewport(element: ElementRef): boolean {
    const rect = element.nativeElement.getBoundingClientRect();
    return rect.bottom <= (window.innerHeight || document.documentElement.clientHeight);
  }
}

import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appMdContent]',
})
export class MdContentDirective {
  constructor(public viewContainerRef: ViewContainerRef) {}
}

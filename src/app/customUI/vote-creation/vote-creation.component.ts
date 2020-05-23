import {Component, OnInit, TemplateRef} from '@angular/core';
import {CdkStepper} from '@angular/cdk/stepper';

@Component({
  selector: 'app-vote-creation',
  templateUrl: './vote-creation.component.html',
  styleUrls: ['./vote-creation.component.css'],
  providers: [{ provide: CdkStepper, useExisting: VoteCreationComponent }]
})
export class VoteCreationComponent extends CdkStepper {

  controlButtons: TemplateRef<any>;

  onClick(index: number): void {
    this.selectedIndex = index;
  }
}

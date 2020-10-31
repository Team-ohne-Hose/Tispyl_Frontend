import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VoteCreatorComponent } from './vote-creator.component';

describe('VoteCreatorComponent', () => {
  let component: VoteCreatorComponent;
  let fixture: ComponentFixture<VoteCreatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VoteCreatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VoteCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

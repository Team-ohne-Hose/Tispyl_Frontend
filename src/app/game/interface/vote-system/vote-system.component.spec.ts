import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VoteSystemComponent } from './vote-system.component';

describe('VoteSystemComponent', () => {
  let component: VoteSystemComponent;
  let fixture: ComponentFixture<VoteSystemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VoteSystemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VoteSystemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

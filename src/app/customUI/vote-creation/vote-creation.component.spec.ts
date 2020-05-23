import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VoteCreationComponent } from './vote-creation.component';

describe('VoteCreationComponent', () => {
  let component: VoteCreationComponent;
  let fixture: ComponentFixture<VoteCreationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VoteCreationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VoteCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

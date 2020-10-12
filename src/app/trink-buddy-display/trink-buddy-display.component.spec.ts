import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrinkBuddyDisplayComponent } from './trink-buddy-display.component';

describe('TrinkBuddyDisplayComponent', () => {
  let component: TrinkBuddyDisplayComponent;
  let fixture: ComponentFixture<TrinkBuddyDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrinkBuddyDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrinkBuddyDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

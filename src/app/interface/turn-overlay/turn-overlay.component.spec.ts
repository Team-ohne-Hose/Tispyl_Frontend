import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TurnOverlayComponent } from './turn-overlay.component';

describe('TurnOverlayComponent', () => {
  let component: TurnOverlayComponent;
  let fixture: ComponentFixture<TurnOverlayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TurnOverlayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TurnOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

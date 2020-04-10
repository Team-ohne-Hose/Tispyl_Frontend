import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenGamePopupComponent } from './open-game-popup.component';

describe('OpenGamePopupComponent', () => {
  let component: OpenGamePopupComponent;
  let fixture: ComponentFixture<OpenGamePopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OpenGamePopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenGamePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

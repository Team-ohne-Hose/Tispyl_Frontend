import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PregameBannerComponent } from './pregame-banner.component';

describe('PregameBannerComponent', () => {
  let component: PregameBannerComponent;
  let fixture: ComponentFixture<PregameBannerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PregameBannerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PregameBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

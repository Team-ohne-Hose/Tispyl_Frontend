import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GifViewerComponent } from './gif-viewer.component';

describe('GifViewerComponent', () => {
  let component: GifViewerComponent;
  let fixture: ComponentFixture<GifViewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GifViewerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GifViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

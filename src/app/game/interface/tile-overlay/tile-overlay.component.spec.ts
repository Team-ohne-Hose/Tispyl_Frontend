import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TileOverlayComponent } from './tile-overlay.component';

describe('TileOverlayComponent', () => {
  let component: TileOverlayComponent;
  let fixture: ComponentFixture<TileOverlayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TileOverlayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TileOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

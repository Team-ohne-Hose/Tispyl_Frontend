import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DebugdummyComponent } from './debugdummy.component';

describe('DebugdummyComponent', () => {
  let component: DebugdummyComponent;
  let fixture: ComponentFixture<DebugdummyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DebugdummyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DebugdummyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

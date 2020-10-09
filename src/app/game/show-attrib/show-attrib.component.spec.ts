import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowAttribComponent } from './show-attrib.component';

describe('ShowAttribComponent', () => {
  let component: ShowAttribComponent;
  let fixture: ComponentFixture<ShowAttribComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShowAttribComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowAttribComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

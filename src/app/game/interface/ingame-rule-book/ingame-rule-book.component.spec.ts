import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IngameRuleBookComponent } from './ingame-rule-book.component';

describe('IngameRuleBookComponent', () => {
  let component: IngameRuleBookComponent;
  let fixture: ComponentFixture<IngameRuleBookComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IngameRuleBookComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IngameRuleBookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

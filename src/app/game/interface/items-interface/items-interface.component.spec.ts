import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemsInterfaceComponent } from './items-interface.component';

describe('ItemsInterfaceComponent', () => {
  let component: ItemsInterfaceComponent;
  let fixture: ComponentFixture<ItemsInterfaceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItemsInterfaceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemsInterfaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

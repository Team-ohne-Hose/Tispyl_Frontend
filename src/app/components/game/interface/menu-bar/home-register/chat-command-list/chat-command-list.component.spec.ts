import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatCommandListComponent } from './chat-command-list.component';

describe('ChatCommandListComponent', () => {
  let component: ChatCommandListComponent;
  let fixture: ComponentFixture<ChatCommandListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChatCommandListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatCommandListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

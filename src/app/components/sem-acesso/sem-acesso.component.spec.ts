import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SemAcessoComponent } from './sem-acesso.component';

describe('SemAcessoComponent', () => {
  let component: SemAcessoComponent;
  let fixture: ComponentFixture<SemAcessoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SemAcessoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SemAcessoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

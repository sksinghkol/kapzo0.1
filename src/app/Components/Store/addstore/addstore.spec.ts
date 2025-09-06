import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Addstore } from './addstore';

describe('Addstore', () => {
  let component: Addstore;
  let fixture: ComponentFixture<Addstore>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Addstore]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Addstore);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Storelogin } from './storelogin';

describe('Storelogin', () => {
  let component: Storelogin;
  let fixture: ComponentFixture<Storelogin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Storelogin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Storelogin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
